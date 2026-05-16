import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { TestIds, useRewardedAd } from "react-native-google-mobile-ads";
import { useRewardStore } from "@/store/rewardStore";
import { colors, radii, shadows, typography } from "@/theme";

export function RewardedAdPointsCard() {
  const [isAwarding, setIsAwarding] = useState(false);
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
      description: "Odullu reklam",
      points: 5
    })
      .then((transaction) => {
        if (transaction) {
          Alert.alert("5 puan eklendi", "Odullu reklami tamamladigin icin puanin hesabina islendi.");
          void syncRewards();
        }
      })
      .finally(() => setIsAwarding(false));
  }, [awardReward, isEarnedReward, syncRewards]);

  useEffect(() => {
    if (error) {
      setIsAwarding(false);
    }
  }, [error]);

  const watchAd = () => {
    if (isAwarding) {
      return;
    }

    if (!isLoaded) {
      load();
      Alert.alert("Reklam hazirlaniyor", "Odullu reklam birkac saniye icinde hazir olacak. Lutfen tekrar dene.");
      return;
    }

    earnedRewardRef.current = false;
    show();
  };

  return (
    <View style={[styles.card, isAwarding && styles.cardDisabled]}>
      <View style={styles.topRow}>
        <View style={styles.iconWrap}>
          <Ionicons name="play-circle" size={28} color={colors.gold} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Reklam izle, puan kazan</Text>
          <Text style={styles.subtitle}>Test odullu reklami tamamla, hesabina +5 puan eklensin.</Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" disabled={isAwarding} onPress={watchAd} style={({ pressed }) => [styles.rewardButton, pressed && styles.pressed]}>
        {isAwarding ? <ActivityIndicator color={colors.emerald} /> : <Text style={styles.rewardPillText}>{isLoaded ? "+5 Puan Kazan" : "Reklami Hazirla"}</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    borderRadius: radii.lg,
    padding: 14,
    backgroundColor: colors.emerald,
    borderWidth: 1,
    borderColor: "rgba(215,179,90,0.46)",
    ...shadows.soft
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  title: {
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 3,
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  rewardButton: {
    marginTop: 12,
    alignSelf: "stretch",
    minHeight: 42,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 12
  },
  cardDisabled: {
    opacity: 0.72
  },
  rewardPillText: {
    color: colors.emerald,
    fontSize: 13,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.72
  }
});
