import { useEffect } from "react";
import { usePrayerTrackerStore } from "@/store/prayerTrackerStore";

export function PrayerTrackerGate() {
  const hydratePrayerTracker = usePrayerTrackerStore((state) => state.hydratePrayerTracker);

  useEffect(() => {
    void hydratePrayerTracker();
  }, [hydratePrayerTracker]);

  return null;
}
