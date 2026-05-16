import { useEffect } from "react";
import mobileAds from "react-native-google-mobile-ads";

export function AdMobGate() {
  useEffect(() => {
    void mobileAds().initialize();
  }, []);

  return null;
}
