import { create } from "zustand";

export type DhikrOption = {
  id: string;
  label: string;
  audioAsset?: number;
  reciter: string;
};

export const dhikrOptions: DhikrOption[] = [
  {
    id: "subhanallah",
    label: "Subhanallah",
    reciter: "CC0 zikir kaydı",
    audioAsset: require("../../assets/audio/dhikr/subhanallah.mp3")
  },
  {
    id: "allahu-ekber",
    label: "Allahu Ekber",
    reciter: "CC0 zikir kaydı",
    audioAsset: require("../../assets/audio/dhikr/allahu-ekber.mp3")
  },
  {
    id: "la-ilahe-illallah",
    label: "La İlahe İllallah",
    reciter: "CC0 zikir kaydı",
    audioAsset: require("../../assets/audio/dhikr/la-ilahe-illallah.mp3")
  },
  { id: "la-havle", label: "La Havle Vela Kuvvete İlla Billah", reciter: "Hoca kaydı eklenecek" },
  {
    id: "subhanallah-tr",
    label: "Sübhanallah",
    reciter: "CC0 zikir kaydı",
    audioAsset: require("../../assets/audio/dhikr/subhanallah.mp3")
  },
  {
    id: "elhamdulillah",
    label: "Elhamdülillah",
    reciter: "CC0 zikir kaydı",
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

export const useDhikrStore = create<DhikrState>((set) => ({
  count: 33,
  target: 99,
  selectedDhikrId: dhikrOptions[0].id,
  soundEnabled: false,
  vibrationEnabled: true,
  increment: () => set((state) => ({ count: Math.min(state.count + 1, state.target) })),
  reset: () => set({ count: 0 }),
  selectDhikr: (id) => set({ selectedDhikrId: id, count: 0 }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleVibration: () => set((state) => ({ vibrationEnabled: !state.vibrationEnabled }))
}));
