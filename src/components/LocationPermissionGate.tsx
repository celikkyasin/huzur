import { useEffect } from "react";
import { useLocationStore } from "@/store/locationStore";

export function LocationPermissionGate() {
  const hydrateLocation = useLocationStore((state) => state.hydrateLocation);

  useEffect(() => {
    void hydrateLocation();
  }, [hydrateLocation]);

  return null;
}
