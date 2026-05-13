import AsyncStorage from "@react-native-async-storage/async-storage";
import { mosques as fallbackMosques } from "@/data/mock";
import type { Mosque } from "@/types";

const OVERPASS_URLS = ["https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/api/interpreter"];
const CACHE_KEY_PREFIX = "huzur.nearby-mosques.v1";
const SEARCH_RADIUS_METERS = 8000;
const MAX_MOSQUE_RESULTS = 12;
const OVERPASS_TIMEOUT_MS = 4500;

type MosqueLocation = {
  latitude?: number;
  longitude?: number;
};

type OverpassElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: {
    lat?: number;
    lon?: number;
  };
  tags?: Record<string, string | undefined>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

type MappedMosque = Mosque & {
  latitude: number;
  longitude: number;
  distanceMeters: number;
};

export type NearbyMosquesResult = {
  mosques: Mosque[];
  sourceLabel: string;
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceMeters(fromLat: number, fromLon: number, toLat: number, toLon: number) {
  const earthRadius = 6371000;
  const deltaLat = toRadians(toLat - fromLat);
  const deltaLon = toRadians(toLon - fromLon);
  const lat1 = toRadians(fromLat);
  const lat2 = toRadians(toLat);
  const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return `${Math.max(50, Math.round(distanceMeters / 10) * 10)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(distanceMeters < 10000 ? 1 : 0)} km`;
}

function formatWalkingTime(distanceMeters: number) {
  const minutes = Math.max(2, Math.round(distanceMeters / 83));
  return `${minutes} dk`;
}

function cleanText(value?: string) {
  const text = value?.replace(/\s+/g, " ").trim();
  return text && text.length > 1 ? text : undefined;
}

function buildAddress(tags: Record<string, string | undefined>) {
  const fullAddress = cleanText(tags["addr:full"]);

  if (fullAddress) {
    return fullAddress;
  }

  const street = cleanText(tags["addr:street"]);
  const houseNumber = cleanText(tags["addr:housenumber"]);
  const neighbourhood = cleanText(tags["addr:neighbourhood"]) || cleanText(tags["is_in:neighbourhood"]) || cleanText(tags["addr:suburb"]);
  const district = cleanText(tags["addr:district"]) || cleanText(tags["addr:county"]);
  const city = cleanText(tags["addr:city"]);
  const streetLine = [street, houseNumber].filter(Boolean).join(" ");
  const parts = [neighbourhood, streetLine, district, city].filter(Boolean);

  return parts.length ? parts.slice(0, 3).join(", ") : "Haritada konumlu";
}

function cleanName(value?: string) {
  const name = cleanText(value);

  if (!name) {
    return undefined;
  }

  return name.replace(/\bCami\b$/iu, "Camii").replace(/\bCamisi\b$/iu, "Camii");
}

function buildMosqueName(tags: Record<string, string | undefined>) {
  const directName =
    cleanName(tags["name:tr"]) ||
    cleanName(tags.name) ||
    cleanName(tags.official_name) ||
    cleanName(tags.alt_name) ||
    cleanName(tags.operator);

  if (directName) {
    return directName;
  }

  const neighbourhood = cleanText(tags["addr:neighbourhood"]) || cleanText(tags["is_in:neighbourhood"]) || cleanText(tags["addr:suburb"]);

  if (neighbourhood) {
    return `${neighbourhood} Camii`;
  }

  return undefined;
}

function normalizeCachedMosque(mosque: Mosque): Mosque {
  return {
    ...mosque,
    name: cleanName(mosque.name) || mosque.name,
    address: mosque.address?.startsWith("Adres bilgisi") ? "Haritada konumlu" : mosque.address
  };
}

function buildQuery(latitude: number, longitude: number) {
  return `
    [out:json][timeout:25];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      node["building"="mosque"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      way["building"="mosque"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
      relation["building"="mosque"](around:${SEARCH_RADIUS_METERS},${latitude},${longitude});
    );
    out center tags;
  `;
}

function buildCacheKey(latitude: number, longitude: number) {
  return `${CACHE_KEY_PREFIX}.${latitude.toFixed(3)}.${longitude.toFixed(3)}`;
}

async function readCachedMosques(cacheKey: string) {
  const cachedValue = await AsyncStorage.getItem(cacheKey);
  const cachedMosques = cachedValue ? (JSON.parse(cachedValue) as Mosque[]) : undefined;
  return cachedMosques?.map(normalizeCachedMosque);
}

async function writeCachedMosques(cacheKey: string, mosques: Mosque[]) {
  await AsyncStorage.setItem(cacheKey, JSON.stringify(mosques.map(normalizeCachedMosque)));
}

function mapElements(elements: OverpassElement[], latitude: number, longitude: number) {
  const seen = new Set<string>();

  return elements
    .map((element) => {
      const mosqueLatitude = element.lat ?? element.center?.lat;
      const mosqueLongitude = element.lon ?? element.center?.lon;

      if (typeof mosqueLatitude !== "number" || typeof mosqueLongitude !== "number") {
        return undefined;
      }

      const tags = element.tags || {};
      const name = buildMosqueName(tags);

      if (!name) {
        return undefined;
      }

      const distanceMeters = calculateDistanceMeters(latitude, longitude, mosqueLatitude, mosqueLongitude);
      const dedupeKey = `${name.toLocaleLowerCase("tr-TR")}-${mosqueLatitude.toFixed(4)}-${mosqueLongitude.toFixed(4)}`;

      if (seen.has(dedupeKey)) {
        return undefined;
      }

      seen.add(dedupeKey);

      return {
        id: `${element.type}-${element.id}`,
        name,
        distance: formatDistance(distanceMeters),
        address: buildAddress(tags),
        walkingTime: formatWalkingTime(distanceMeters),
        latitude: mosqueLatitude,
        longitude: mosqueLongitude,
        distanceMeters
      };
    })
    .filter((item): item is MappedMosque => Boolean(item))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, MAX_MOSQUE_RESULTS)
    .map(({ distanceMeters: _distanceMeters, ...mosque }) => mosque);
}

