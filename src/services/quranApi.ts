import { surahDetails } from "@/data/mock";
import type { Surah, SurahDetail, SurahVerse } from "@/types";

type QuranAyah = {
  text: string;
  numberInSurah: number;
  surah?: {
    number: number;
    name?: string;
  };
};

type QuranEditionResponse = {
  ayahs: QuranAyah[];
};

type QuranResponse = {
  code: number;
  data: QuranEditionResponse[];
};

type QuranJuzResponse = {
  code: number;
  data?: {
    ayahs?: QuranAyah[];
  };
};

type DiyanetChapter = {
  id: number;
  name_turkish?: string;
  name_arabic?: string;
  verse_count?: number;
  revelation_order?: number;
  first_page?: number;
};

type DiyanetVerse = {
  verse_number?: number;
  verse_id_in_surah?: number;
  chapter_id?: number;
  chapterId?: number;
  surah_id?: number;
  surahId?: number;
  text?: string;
  arabic_text?: string | null;
  verse_key?: string;
  page_number?: number;
  juz_number?: number;
  translation?: {
    text?: string;
  };
  arabic_script?: {
    text?: string;
  };
  chapter?: {
    id?: number;
    name_turkish?: string;
  };
  surah?: {
    id?: number;
    name_turkish?: string;
  };
};

type DiyanetCollectionResponse<T> =
  | T[]
  | {
      data?: T[];
    };

const AL_QURAN_API_BASE = "https://api.alquran.cloud/v1";
const TURKISH_EDITION = "tr.diyanet";
const APP_API_URL = process.env.EXPO_PUBLIC_REWARDS_API_URL;

function getAppApiUrl() {
  return APP_API_URL?.trim().replace(/\/$/, "");
}

