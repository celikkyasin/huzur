import AsyncStorage from "@react-native-async-storage/async-storage";
import { prayerTimes as fallbackPrayerTimes } from "@/data/mock";
import type { PrayerTime } from "@/types";

const API_BASE_URL = "https://namazvakti.mtopal.dev";
const CACHE_KEY_PREFIX = "huzur.prayer-times.v1";

const PRAYER_LABELS = {
  imsak: "İmsak",
  gunes: "Güneş",
  ogle: "Öğle",
  ikindi: "İkindi",
  aksam: "Akşam",
  yatsi: "Yatsı"
} as const;

type Entity = Record<string, string | number | undefined>;

type DiyanetPrayerDay = {
  Imsak?: string;
  Gunes?: string;
  Ogle?: string;
  Ikindi?: string;
  Aksam?: string;
  Yatsi?: string;
  MiladiTarihKisa?: string;
  MiladiTarihUzun?: string;
  MiladiTarihUzunIso8601?: string;
};

export type PrayerTimesLocation = {
  city?: string;
  district?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

export type PrayerTimesResult = {
  times: PrayerTime[];
  sourceLabel: string;
  dateLabel?: string;
  placeLabel?: string;
};

function normalizeText(value?: string) {
  return (value || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getEntityName(entity: Entity) {
  return String(entity.UlkeAdi || entity.SehirAdi || entity.IlceAdi || entity.name || entity.ad || "");
}

function getEntityEnglishName(entity: Entity) {
  return String(entity.UlkeAdiEn || entity.SehirAdiEn || entity.IlceAdiEn || "");
}

function getEntityId(entity: Entity) {
  return String(entity.UlkeID || entity.SehirID || entity.IlceID || entity.id || "");
}

function findEntity(entities: Entity[], target?: string, fallback?: (entity: Entity) => boolean) {
  const normalizedTarget = normalizeText(target);

  if (normalizedTarget) {
    const exact = entities.find((entity) => normalizeText(getEntityName(entity)) === normalizedTarget || normalizeText(getEntityEnglishName(entity)) === normalizedTarget);
    if (exact) {
      return exact;
    }

    const partial = entities.find((entity) => {
      const name = normalizeText(getEntityName(entity));
      const englishName = normalizeText(getEntityEnglishName(entity));
      return name.includes(normalizedTarget) || normalizedTarget.includes(name) || englishName.includes(normalizedTarget);
    });

    if (partial) {
      return partial;
    }
  }

  return fallback ? entities.find(fallback) : entities[0];
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Vakit servisi yanıt vermedi: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function formatTodayKey(date = new Date()) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${date.getFullYear()}`;
}

function parseTime(value?: string) {
  const match = value?.match(/(\d{1,2})[:.](\d{2})/);
  if (!match) {
    return undefined;
  }

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function mapPrayerDay(day: DiyanetPrayerDay): PrayerTime[] {
  const mapped = [
    { id: "imsak", name: PRAYER_LABELS.imsak, time: parseTime(day.Imsak) },
    { id: "gunes", name: PRAYER_LABELS.gunes, time: parseTime(day.Gunes) },
    { id: "ogle", name: PRAYER_LABELS.ogle, time: parseTime(day.Ogle) },
    { id: "ikindi", name: PRAYER_LABELS.ikindi, time: parseTime(day.Ikindi) },
    { id: "aksam", name: PRAYER_LABELS.aksam, time: parseTime(day.Aksam) },
    { id: "yatsi", name: PRAYER_LABELS.yatsi, time: parseTime(day.Yatsi) }
  ];

  if (mapped.some((item) => !item.time)) {
    throw new Error("Vakit verisi eksik geldi.");
  }

  return mapped.map((item) => ({ id: item.id, name: item.name, time: item.time || "" }));
}

function selectToday(days: DiyanetPrayerDay[]) {
  const todayKey = formatTodayKey();
  return days.find((day) => day.MiladiTarihKisa === todayKey) || days[0];
}

function buildCacheKey(location: PrayerTimesLocation) {
  const locationPart = normalizeText(`${location.country || "Türkiye"} ${location.city || ""} ${location.district || ""}`) || "varsayilan";
  return `${CACHE_KEY_PREFIX}.${formatTodayKey()}.${locationPart}`;
}

async function readCachedResult(cacheKey: string) {
  const cachedValue = await AsyncStorage.getItem(cacheKey);
  return cachedValue ? (JSON.parse(cachedValue) as PrayerTimesResult) : undefined;
}

async function writeCachedResult(cacheKey: string, result: PrayerTimesResult) {
  await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
}

export async function fetchPrayerTimesForLocation(location: PrayerTimesLocation): Promise<PrayerTimesResult> {
  const cacheKey = buildCacheKey(location);

  try {
    const countries = await fetchJson<Entity[]>("/ulkeler");
    const country = findEntity(countries, location.country || "Türkiye", (entity) => normalizeText(getEntityName(entity)) === "turkiye");
    const countryId = getEntityId(country || {});

    const cities = await fetchJson<Entity[]>(`/sehirler/${countryId}`);
    const city = findEntity(cities, location.city);
    const cityId = getEntityId(city || {});

    const districts = await fetchJson<Entity[]>(`/ilceler/${cityId}`);
    const cityName = getEntityName(city || {});
    const district = findEntity(
      districts,
      location.district,
      (entity) => normalizeText(getEntityName(entity)) === normalizeText(cityName) || normalizeText(getEntityName(entity)).includes("merkez")
    );
    const districtId = getEntityId(district || {});

    const days = await fetchJson<DiyanetPrayerDay[]>(`/vakitler/${districtId}`);
    const today = selectToday(days);
    const result: PrayerTimesResult = {
      times: mapPrayerDay(today),
      sourceLabel: "Diyanet vakitleri",
      dateLabel: today.MiladiTarihUzun || today.MiladiTarihKisa,
      placeLabel: [getEntityName(district || {}), cityName].filter(Boolean).join(", ")
    };

    await writeCachedResult(cacheKey, result);
    return result;
  } catch {
    const cached = await readCachedResult(cacheKey);

    if (cached) {
      return {
        ...cached,
        sourceLabel: "Kaydedilmiş vakitler"
      };
    }

    return {
      times: fallbackPrayerTimes,
      sourceLabel: "Örnek vakitler",
      dateLabel: undefined,
      placeLabel: location.city
    };
  }
}
