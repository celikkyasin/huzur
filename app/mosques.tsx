import { useEffect, useMemo } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View, type DimensionValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { MosqueCard } from "@/components/MosqueCard";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useLocationStore } from "@/store/locationStore";
import { useMosquesStore } from "@/store/mosquesStore";
import { colors, radii, shadows, typography } from "@/theme";
import type { Mosque } from "@/types";

const PREVIEW_DEGREE_SPAN = 0.035;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getPreviewPosition(mosque: Mosque, latitude?: number, longitude?: number) {
  if (typeof latitude !== "number" || typeof longitude !== "number" || typeof mosque.latitude !== "number" || typeof mosque.longitude !== "number") {
    return { left: "50%" as DimensionValue, top: "50%" as DimensionValue };
  }

  const x = 50 + ((mosque.longitude - longitude) / PREVIEW_DEGREE_SPAN) * 100;
  const y = 50 - ((mosque.latitude - latitude) / PREVIEW_DEGREE_SPAN) * 100;

  return {
    left: `${clamp(x, 12, 88)}%` as DimensionValue,
    top: `${clamp(y, 16, 84)}%` as DimensionValue
  };
}

function MosqueMapPreview({
  mosques,
  latitude,
  longitude
}: {
  mosques: Mosque[];
  latitude?: number;
  longitude?: number;
}) {
  const previewMosques = mosques.filter((mosque) => typeof mosque.latitude === "number" && typeof mosque.longitude === "number").slice(0, 7);
  const nearestMosque = mosques[0];

  return (
    <View style={styles.map}>
      <View style={styles.mapBackdrop}>
        <View style={[styles.road, styles.roadOne]} />
        <View style={[styles.road, styles.roadTwo]} />
        <View style={[styles.road, styles.roadThree]} />
        <View style={[styles.road, styles.roadFour]} />
        <View style={styles.userLocation}>
          <Ionicons name="navigate" size={18} color={colors.white} />
        </View>
        {previewMosques.map((mosque, index) => (
          <View key={mosque.id} style={[styles.previewPin, index === 0 && styles.previewPinNearest, getPreviewPosition(mosque, latitude, longitude)]}>
            <Ionicons name="business" size={index === 0 ? 18 : 14} color={colors.white} />
          </View>
        ))}
      </View>
      <View style={styles.mapOverlay}>
        <Text style={styles.mapCount}>{mosques.length}</Text>
        <Text style={styles.mapLabel}>yakın cami</Text>
      </View>
      {nearestMosque ? (
        <View style={styles.nearestOverlay}>
          <Text style={styles.nearestKicker}>En yakın</Text>
          <Text style={styles.nearestName} numberOfLines={1}>
            {nearestMosque.name}
          </Text>
          <Text style={styles.nearestDistance}>
            {nearestMosque.distance} • {nearestMosque.walkingTime}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function MosquesScreen() {
  const displayPlace = useLocationStore((state) => state.displayPlace);
  const isLoadingLocation = useLocationStore((state) => state.isLoading);
  const locationError = useLocationStore((state) => state.errorMessage);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const requestLocationPermission = useLocationStore((state) => state.requestLocationPermission);
  const refreshLocation = useLocationStore((state) => state.refreshLocation);
  const mosques = useMosquesStore((state) => state.mosques);
  const isLoadingMosques = useMosquesStore((state) => state.isLoading);
  const mosquesError = useMosquesStore((state) => state.errorMessage);
  const sourceLabel = useMosquesStore((state) => state.sourceLabel);
  const loadNearbyMosques = useMosquesStore((state) => state.loadNearbyMosques);
  const hasCoordinates = typeof latitude === "number" && typeof longitude === "number";
  const visibleMosques = useMemo(() => mosques.filter((mosque) => mosque.name.toLocaleLowerCase("tr-TR") !== "isimsiz cami"), [mosques]);

  useEffect(() => {
    void loadNearbyMosques({ latitude, longitude });
  }, [latitude, loadNearbyMosques, longitude]);

  const refreshNearbyMosques = async () => {
    await refreshLocation();
    const nextLocation = useLocationStore.getState();
    await loadNearbyMosques({ latitude: nextLocation.latitude, longitude: nextLocation.longitude }, true);
  };

  const openDirections = async (mosque: Mosque) => {
    if (typeof mosque.latitude !== "number" || typeof mosque.longitude !== "number") {
      Alert.alert("Yol Tarifi Hazır Değil", "Bu cami için konum bilgisi bulunamadı.");
      return;
    }

    const label = encodeURIComponent(mosque.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}&travelmode=walking`;
    const fallbackUrl = `geo:${mosque.latitude},${mosque.longitude}?q=${mosque.latitude},${mosque.longitude}(${label})`;

    try {
      const canOpen = await Linking.canOpenURL(url);
      await Linking.openURL(canOpen ? url : fallbackUrl);
    } catch {
      Alert.alert("Harita Açılamadı", "Yol tarifi şu anda açılamadı. Lütfen tekrar deneyin.");
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Yakındaki Camiler" />
      <MosqueMapPreview mosques={visibleMosques} latitude={latitude} longitude={longitude} />

      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <Text style={styles.title}>Yakındaki Camiler</Text>
          <Text style={styles.subtitle}>{isLoadingLocation ? "Konumunuz alınıyor" : `${displayPlace} çevresindeki ibadethaneler`}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={refreshNearbyMosques} style={({ pressed }) => [styles.refreshButton, pressed && styles.pressed]}>
          {isLoadingLocation || isLoadingMosques ? <ActivityIndicator size="small" color={colors.emerald} /> : <Ionicons name="refresh" size={20} color={colors.emerald} />}
        </Pressable>
      </View>

      <Card style={styles.statusCard}>
        <View style={styles.statusIcon}>
          <Ionicons name={hasCoordinates ? "location" : "location-outline"} size={19} color={colors.emerald} />
        </View>
        <View style={styles.statusText}>
          <Text style={styles.statusTitle}>{hasCoordinates ? sourceLabel : "Konum izni bekleniyor"}</Text>
          <Text style={styles.statusSubtitle}>{hasCoordinates ? (isLoadingMosques ? "Liste gösteriliyor, canlı sonuçlar güncelleniyor." : "Liste en yakın camiden başlayacak şekilde sıralanır.") : "Yakındaki camileri görmek için konum izni verin."}</Text>
        </View>
      </Card>

      {locationError || mosquesError ? (
        <View style={styles.notice}>
          <Ionicons name="information-circle" size={18} color={colors.gold} />
          <Text style={styles.noticeText}>{locationError || mosquesError}</Text>
        </View>
      ) : null}

      {!hasCoordinates ? (
        <PrimaryButton label="Konum İzni Ver" icon="location" onPress={() => void requestLocationPermission()} style={styles.permissionButton} />
      ) : null}

      {isLoadingMosques && !visibleMosques.length ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.emerald} />
          <Text style={styles.loadingText}>Yakındaki camiler aranıyor</Text>
        </View>
      ) : null}

      {visibleMosques.map((mosque, index) => (
        <MosqueCard key={mosque.id} mosque={mosque} featured={index === 0} onDirections={openDirections} />
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  map: {
    height: 250,
    borderRadius: radii.xl,
    backgroundColor: "#A9BEB3",
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  mapBackdrop: {
    width: "100%",
    height: "100%",
    backgroundColor: "#DDE8E1"
  },
  road: {
    position: "absolute",
    height: 7,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,255,255,0.86)"
  },
  roadOne: {
    width: 360,
    left: -44,
    top: 70,
    transform: [{ rotate: "25deg" }]
  },
  roadTwo: {
    width: 320,
    right: -40,
    top: 130,
    transform: [{ rotate: "-34deg" }]
  },
  roadThree: {
    width: 250,
    left: 44,
    bottom: 54,
    transform: [{ rotate: "6deg" }]
  },
  roadFour: {
    width: 220,
    right: 18,
    top: 42,
    transform: [{ rotate: "82deg" }]
  },
  userLocation: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 42,
    height: 42,
    marginLeft: -21,
    marginTop: -21,
    borderRadius: radii.round,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "rgba(248,244,234,0.95)",
    ...shadows.soft
  },
  previewPin: {
    position: "absolute",
    width: 34,
    height: 34,
    marginLeft: -17,
    marginTop: -17,
    borderRadius: radii.round,
    backgroundColor: colors.emerald,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.paper,
    ...shadows.soft
  },
  previewPinNearest: {
    width: 48,
    height: 48,
    marginLeft: -24,
    marginTop: -24,
    backgroundColor: colors.emerald
  },
  mapOverlay: {
    position: "absolute",
    right: 18,
    top: 18,
    borderRadius: radii.lg,
    backgroundColor: "rgba(248,244,234,0.92)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center"
  },
  mapCount: {
    color: colors.emerald,
    fontSize: 22,
    fontWeight: "900"
  },
  mapLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  nearestOverlay: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 18,
    borderRadius: radii.lg,
    backgroundColor: "rgba(7,94,71,0.92)",
    padding: 14
  },
  nearestKicker: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  nearestName: {
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 4
  },
  nearestDistance: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  titleRow: {
    marginTop: 24,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  titleText: {
    flex: 1
  },
  title: {
    fontFamily: typography.title,
    color: colors.ink,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    marginTop: 8
  },
  refreshButton: {
    width: 46,
    height: 46,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.72
  },
  statusCard: {
    marginBottom: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  statusIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  statusText: {
    flex: 1
  },
  statusTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  statusSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  notice: {
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    marginBottom: 14
  },
  noticeText: {
    flex: 1,
    color: colors.ink,
    lineHeight: 20,
    fontWeight: "700"
  },
  permissionButton: {
    marginBottom: 14
  },
  loading: {
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    marginBottom: 14,
    alignItems: "center",
    gap: 10
  },
  loadingText: {
    color: colors.muted,
    fontWeight: "800"
  }
});
