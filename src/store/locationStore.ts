import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { create } from "zustand";

const STORAGE_KEY = "huzur.location-state.v1";

type StoredLocationState = {
  hasAskedLocationPermission: boolean;
  permissionStatus: Location.PermissionStatus | "unknown";
  city?: string;
  district?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

type LocationState = StoredLocationState & {
  isHydrated: boolean;
  isLoading: boolean;
  errorMessage?: string;
  displayPlace: string;
  hydrateLocation: () => Promise<void>;
  requestLocationPermission: () => Promise<void>;
  refreshLocation: () => Promise<void>;
};

const fallbackState: StoredLocationState = {
  hasAskedLocationPermission: false,
  permissionStatus: "unknown",
  city: "Konum bekleniyor",
  country: "Türkiye"
};

function getDisplayPlace(state: StoredLocationState) {
  if (state.city && state.city !== "Konum bekleniyor") {
    return state.country ? `${state.city}, ${state.country}` : state.city;
  }

  if (state.permissionStatus === Location.PermissionStatus.DENIED) {
    return "Konum izni kapalı";
  }

  return "Konum bekleniyor";
}

async function persistLocationState(state: StoredLocationState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function resolveCurrentLocation(): Promise<StoredLocationState> {
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced
  });

  let city = "Bulunduğunuz konum";
  let district: string | undefined;
  let country = "Türkiye";

  try {
    const [address] = await Location.reverseGeocodeAsync(position.coords);
    city = address?.city || address?.region || address?.subregion || city;
    district = address?.district || address?.subregion || undefined;
    country = address?.country || country;
  } catch {
    city = "Bulunduğunuz konum";
  }

  return {
    hasAskedLocationPermission: true,
    permissionStatus: Location.PermissionStatus.GRANTED,
    city,
    district,
    country,
    latitude: position.coords.latitude,
    longitude: position.coords.longitude
  };
}

export const useLocationStore = create<LocationState>((set, get) => ({
  ...fallbackState,
  isHydrated: false,
  isLoading: false,
  displayPlace: getDisplayPlace(fallbackState),

  hydrateLocation: async () => {
    try {
      const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
      const storedState = storedValue ? (JSON.parse(storedValue) as StoredLocationState) : fallbackState;

      set({
        ...storedState,
        isHydrated: true,
        displayPlace: getDisplayPlace(storedState)
      });

      if (!storedState.hasAskedLocationPermission) {
        await get().requestLocationPermission();
      }
    } catch {
      set({
        ...fallbackState,
        isHydrated: true,
        errorMessage: "Konum bilgisi hazırlanamadı.",
        displayPlace: getDisplayPlace(fallbackState)
      });
    }
  },

  requestLocationPermission: async () => {
    set({ isLoading: true, errorMessage: undefined });

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== Location.PermissionStatus.GRANTED) {
        const deniedState: StoredLocationState = {
          ...get(),
          hasAskedLocationPermission: true,
          permissionStatus: status,
          city: undefined,
          district: undefined,
          country: undefined,
          latitude: undefined,
          longitude: undefined
        };

        await persistLocationState(deniedState);
        set({
          ...deniedState,
          isLoading: false,
          errorMessage: "Namaz vakitleri ve yakındaki camiler için konum izni gereklidir.",
          displayPlace: getDisplayPlace(deniedState)
        });
        return;
      }

      const locationState = await resolveCurrentLocation();
      await persistLocationState(locationState);
      set({
        ...locationState,
        isLoading: false,
        displayPlace: getDisplayPlace(locationState)
      });
    } catch {
      const unavailableState: StoredLocationState = {
        ...get(),
        hasAskedLocationPermission: true,
        permissionStatus: "unknown"
      };

      await persistLocationState(unavailableState);
      set({
        ...unavailableState,
        isLoading: false,
        errorMessage: "Konum alınamadı. Lütfen bağlantınızı ve konum ayarlarınızı kontrol edin.",
        displayPlace: getDisplayPlace(unavailableState)
      });
    }
  },

  refreshLocation: async () => {
    if (get().permissionStatus !== Location.PermissionStatus.GRANTED) {
      await get().requestLocationPermission();
      return;
    }

    set({ isLoading: true, errorMessage: undefined });

    try {
      const locationState = await resolveCurrentLocation();
      await persistLocationState(locationState);
      set({
        ...locationState,
        isLoading: false,
        displayPlace: getDisplayPlace(locationState)
      });
    } catch {
      set({
        isLoading: false,
        errorMessage: "Konum güncellenemedi."
      });
    }
  }
}));
