import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { AppHeader } from "@/components/AppHeader";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useLocationStore } from "@/store/locationStore";
import { colors, radii, shadows, typography } from "@/theme";

const KAABA_COORDS = {
  latitude: 21.422487,
  longitude: 39.826206
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function formatDegree(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "--";
  }

  return `${Math.round(normalizeDegrees(value))}°`;
}

function calculateQiblaBearing(latitude: number, longitude: number) {
  const currentLat = toRadians(latitude);
  const currentLon = toRadians(longitude);
  const kaabaLat = toRadians(KAABA_COORDS.latitude);
  const kaabaLon = toRadians(KAABA_COORDS.longitude);
  const lonDiff = kaabaLon - currentLon;

  const y = Math.sin(lonDiff) * Math.cos(kaabaLat);
  const x = Math.cos(currentLat) * Math.sin(kaabaLat) - Math.sin(currentLat) * Math.cos(kaabaLat) * Math.cos(lonDiff);

  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

function getTurnInstruction(offset?: number) {
  if (typeof offset !== "number") {
    return "Telefonunuzu düz tutup konum ve pusula bilgisini bekleyin.";
  }

  const absoluteOffset = Math.abs(offset);

  if (absoluteOffset <= 3) {
    return "Kıble yönü hizalandı.";
  }

  const direction = offset > 0 ? "sağa" : "sola";
  return `${Math.round(absoluteOffset)}° ${direction} çevirin.`;
}

function getAccuracyLabel(accuracy?: number | null) {
  if (typeof accuracy !== "number") {
    return "Kalibrasyon bekleniyor";
  }

  if (accuracy >= 2) {
    return "Pusula doğruluğu iyi";
  }

  if (accuracy >= 1) {
    return "Pusula orta doğrulukta";
  }

  return "Pusulayı kalibre edin";
}

function KaabaMark({ aligned }: { aligned: boolean }) {
  return (
    <View style={[styles.kaabaFrame, aligned && styles.kaabaFrameAligned]}>
      <LinearGradient colors={["#201B16", "#050505"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.kaabaBody}>
        <View style={styles.kaabaTopGlow} />
        <View style={styles.kaabaBand}>
          <View style={styles.kaabaBandLine} />
          <View style={styles.kaabaBandLineShort} />
        </View>
        <View style={styles.kaabaDoor} />
      </LinearGradient>
      <View style={styles.kaabaBaseShadow} />
    </View>
  );
}

export default function QiblaScreen() {
  const displayPlace = useLocationStore((state) => state.displayPlace);
  const isLoadingLocation = useLocationStore((state) => state.isLoading);
  const locationError = useLocationStore((state) => state.errorMessage);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const permissionStatus = useLocationStore((state) => state.permissionStatus);
  const requestLocationPermission = useLocationStore((state) => state.requestLocationPermission);
  const refreshLocation = useLocationStore((state) => state.refreshLocation);
  const [heading, setHeading] = useState<number>();
  const [headingAccuracy, setHeadingAccuracy] = useState<number | null>();
  const [headingError, setHeadingError] = useState<string>();

  const qiblaBearing = useMemo(() => {
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return undefined;
    }

    return calculateQiblaBearing(latitude, longitude);
  }, [latitude, longitude]);

  const qiblaOffset = useMemo(() => {
    if (typeof qiblaBearing !== "number" || typeof heading !== "number") {
      return undefined;
    }

    const normalized = normalizeDegrees(qiblaBearing - heading);
    return normalized > 180 ? normalized - 360 : normalized;
  }, [heading, qiblaBearing]);

  const isAligned = typeof qiblaOffset === "number" && Math.abs(qiblaOffset) <= 3;
  const needsLocation = typeof latitude !== "number" || typeof longitude !== "number";

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;
    let isMounted = true;

    async function startHeadingUpdates() {
      try {
        const isAvailable = await Location.hasServicesEnabledAsync();

        if (!isAvailable) {
          setHeadingError("Konum servisleri kapalı. Kıble için konum ve pusula servisini açın.");
          return;
        }

        subscription = await Location.watchHeadingAsync((result) => {
          if (!isMounted) {
            return;
          }

          const nextHeading = result.trueHeading >= 0 ? result.trueHeading : result.magHeading;
          setHeading(normalizeDegrees(nextHeading));
          setHeadingAccuracy(result.accuracy);
          setHeadingError(undefined);
        });
      } catch {
        setHeadingError("Pusula verisi alınamadı. Cihazı sekiz çizerek kalibre edip tekrar deneyin.");
      }
    }

    void startHeadingUpdates();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  const handleLocationPress = async () => {
    if (permissionStatus !== Location.PermissionStatus.GRANTED) {
      await requestLocationPermission();
      return;
    }

    await refreshLocation();
  };

  return (
    <ScreenContainer contentStyle={styles.content}>
      <AppHeader subtitle="Kıble Bulucu" />

      <View style={styles.locationCard}>
        <View style={styles.locationMain}>
          <View style={styles.locationIcon}>
            <Ionicons name="location" size={20} color={colors.emerald} />
          </View>
          <View style={styles.locationTextWrap}>
            <Text style={styles.locationLabel}>Konum</Text>
            <Text style={styles.location} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
              {isLoadingLocation ? "Konum alınıyor" : displayPlace}
            </Text>
          </View>
        </View>
        <Pressable onPress={handleLocationPress} disabled={isLoadingLocation} style={styles.refreshButton} accessibilityRole="button" accessibilityLabel="Konumu yenile">
          {isLoadingLocation ? <ActivityIndicator size="small" color={colors.emerald} /> : <Ionicons name={needsLocation ? "locate" : "refresh"} size={20} color={colors.emerald} />}
        </Pressable>
      </View>

      <View style={styles.compassOuter}>
        <View style={styles.compassHalo} />
        <View style={styles.goldRing} />
        <View style={[styles.compassMiddle, { transform: [{ rotate: `${-(heading ?? 0)}deg` }] }]}>
          <View style={styles.axisHorizontal} />
          <View style={styles.axisVertical} />
          <View style={[styles.tick, styles.tickNorth]} />
          <View style={[styles.tick, styles.tickEast]} />
          <View style={[styles.tick, styles.tickSouth]} />
          <View style={[styles.tick, styles.tickWest]} />
          <Text style={[styles.direction, styles.north]}>K</Text>
          <Text style={[styles.direction, styles.south]}>G</Text>
          <Text style={[styles.direction, styles.west]}>B</Text>
          <Text style={[styles.direction, styles.east]}>D</Text>
        </View>

        <View style={styles.fixedGuide}>
          <View style={styles.guideLine} />
          <View style={[styles.qiblaNeedle, { transform: [{ rotate: `${qiblaOffset ?? 0}deg` }] }]}>
            <View style={[styles.needleTip, isAligned && styles.alignedNeedleTip]} />
            <View style={styles.needleTail} />
          </View>
          <View style={[styles.centerDot, isAligned && styles.alignedCenterDot]}>
            <KaabaMark aligned={isAligned} />
          </View>
        </View>
      </View>

      <Text style={styles.degree}>{formatDegree(qiblaBearing)}</Text>
      <Text style={styles.degreeLabel}>Kabe yönü</Text>

      <View style={[styles.feedback, isAligned && styles.alignedFeedback]}>
        <Ionicons name={isAligned ? "checkmark-circle" : "navigate-circle"} size={18} color={isAligned ? colors.white : colors.gold} />
        <Text style={[styles.feedbackText, isAligned && styles.alignedFeedbackText]}>{getTurnInstruction(qiblaOffset)}</Text>
      </View>

      <View style={styles.infoGrid}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Telefon yönü</Text>
          <Text style={styles.infoValue}>{formatDegree(heading)}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Sapma</Text>
          <Text style={styles.infoValue}>{typeof qiblaOffset === "number" ? `${Math.round(Math.abs(qiblaOffset))}°` : "--"}</Text>
        </View>
      </View>

      <View style={styles.notice}>
        <Ionicons name="information-circle" size={18} color={colors.emerald} />
        <Text style={styles.noticeText}>
          {headingError || locationError || `${getAccuracyLabel(headingAccuracy)}. En doğru sonuç için telefonu düz tutun, metal yüzeylerden uzaklaşın ve gerekirse sekiz çizerek kalibre edin.`}
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    minHeight: "100%",
    paddingBottom: 28
  },
  locationCard: {
    width: "100%",
    marginTop: 44,
    padding: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    ...shadows.card
  },
  locationMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  locationTextWrap: {
    flex: 1,
    minWidth: 0
  },
  locationLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  location: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900"
  },
  refreshButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  compassOuter: {
    width: 304,
    height: 304,
    borderRadius: 152,
    backgroundColor: "#FDF8EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    borderWidth: 1,
    borderColor: "rgba(215,179,90,0.36)",
    ...shadows.soft
  },
  compassHalo: {
    position: "absolute",
    width: 286,
    height: 286,
    borderRadius: 143,
    borderWidth: 12,
    borderColor: "rgba(215,179,90,0.12)"
  },
  goldRing: {
    position: "absolute",
    width: 262,
    height: 262,
    borderRadius: 131,
    borderWidth: 2,
    borderColor: "rgba(215,179,90,0.55)"
  },
  compassMiddle: {
    width: 248,
    height: 248,
    borderRadius: 124,
    backgroundColor: "#EEF6F0",
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.16)",
    alignItems: "center",
    justifyContent: "center"
  },
  axisHorizontal: {
    position: "absolute",
    width: 198,
    height: 1,
    backgroundColor: colors.sage
  },
  axisVertical: {
    position: "absolute",
    height: 198,
    width: 1,
    backgroundColor: colors.sage
  },
  direction: {
    position: "absolute",
    color: colors.muted,
    fontWeight: "900"
  },
  tick: {
    position: "absolute",
    width: 4,
    height: 20,
    borderRadius: 4,
    backgroundColor: "rgba(7,94,71,0.26)"
  },
  tickNorth: {
    top: 42
  },
  tickSouth: {
    bottom: 42
  },
  tickEast: {
    right: 50,
    transform: [{ rotate: "90deg" }]
  },
  tickWest: {
    left: 50,
    transform: [{ rotate: "90deg" }]
  },
  north: { top: 18 },
  south: { bottom: 18 },
  west: { left: 24 },
  east: { right: 24 },
  fixedGuide: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },
  guideLine: {
    position: "absolute",
    top: 16,
    width: 5,
    height: 58,
    borderRadius: 5,
    backgroundColor: colors.gold
  },
  qiblaNeedle: {
    position: "absolute",
    width: 28,
    height: 220,
    alignItems: "center",
    justifyContent: "flex-start"
  },
  needleTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 72,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#D7B35A"
  },
  alignedNeedleTip: {
    borderBottomColor: colors.emerald
  },
  needleTail: {
    width: 6,
    height: 90,
    borderRadius: 6,
    backgroundColor: colors.emerald,
    opacity: 0.5
  },
  centerDot: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFFDF8",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(215,179,90,0.72)",
    ...shadows.card
  },
  alignedCenterDot: {
    backgroundColor: "#FDF6DD",
    borderColor: colors.emerald
  },
  kaabaFrame: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F9E7A5",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }]
  },
  kaabaFrameAligned: {
    backgroundColor: colors.gold
  },
  kaabaBody: {
    width: 38,
    height: 34,
    borderRadius: 7,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,241,191,0.38)"
  },
  kaabaTopGlow: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  kaabaBand: {
    marginTop: 7,
    height: 8,
    backgroundColor: "#D7B35A",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 2
  },
  kaabaBandLine: {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(27,43,41,0.45)"
  },
  kaabaBandLineShort: {
    height: 1,
    width: "58%",
    backgroundColor: "rgba(27,43,41,0.4)"
  },
  kaabaDoor: {
    position: "absolute",
    right: 7,
    bottom: 0,
    width: 8,
    height: 13,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: "#B98D35"
  },
  kaabaBaseShadow: {
    position: "absolute",
    bottom: 4,
    width: 34,
    height: 5,
    borderRadius: 5,
    backgroundColor: "rgba(27,43,41,0.16)"
  },
  degree: {
    color: colors.emerald,
    fontFamily: typography.title,
    fontSize: 32,
    fontWeight: "900",
    marginTop: 20
  },
  degreeLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    marginTop: 2
  },
  feedback: {
    marginTop: 14,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: radii.round,
    backgroundColor: colors.goldSoft,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  alignedFeedback: {
    backgroundColor: colors.emerald
  },
  feedbackText: {
    color: colors.emerald,
    fontWeight: "900",
    fontSize: 14
  },
  alignedFeedbackText: {
    color: colors.white
  },
  infoGrid: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 18
  },
  infoBox: {
    flex: 1,
    minHeight: 74,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center"
  },
  infoLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900"
  },
  infoValue: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4
  },
  notice: {
    width: "100%",
    marginTop: 14,
    padding: 14,
    borderRadius: radii.md,
    backgroundColor: colors.emeraldSoft,
    flexDirection: "row",
    gap: 10
  },
  noticeText: {
    flex: 1,
    color: colors.ink,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700"
  }
});
