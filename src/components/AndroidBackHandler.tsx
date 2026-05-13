import { useEffect } from "react";
import { BackHandler, Platform } from "react-native";
import { router, usePathname } from "expo-router";

const rootTabs = new Set(["/", "/quran", "/qibla", "/duas", "/more"]);

export function AndroidBackHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (pathname === "/") {
        return true;
      }

      if (rootTabs.has(pathname)) {
        router.replace("/");
        return true;
      }

      router.back();
      return true;
    });

    return () => subscription.remove();
  }, [pathname]);

  return null;
}
