import "react-native-gesture-handler";
import "@/styles/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AndroidBackHandler } from "@/components/AndroidBackHandler";
import { AdMobGate } from "@/components/AdMobGate";
import { FavoriteDuaGate } from "@/components/FavoriteDuaGate";
import { HomeLaunchGate } from "@/components/HomeLaunchGate";
import { HuzurWidgetSyncGate } from "@/components/HuzurWidgetSyncGate";
import { LocationPermissionGate } from "@/components/LocationPermissionGate";
import { QuranGate } from "@/components/QuranGate";
import { RewardGate } from "@/components/RewardGate";
import { PrayerTrackerGate } from "@/components/PrayerTrackerGate";
import { colors } from "@/theme";

export const unstable_settings = {
  initialRouteName: "(tabs)"
};

export default function RootLayout() {
  return (
    <>
      <AndroidBackHandler />
      <AdMobGate />
      <HuzurWidgetSyncGate />
      <HomeLaunchGate />
      <LocationPermissionGate />
      <FavoriteDuaGate />
      <QuranGate />
      <RewardGate />
      <PrayerTrackerGate />
      <StatusBar style="dark" backgroundColor={colors.cream} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.cream } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="namaz" />
        <Stack.Screen name="prayer-times" />
        <Stack.Screen name="dhikr" />
        <Stack.Screen name="mosques" />
        <Stack.Screen name="friday-messages" />
        <Stack.Screen name="names-of-allah" />
        <Stack.Screen name="friday-sermons" />
        <Stack.Screen name="prayer-continuity" />
        <Stack.Screen name="qada-prayers" />
        <Stack.Screen name="rewards" />
        <Stack.Screen name="story-editor" />
        <Stack.Screen name="settings" />
      </Stack>
    </>
  );
}
