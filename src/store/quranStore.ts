import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import type { SurahVerse } from "@/types";

const SAVED_VERSES_KEY = "huzur.quran.saved-verses.v1";
const READING_SETTINGS_KEY = "huzur.quran.reading-settings.v1";

export type SavedQuranVerse = SurahVerse & {
  id: string;
  surahId: string;
  surahName: string;
};

type QuranReadingSettings = {
  fontScale: number;
  showTranslation: boolean;
  showExplanation: boolean;
};

type QuranState = QuranReadingSettings & {
  savedVerses: SavedQuranVerse[];
  isHydrated: boolean;
  hydrateQuran: () => Promise<void>;
  isVerseSaved: (surahId: string, verseNumber: number) => boolean;
  toggleSavedVerse: (verse: Omit<SavedQuranVerse, "id">) => Promise<void>;
  setFontScale: (fontScale: number) => Promise<void>;
  toggleTranslation: () => Promise<void>;
  toggleExplanation: () => Promise<void>;
};

const defaultSettings: QuranReadingSettings = {
  fontScale: 1,
  showTranslation: true,
  showExplanation: true
};

async function persistSettings(settings: QuranReadingSettings) {
  await AsyncStorage.setItem(READING_SETTINGS_KEY, JSON.stringify(settings));
}

export const useQuranStore = create<QuranState>((set, get) => ({
  savedVerses: [],
  isHydrated: false,
  ...defaultSettings,

  hydrateQuran: async () => {
    try {
      const [savedValue, settingsValue] = await Promise.all([AsyncStorage.getItem(SAVED_VERSES_KEY), AsyncStorage.getItem(READING_SETTINGS_KEY)]);
      const savedVerses = savedValue ? (JSON.parse(savedValue) as SavedQuranVerse[]) : [];
      const settings = settingsValue ? { ...defaultSettings, ...(JSON.parse(settingsValue) as Partial<QuranReadingSettings>) } : defaultSettings;

      set({ savedVerses, ...settings, isHydrated: true });
    } catch {
      set({ savedVerses: [], ...defaultSettings, isHydrated: true });
    }
  },

  isVerseSaved: (surahId, verseNumber) => get().savedVerses.some((verse) => verse.surahId === surahId && verse.number === verseNumber),

  toggleSavedVerse: async (verse) => {
    const id = `${verse.surahId}:${verse.number}`;
    const currentSavedVerses = get().savedVerses;
    const savedVerses = currentSavedVerses.some((item) => item.id === id)
      ? currentSavedVerses.filter((item) => item.id !== id)
      : [{ ...verse, id }, ...currentSavedVerses];

    set({ savedVerses });
    await AsyncStorage.setItem(SAVED_VERSES_KEY, JSON.stringify(savedVerses));
  },

  setFontScale: async (fontScale) => {
    const settings = {
      fontScale,
      showTranslation: get().showTranslation,
      showExplanation: get().showExplanation
    };

    set(settings);
    await persistSettings(settings);
  },

  toggleTranslation: async () => {
    const settings = {
      fontScale: get().fontScale,
      showTranslation: !get().showTranslation,
      showExplanation: get().showExplanation
    };

    set(settings);
    await persistSettings(settings);
  },

  toggleExplanation: async () => {
    const settings = {
      fontScale: get().fontScale,
      showTranslation: get().showTranslation,
      showExplanation: !get().showExplanation
    };

    set(settings);
    await persistSettings(settings);
  }
}));
