import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { TestIds, useRewardedAd } from "react-native-google-mobile-ads";
import { useRewardStore } from "@/store/rewardStore";
import { colors, radii, shadows, typography } from "@/theme";

export function RewardedAdPointsCard() {
  const [isAwarding, setIsAwarding] = useState(false);
  const [pendingShow, setPendingShow] = useState(false);
  const earnedRewardRef = useRef(false);
  const awardReward = useRewardStore((state) => state.awardReward);
  const syncRewards = useRewardStore((state) => state.syncRewards);
  const { isLoaded, isClosed, isEarnedReward, error, load, show } = useRewardedAd(TestIds.REWARDED, {
    requestNonPersonalizedAdsOnly: true
  });

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (pendingShow && isLoaded) {
      setPendingShow(false);
      earnedRewardRef.current = false;
      show();
    }
  }, [isLoaded, pendingShow, show]);

  useEffect(() => {
    if (isClosed) {
      load();
    }
  }, [isClosed, load]);

  useEffect(() => {
    if (!isEarnedReward || earnedRewardRef.current) {
      return;
    }

    earnedRewardRef.current = true;
    setIsAwarding(true);
    awardReward({
      action: "rewardedAd",
      title: "Reklam izlendi",
      description: "Ödüllü reklam",
      points: 5
    })
      .then((transaction) => {
        if (transaction) {
          Alert.alert("5 puan eklendi", "Ödüllü reklamı tamamladığın için puanın hesabına işlendi.");
          void syncRewards();
        }
      })
      .finally(() => setIsAwarding(false));
  }, [awardReward, isEarnedReward, syncRewards]);

  useEffect(() => {
    if (error) {
      setPendingShow(false);
      setIsAwarding(false);
    }
  }, [error]);

  const watchAd = () => {
    if (isAwarding || pendingShow) {
      return;
    }

    if (!isLoaded) {
      setPendingShow(true);
      load();
      return;
    }

    earnedRewardRef.current = false;
    show();
  };

  const buttonLabel = pendingShow ? "Reklam hazırlanıyor" : isLoaded ? "Reklamı İzle" : "Hazırla ve İzle";

  return (
    <LinearGradient colors={["#075E47", "#0B6E53", "#D7B35A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.glassLayer}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <Ionicons name="play" size={23} color={colors.emerald} />
          </View>
          <View style={styles.copy}>
            <Text style={styles.kicker}>ÖDÜLLÜ REKLAM</Text>
            <Text style={styles.title}>Reklam izle, puan kazan</Text>
            <Text style={styles.subtitle}>Tam izlenen test reklamından sonra hesabına puan eklenir.</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsValue}>+5</Text>
            <Text style={styles.pointsLabel}>puan</Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.statusPill}>
            <Ionicons name={isLoaded ? "checkmark-circle" : pendingShow ? "time" : "sparkles"} size={15} color={colors.goldSoft} />
            <Text style={styles.statusText}>{isLoaded ? "Hazır" : pendingShow ? "Yükleniyor" : "Test reklam"}</Text>
          </View>
          <View style={[styles.watchButtonFrame, (isAwarding || pendingShow) && styles.buttonDisabled]}>
            {isAwarding || pendingShow ? <ActivityIndicator color={colors.emerald} /> : <Text style={styles.watchButtonText}>{buttonLabel}</Text>}
            <Pressable accessibilityRole="button" disabled={isAwarding || pendingShow} onPress={watchAd} style={styles.watchButtonHitArea} />
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    borderRadius: radii.xl,
    padding: 1,
    ...shadows.card
  },
  glassLayer: {
    borderRadius: radii.xl,
    padding: 16,
    backgroundColor: "rgba(7,94,71,0.88)"
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)"
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  kicker: {
    color: colors.goldSoft,
    fontSize: 10,
    letterSpacing: 0,
    fontWeight: "900"
  },
  title: {
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 22,
    lineHeight: 27,
    marginTop: 2,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 5,
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  pointsBadge: {
    width: 72,
    minHeight: 72,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,244,196,0.96)"
  },
  pointsValue: {
    color: colors.emerald,
    fontSize: 25,
    lineHeight: 29,
    fontWeight: "900"
  },
  pointsLabel: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: "900"
  },
  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 38,
    borderRadius: radii.round,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  statusText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "900"
  },
  watchButtonFrame: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 12
  },
  watchButtonHitArea: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radii.round
  },
  buttonDisabled: {
    opacity: 0.76
  },
  watchButtonText: {
    color: colors.emerald,
    fontSize: 13,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.72
  }
});
