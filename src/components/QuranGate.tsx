import { useEffect } from "react";
import { useQuranStore } from "@/store/quranStore";

export function QuranGate() {
  const hydrateQuran = useQuranStore((state) => state.hydrateQuran);

  useEffect(() => {
    void hydrateQuran();
  }, [hydrateQuran]);

  return null;
}