async function fetchWithTimeout(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

  try {
    return await fetch(url, {
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getCachedNearbyMosques(location: MosqueLocation): Promise<NearbyMosquesResult | undefined> {
  if (typeof location.latitude !== "number" || typeof location.longitude !== "number") {
    return undefined;
  }

  const cacheKey = buildCacheKey(location.latitude, location.longitude);
  const cachedMosques = await readCachedMosques(cacheKey);

  if (!cachedMosques?.length) {
    return undefined;
  }

  return {
    mosques: cachedMosques,
    sourceLabel: "Kaydedilmiş camiler"
  };
}

export async function fetchNearbyMosques(location: MosqueLocation): Promise<NearbyMosquesResult> {
  if (typeof location.latitude !== "number" || typeof location.longitude !== "number") {
    return {
      mosques: fallbackMosques.map(normalizeCachedMosque),
      sourceLabel: "Örnek camiler"
    };
  }

  const cacheKey = buildCacheKey(location.latitude, location.longitude);

  try {
    let payload: OverpassResponse | undefined;
    const query = encodeURIComponent(buildQuery(location.latitude, location.longitude));

    for (const endpoint of OVERPASS_URLS) {
      try {
        const response = await fetchWithTimeout(`${endpoint}?data=${query}`);

        if (!response.ok) {
          continue;
        }

        payload = (await response.json()) as OverpassResponse;
        break;
      } catch {
        // Bir sonraki Overpass aynasına geç.
      }
    }

    if (!payload) {
      throw new Error("Cami servisi yanıt vermedi.");
    }

    const nearbyMosques = mapElements(payload.elements || [], location.latitude, location.longitude);

    if (!nearbyMosques.length) {
      throw new Error("Yakında cami bulunamadı.");
    }

    await writeCachedMosques(cacheKey, nearbyMosques);

    return {
      mosques: nearbyMosques,
      sourceLabel: "Konuma göre sıralandı"
    };
  } catch {
    const cachedMosques = await readCachedMosques(cacheKey);

    if (cachedMosques?.length) {
      return {
        mosques: cachedMosques,
        sourceLabel: "Kaydedilmiş camiler"
      };
    }

    return {
      mosques: fallbackMosques.map(normalizeCachedMosque),
      sourceLabel: "Örnek camiler"
    };
  }
}
