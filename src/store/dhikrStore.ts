import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DhikrOption = {
  id: string;
  label: string;
  audioAsset: number;
  reciter: string;
};

export const dhikrOptions: DhikrOption[] = [
  {
    id: "subhanallah",
    label: "Subhanallah",
    reciter: "Ses kaydı",
    audioAsset: require("../../assets/audio/dhikr/subhanallah.mp3")
  },
  {
    id: "allahu-ekber",
    label: "Allahu Ekber",
    reciter: "Ses kaydı",
    audioAsset: require("../../assets/audio/dhikr/allahu-ekber.mp3")
  },
  {
    id: "la-ilahe-illallah",
    label: "La İlahe İllallah",
    reciter: "Ses kaydı",
    audioAsset: require("../../assets/audio/dhikr/la-ilahe-illallah.mp3")
  },
  {
    id: "elhamdulillah",
    label: "Elhamdülillah",
    reciter: "Ses kaydı",
    audioAsset: require("../../assets/audio/dhikr/elhamdulillah.mp3")
  }
];

type DhikrState = {
  count: number;
  target: number;
  selectedDhikrId: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  increment: () => void;
  reset: () => void;
  selectDhikr: (id: string) => void;
  toggleSound: () => void;
  toggleVibration: () => void;
};

function isValidDhikrId(id?: string) {
  return dhikrOptions.some((item) => item.id === id);
}

export const useDhikrStore = create<DhikrState>()(
  persist(
    (set) => ({
      count: 0,
      target: 99,
      selectedDhikrId: dhikrOptions[0].id,
      soundEnabled: false,
      vibrationEnabled: true,
      increment: () => set((state) => ({ count: Math.min(state.count + 1, state.target) })),
      reset: () => set({ count: 0 }),
      selectDhikr: (id) => set({ selectedDhikrId: isValidDhikrId(id) ? id : dhikrOptions[0].id, count: 0 }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleVibration: () => set((state) => ({ vibrationEnabled: !state.vibrationEnabled }))
    }),
    {
      name: "huzur.dhikr.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        count: state.count,
        target: state.target,
        selectedDhikrId: state.selectedDhikrId,
        soundEnabled: state.soundEnabled,
        vibrationEnabled: state.vibrationEnabled
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<DhikrState>;
        const target = Number(persisted.target ?? currentState.target) || 99;

        return {
          ...currentState,
          ...persisted,
          target,
          selectedDhikrId: isValidDhikrId(persisted.selectedDhikrId) ? String(persisted.selectedDhikrId) : dhikrOptions[0].id,
          count: Math.min(Math.max(Number(persisted.count ?? currentState.count) || 0, 0), target)
        };
      }
    }
  )
);
