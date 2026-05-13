import { useEffect, useRef } from "react";
import { Linking, Platform } from "react-native";
import { router, usePathname } from "expo-router";

export function HomeLaunchGate() {
  const pathname = usePathname();
  const hasHandledLaunch = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "android" || hasHandledLaunch.current) {
      return;
    }

    hasHandledLaunch.current = true;

    Linking.getInitialURL().then((initialUrl) => {
      const isDeepLinkLaunch = initialUrl?.startsWith("huzur://");

      if (!isDeepLinkLaunch && pathname !== "/") {
        setTimeout(() => router.replace("/"), 250);
      }
    });
  }, [pathname]);

  return null;
}
