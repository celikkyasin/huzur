import { useEffect } from "react";
import { NativeModules, Platform } from "react-native";
import { getDailyAyah } from "@/data/mock";
import { useLocationStore } from "@/store/locationStore";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";

type HuzurWidgetModuleType = {
  updateWidgets?: (
    prayerTimesJson: string,
    locationLabel: string,
    sourceLabel: string,
    ayahArabic: string,
    ayahTranslation: string,
    ayahSource: string
  ) => void;
};

const HuzurWidgetModule = NativeModules.HuzurWidgetModule as HuzurWidgetModuleType | undefined;

export function HuzurWidgetSyncGate() {
  const prayerTimes = usePrayerTimesStore((state) => state.times);
  const sourceLabel = usePrayerTimesStore((state) => state.sourceLabel);
  const displayPlace = useLocationStore((state) => state.displayPlace);
  const city = useLocationStore((state) => state.city);
  const country = useLocationStore((state) => state.country);

  useEffect(() => {
    if (Platform.OS !== "android" || !HuzurWidgetModule?.updateWidgets) {
      return;
    }

    const ayah = getDailyAyah();
    const locationLabel = displayPlace || [city, country].filter(Boolean).join(", ") || "Türkiye";
    HuzurWidgetModule.updateWidgets(
      JSON.stringify(prayerTimes.map(({ name, time }) => ({ name, time }))),
      locationLabel,
      sourceLabel || "Diyanet vakitleri",
      ayah.arabic,
      ayah.translation,
      ayah.source
    );
  }, [city, country, displayPlace, prayerTimes, sourceLabel]);

  return null;
}