function buildApiRequestUrl(apiUrl: string, path: string) {
  if (path.startsWith("/quran/")) {
    const [routePart, query = ""] = path.replace(/^\/quran\//, "").split("?");
    const params = new URLSearchParams(query);
    params.set("route", routePart);
    return `${apiUrl}/api/quran?${params.toString()}`;
  }

  return `${apiUrl}${path}`;
}

async function fetchDiyanetJson<T>(path: string): Promise<T> {
  const apiUrl = getAppApiUrl();

  if (!apiUrl) {
    throw new Error("Kur'an API adresi bulunamadı.");
  }

  const response = await fetch(buildApiRequestUrl(apiUrl, path), {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Diyanet verisi alınamadı.");
  }

  return response.json() as Promise<T>;
}

function getCollection<T>(payload: DiyanetCollectionResponse<T>) {
  return Array.isArray(payload) ? payload : payload.data ?? [];
}

function createExplanation(surah: SurahDetail, ayahNumber: number, localExplanation?: string) {
  if (localExplanation) {
    return localExplanation;
  }

  return `${surah.name} ${ayahNumber}. ayet, surenin ${surah.revelationPlace} dönemindeki ana mesajı içinde okunur.`;
}

function getDiyanetVerseNumber(verse: DiyanetVerse) {
  return verse.verse_number ?? verse.verse_id_in_surah;
}

function getDiyanetChapterId(verse: DiyanetVerse) {
  return verse.chapter_id ?? verse.chapterId ?? verse.surah_id ?? verse.surahId ?? verse.chapter?.id ?? verse.surah?.id;
}

function getDiyanetSurahName(verse: DiyanetVerse, localSurah?: SurahDetail) {
  const chapterId = getDiyanetChapterId(verse);
  const catalogSurah = chapterId ? surahDetails.find((item) => item.number === chapterId) : undefined;
  return verse.chapter?.name_turkish ?? verse.surah?.name_turkish ?? localSurah?.name ?? catalogSurah?.name;
}

function mapDiyanetVerse(verse: DiyanetVerse, surah?: SurahDetail): SurahVerse {
  const ayahNumber = getDiyanetVerseNumber(verse) ?? 1;
  const chapterId = getDiyanetChapterId(verse) ?? surah?.number;
  const catalogSurah = chapterId ? surahDetails.find((item) => item.number === chapterId) : undefined;
  const localSurah = catalogSurah ?? surah;
  const localVerse = localSurah?.versesText.find((item) => item.number === ayahNumber);

  return {
    number: ayahNumber,
    arabic: verse.arabic_text ?? verse.arabic_script?.text ?? localVerse?.arabic ?? localSurah?.arabicName ?? "",
    translation: verse.text ?? verse.translation?.text ?? localVerse?.translation ?? "Türkçe meal hazırlanıyor.",
    explanation: localSurah ? createExplanation(localSurah, ayahNumber, localVerse?.explanation) : "",
    surahNumber: chapterId,
    surahName: getDiyanetSurahName(verse, localSurah),
    verseKey: verse.verse_key ?? (chapterId ? `${chapterId}:${ayahNumber}` : undefined),
    pageNumber: verse.page_number,
    juzNumber: verse.juz_number
  };
}

function mapDiyanetVerses(verses: DiyanetVerse[], surah?: SurahDetail): SurahVerse[] {
  return verses
    .filter((verse) => getDiyanetVerseNumber(verse))
    .filter((verse, index, self) => {
      const ayahNumber = getDiyanetVerseNumber(verse);
      const chapterId = getDiyanetChapterId(verse);
      return index === self.findIndex((item) => getDiyanetVerseNumber(item) === ayahNumber && getDiyanetChapterId(item) === chapterId);
    })
    .map((verse) => mapDiyanetVerse(verse, surah));
}

async function fetchAlQuranJuzArabic(juzId: number) {
  const response = await fetch(`${AL_QURAN_API_BASE}/juz/${juzId}/quran-uthmani`);

  if (!response.ok) {
    throw new Error("Arapça cüz metni alınamadı.");
  }

  const payload = (await response.json()) as QuranJuzResponse;
  const ayahs = payload.data?.ayahs ?? [];

  if (payload.code !== 200 || !ayahs.length) {
    throw new Error("Arapça cüz metni eksik geldi.");
  }

  return new Map(ayahs.map((ayah) => [`${ayah.surah?.number}:${ayah.numberInSurah}`, ayah.text.replace(/^\uFEFF/, "")]));
}

async function fetchAlQuranJuzVerses(juzId: number): Promise<SurahVerse[]> {
  const [arabicResponse, turkishResponse] = await Promise.all([
    fetch(`${AL_QURAN_API_BASE}/juz/${juzId}/quran-uthmani`),
    fetch(`${AL_QURAN_API_BASE}/juz/${juzId}/${TURKISH_EDITION}`)
  ]);

  if (!arabicResponse.ok || !turkishResponse.ok) {
    throw new Error("Cüz verisi alınamadı.");
  }

  const arabicPayload = (await arabicResponse.json()) as QuranJuzResponse;
  const turkishPayload = (await turkishResponse.json()) as QuranJuzResponse;
  const arabicAyahs = arabicPayload.data?.ayahs ?? [];
  const turkishAyahs = turkishPayload.data?.ayahs ?? [];

  if (arabicPayload.code !== 200 || turkishPayload.code !== 200 || !arabicAyahs.length || !turkishAyahs.length) {
    throw new Error("Cüz verisi eksik geldi.");
  }

  return arabicAyahs.map((ayah, index) => {
    const surahNumber = ayah.surah?.number;
    const localSurah = surahNumber ? surahDetails.find((item) => item.number === surahNumber) : undefined;
    const ayahNumber = ayah.numberInSurah;

    return {
      number: ayahNumber,
      arabic: ayah.text.replace(/^\uFEFF/, ""),
      translation: turkishAyahs[index]?.text ?? "Türkçe meal hazırlanıyor.",
      explanation: "",
      surahNumber,
      surahName: localSurah?.name ?? ayah.surah?.name,
      verseKey: surahNumber ? `${surahNumber}:${ayahNumber}` : undefined,
      juzNumber: juzId
    };
  });
}

function mapDiyanetChapter(chapter: DiyanetChapter): Surah {
  const localSurah = surahDetails.find((item) => item.number === chapter.id) ?? surahDetails[chapter.id - 1];

  return {
    id: localSurah?.id ?? `sure-${chapter.id}`,
    number: chapter.id,
    name: chapter.name_turkish ?? localSurah?.name ?? `${chapter.id}. Sure`,
    arabicName: chapter.name_arabic ?? localSurah?.arabicName ?? "",
    meaning: localSurah?.meaning ?? "Kur'an-ı Kerim",
    verses: chapter.verse_count ?? localSurah?.verses ?? 0,
    duration: localSurah?.duration ?? "Sesli",
    revelationPlace: localSurah?.revelationPlace ?? "Bilgi hazırlanıyor",
    audioUri: localSurah?.audioUri ?? ""
  };
}

async function fetchDiyanetChapters(): Promise<Surah[]> {
  const payload = await fetchDiyanetJson<DiyanetCollectionResponse<DiyanetChapter>>("/quran/chapters");
  const chapters = getCollection(payload);

  if (!chapters.length) {
    throw new Error("Diyanet sure listesi boş geldi.");
  }

  return chapters.map(mapDiyanetChapter);
}

async function fetchDiyanetSurahVerses(surah: SurahDetail): Promise<SurahVerse[]> {
  const payload = await fetchDiyanetJson<DiyanetCollectionResponse<DiyanetVerse>>(`/quran/chapter?chapter=${surah.number}`);
  const verses = getCollection(payload);

  if (!verses.length) {
    throw new Error("Diyanet ayet verisi eksik geldi.");
  }

  return mapDiyanetVerses(verses, surah);
}

async function fetchAlQuranSurahVerses(surah: SurahDetail): Promise<SurahVerse[]> {
  const response = await fetch(`${AL_QURAN_API_BASE}/surah/${surah.number}/editions/quran-uthmani,${TURKISH_EDITION}`);

  if (!response.ok) {
    throw new Error("Ayetler alınamadı.");
  }

  const payload = (await response.json()) as QuranResponse;
  const arabicEdition = payload.data?.[0];
  const turkishEdition = payload.data?.[1];

  if (payload.code !== 200 || !arabicEdition?.ayahs?.length || !turkishEdition?.ayahs?.length) {
    throw new Error("Ayet verisi eksik geldi.");
  }

  return arabicEdition.ayahs.map((ayah, index) => {
    const ayahNumber = ayah.numberInSurah;
    const localVerse = surah.versesText.find((item) => item.number === ayahNumber);

    return {
      number: ayahNumber,
      arabic: ayah.text.replace(/^\uFEFF/, ""),
      translation: turkishEdition.ayahs[index]?.text ?? localVerse?.translation ?? "Türkçe meal hazırlanıyor.",
      explanation: createExplanation(surah, ayahNumber, localVerse?.explanation),
      surahNumber: surah.number,
      surahName: surah.name,
      verseKey: `${surah.number}:${ayahNumber}`
    };
  });
}

export async function fetchQuranChapters(): Promise<Surah[]> {
  try {
    return await fetchDiyanetChapters();
  } catch {
    return surahDetails.map(({ description, revelationStory, versesText, ...surah }) => surah);
  }
}

export async function fetchSurahVerses(surah: SurahDetail): Promise<SurahVerse[]> {
  try {
    return await fetchDiyanetSurahVerses(surah);
  } catch {
    return fetchAlQuranSurahVerses(surah);
  }
}

export async function fetchJuzVerses(juzId: number, surah?: SurahDetail): Promise<SurahVerse[]> {
  let verses: SurahVerse[];

  try {
    const payload = await fetchDiyanetJson<DiyanetCollectionResponse<DiyanetVerse>>(`/quran/juz?juz=${juzId}`);
    verses = mapDiyanetVerses(getCollection(payload), surah);
  } catch {
    return fetchAlQuranJuzVerses(juzId);
  }

  try {
    const cleanArabicByKey = await fetchAlQuranJuzArabic(juzId);
    return verses.map((verse) => ({
      ...verse,
      arabic: cleanArabicByKey.get(verse.verseKey ?? "") ?? verse.arabic
    }));
  } catch {
    return verses;
  }
}

export async function fetchPageVerses(pageNumber: number, surah?: SurahDetail): Promise<SurahVerse[]> {
  const payload = await fetchDiyanetJson<DiyanetCollectionResponse<DiyanetVerse>>(`/quran/page?page=${pageNumber}`);
  return mapDiyanetVerses(getCollection(payload), surah);
}
