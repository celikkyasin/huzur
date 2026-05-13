import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export type PrayerTime = {
  id: string;
  name: string;
  time: string;
  isNext?: boolean;
};

export type DuaCategory = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
};

export type Dua = {
  id: string;
  categoryId: string;
  title: string;
  arabic: string;
  meaning: string;
  explanation: string;
  source: string;
};

export type Surah = {
  id: string;
  number: number;
  name: string;
  arabicName: string;
  meaning: string;
  verses: number;
  duration: string;
  revelationPlace: string;
  audioUri: string;
};

export type SurahVerse = {
  number: number;
  arabic: string;
  translation: string;
  explanation: string;
};

export type SurahDetail = Surah & {
  description: string;
  revelationStory: string;
  versesText: SurahVerse[];
};

export type Mosque = {
  id: string;
  name: string;
  distance: string;
  address: string;
  walkingTime: string;
  latitude?: number;
  longitude?: number;
};

export type FridayMessage = {
  id: string;
  category: string;
  message: string;
  background: string;
  accent: string;
  image?: ImageSourcePropType;
  mediaType?: "image" | "video";
};

export type StoryTemplate = {
  id: string;
  title: string;
  format: string;
  size: string;
  background: string;
  accent: string;
  message: string;
};

export type SettingsItem = {
  id: string;
  title: string;
  subtitle?: string;
  value?: string;
  icon: IconName;
};
import type { ImageSourcePropType } from "react-native";
