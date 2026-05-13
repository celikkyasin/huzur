import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";
import { PrayerTimeCard } from "@/components/PrayerTimeCard";
import { QuickActionCard } from "@/components/QuickActionCard";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getDailyAyah } from "@/data/mock";
import { useLocationStore } from "@/store/locationStore";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";
import { colors, radii, typography } from "@/theme";
import { getPrayerWindow } from "@/utils/prayerTimes";

const quickActions = [
  { title: "Namaz", icon: "accessibility" as const, route: "/namaz" as const },
  { title: "Zikirmatik", icon: "finger-print" as const, route: "/dhikr" as const },
  { title: "Kıble", icon: "compass" as const, route: "/qibla" as const },
  { title: "Dualar", icon: "leaf" as const, route: "/duas" as const },
  { title: "Camiler", icon: "business" as const, route: "/mosques" as const },
  { title: "Cuma Mesajları", icon: "sparkles" as const, route: "/friday-messages" as const }
];

export default function HomeScreen() {
  const ayahShotRef = useRef<ViewShot | null>(null);
  const [isSharingAyah, setIsSharingAyah] = useState(false);
  const displayPlace = useLocationStore((state) => state.displayPlace);
  const isLoadingLocation = useLocationStore((state) => state.isLoading);
  const locationError = useLocationStore((state) => state.errorMessage);
  const city = useLocationStore((state) => state.city);
  const district = useLocationStore((state) => state.district);
  const country = useLocationStore((state) => state.country);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const prayerTimes = usePrayerTimesStore((state) => state.times);
  const isLoadingPrayerTimes = usePrayerTimesStore((state) => state.isLoading);
  const prayerTimesError = usePrayerTimesStore((state) => state.errorMessage);
  const prayerTimesSource = usePrayerTimesStore((state) => state.sourceLabel);
  const loadPrayerTimes = usePrayerTimesStore((state) => state.loadPrayerTimes);
  const ayah = getDailyAyah();
  const visiblePrayerTimes = getPrayerWindow(prayerTimes);

  useEffect(() => {
    void loadPrayerTimes({ city, district, country, latitude, longitude });
  }, [city, country, district, latitude, loadPrayerTimes, longitude]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") {
        return undefined;
      }

      const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => subscription.remove();
    }, [])
  );

  const shareDailyAyah = async () => {
    try {
      setIsSharingAyah(true);
      const canShare = await Sharing.isAvailableAsync();
      const uri = await ayahShotRef.current?.capture?.();

      if (!uri || !canShare) {
        Alert.alert("Paylaşım hazırlanamadı", "Bu cihazda görsel paylaşım şu anda kullanılamıyor.");
        return;
      }

      await Sharing.shareAsync(uri, {
        dialogTitle: "Günün Ayeti",
        mimeType: "image/png"
      });
    } catch {
      Alert.alert("Paylaşım hazırlanamadı", "Günün ayeti görseli oluşturulurken bir sorun oluştu.");
    } finally {
      setIsSharingAyah(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.greeting}>
        <Text style={styles.hello} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.86}>
          Selamünaleyküm
        </Text>
        <Text style={styles.location}>{isLoadingLocation ? "Konumunuz hazırlanıyor" : `${displayPlace} için güncel vakitler`}</Text>
        {locationError ? <Text style={styles.locationWarning}>{locationError}</Text> : null}
        {prayerTimesError ? <Text style={styles.locationWarning}>{prayerTimesError}</Text> : null}
      </View>

      <PrayerTimeCard locationLabel={displayPlace} prayerTimes={prayerTimes} isLocating={isLoadingLocation} isLoadingTimes={isLoadingPrayerTimes} sourceLabel={prayerTimesSource} />

      <View style={styles.quickGrid}>
        {quickActions.map((item) => (
          <QuickActionCard key={item.title} title={item.title} icon={item.icon} onPress={() => router.push(item.route as never)} />
        ))}
      </View>

      <SectionTitle title="Vakitler" action="Tümü" onActionPress={() => router.push("/prayer-times" as never)} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timesRow}>
        {visiblePrayerTimes.map((item) => (
          <View key={item.id} style={[styles.timePill, item.isNext && styles.nextPill, item.isPast && styles.pastPill]}>
            <Text style={[styles.timeName, item.isNext && styles.nextText]}>{item.name}</Text>
            <Text style={[styles.timeValue, item.isNext && styles.nextText]}>{item.time}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.ayahTitleRow}>
        <Text style={styles.ayahTitle}>Günün Ayeti</Text>
      </View>
      <View style={styles.ayahWrap}>
        <ViewShot ref={ayahShotRef} options={{ format: "png", quality: 1, result: "tmpfile" }}>
          <Card style={styles.ayah}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Ionicons name="sparkles" size={18} color={colors.gold} />
                <Text style={styles.cardKicker}>Günün Ayeti</Text>
              </View>
            </View>
            <Text style={styles.arabic}>{ayah.arabic}</Text>
            <View style={styles.goldLine} />
            <Text style={styles.translation}>“{ayah.translation}”</Text>
            <View style={styles.ayahFooter}>
              <Text style={styles.source}>{ayah.source}</Text>
              <Text style={styles.brandFooter}>huzur.app</Text>
            </View>
          </Card>
        </ViewShot>
        <Pressable onPress={shareDailyAyah} disabled={isSharingAyah} style={({ pressed }) => [styles.shareIconButton, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel="Günün ayetini paylaş">
          <Ionicons name={isSharingAyah ? "hourglass-outline" : "share-social"} size={20} color={colors.emerald} />
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: {
    marginTop: 4,
    marginBottom: 8
  },
  hello: {
    fontFamily: typography.title,
    fontSize: 21,
    color: colors.ink,
    fontWeight: "900",
    lineHeight: 26
  },
  location: {
    color: colors.muted,
    marginTop: 2,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800"
  },
  locationWarning: {
    color: colors.gold,
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800"
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 8
  },
  timesRow: {
    gap: 8,
    paddingRight: 18
  },
  timePill: {
    width: 78,
    minHeight: 50,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line
  },
  pastPill: {
    opacity: 0.64
  },
  nextPill: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
    opacity: 1
  },
  timeName: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900"
  },
  timeValue: {
    color: colors.ink,
    marginTop: 3,
    fontSize: 13,
    fontWeight: "900"
  },
  nextText: {
    color: colors.white
  },
  ayahTitleRow: {
    marginTop: 10,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center"
  },
  ayahTitle: {
    fontFamily: typography.title,
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  ayahWrap: {
    position: "relative"
  },
  shareIconButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 5,
    width: 42,
    height: 42,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  ayah: {
    minHeight: 136,
    backgroundColor: colors.white,
    paddingBottom: 18
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  cardKicker: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 13,
    textTransform: "uppercase"
  },
  arabic: {
    color: colors.emerald,
    fontSize: 20,
    textAlign: "center",
    marginTop: 10,
    fontWeight: "800",
    lineHeight: 28
  },
  goldLine: {
    width: 74,
    height: 3,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginTop: 10,
    marginBottom: 8
  },
  translation: {
    color: colors.ink,
    fontFamily: typography.title,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800"
  },
  ayahFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10
  },
  source: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  brandFooter: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.72
  }
});
