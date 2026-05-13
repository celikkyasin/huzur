import { surahDetails } from "@/data/mock";
import type { Surah, SurahDetail, SurahVerse } from "@/types";

type QuranAyah = {
  text: string;
  numberInSurah: number;
};

type QuranEditionResponse = {
  ayahs: QuranAyah[];
};

type QuranResponse = {
  code: number;
  data: QuranEditionResponse[];
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
  text?: string;
  arabic_text?: string | null;
  translation?: {
    text?: string;
  };
  arabic_script?: {
    text?: string;
  };
};

type DiyanetCollectionResponse<T> =
  | T[]
  | {
      data?: T[];
    };

const AL_QURAN_API_BASE = "https://api.alquran.cloud/v1";
const TURKISH_EDITION = "tr.diyanet";
const DIYANET_API_BASE =
  process.env.EXPO_PUBLIC_DIB_KURAN_API_BASE_URL ?? "https://t061.diyanet.gov.tr/apigateway/acikkaynakkuran";
const DIYANET_API_TOKEN = process.env.EXPO_PUBLIC_DIB_KURAN_API_TOKEN;

function requireDiyanetToken() {
  if (!DIYANET_API_TOKEN) {
    throw new Error("Diyanet API anahtarı bulunamadı.");
  }
}

async function fetchDiyanetJson<T>(path: string): Promise<T> {
  requireDiyanetToken();

  const response = await fetch(`${DIYANET_API_BASE}${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${DIYANET_API_TOKEN}`
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

  return `${surah.name} ${ayahNumber}. ayet, surenin ${surah.revelationPlace} dönemindeki ana mesajı içinde okunur. Meal üzerinde tefekkür ederken ayetin iman, kulluk, ahiret bilinci ve güzel ahlakla ilişkisine dikkat edebilirsiniz.`;
}

function getDiyanetVerseNumber(verse: DiyanetVerse) {
  return verse.verse_number ?? verse.verse_id_in_surah;
}

function mapDiyanetVerse(surah: SurahDetail, verse: DiyanetVerse): SurahVerse {
  const ayahNumber = getDiyanetVerseNumber(verse) ?? 1;
  const localVerse = surah.versesText.find((item) => item.number === ayahNumber);

  return {
    number: ayahNumber,
    arabic: verse.arabic_text ?? verse.arabic_script?.text ?? localVerse?.arabic ?? surah.arabicName,
    translation: verse.text ?? verse.translation?.text ?? localVerse?.translation ?? "Türkçe meal hazırlanıyor.",
    explanation: createExplanation(surah, ayahNumber, localVerse?.explanation)
  };
}

function mapDiyanetVerses(surah: SurahDetail, verses: DiyanetVerse[]): SurahVerse[] {
  return verses
    .filter((verse) => getDiyanetVerseNumber(verse))
    .filter((verse, index, self) => {
      const ayahNumber = getDiyanetVerseNumber(verse);
      return index === self.findIndex((item) => getDiyanetVerseNumber(item) === ayahNumber);
    })
    .map((verse) => mapDiyanetVerse(surah, verse));
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
  const payload = await fetchDiyanetJson<DiyanetCollectionResponse<DiyanetChapter>>("/api/v1/chapters?language=tr");
  const chapters = getCollection(payload);

  if (!chapters.length) {
    throw new Error("Diyanet sure listesi boş geldi.");
  }

  return chapters.map(mapDiyanetChapter);
}

async function fetchDiyanetSurahVerses(surah: SurahDetail): Promise<SurahVerse[]> {
  const payload = await fetchDiyanetJson<DiyanetCollectionResponse<DiyanetVerse>>(
    `/api/v1/chapters/${surah.number}?language_id=1`
  );
  const verses = getCollection(payload);

  if (!verses.length) {
    throw new Error("Diyanet ayet verisi eksik geldi.");
  }

  return mapDiyanetVerses(surah, verses);
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
      explanation: createExplanation(surah, ayahNumber, localVerse?.explanation)
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

export async function fetchJuzVerses(juzId: number, surah: SurahDetail = surahDetails[0]): Promise<SurahVerse[]> {
  const payload = await fetchDiyanetJson<DiyanetCollectionResponse<DiyanetVerse>>(`/api/v1/juz/${juzId}?language_id=1`);
  return mapDiyanetVerses(surah, getCollection(payload));
}

export async function fetchPageVerses(pageNumber: number, surah: SurahDetail = surahDetails[0]): Promise<SurahVerse[]> {
  const payload = await fetchDiyanetJson<DiyanetCollectionResponse<DiyanetVerse>>(
    `/api/v1/verses/page/${pageNumber}?language_id=1`
  );
  return mapDiyanetVerses(surah, getCollection(payload));
}
