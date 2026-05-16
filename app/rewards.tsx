import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { RewardedAdPointsCard } from "@/components/RewardedAdPointsCard";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { fetchRewardConfig, submitRewardClaim, type RemoteLeaderboardItem, type RewardConfig, type RewardPrize } from "@/services/rewardsApi";
import { useRewardStore } from "@/store/rewardStore";
import { colors, radii, shadows, typography } from "@/theme";

const LEADERBOARD_LIMIT = 20;

type LeaderboardItem = RemoteLeaderboardItem & {
  isCurrentUser?: boolean;
};

export default function RewardsScreen() {
  const [rewardConfig, setRewardConfig] = useState<RewardConfig | null>(null);
  const [claimFormVisible, setClaimFormVisible] = useState(false);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimFullName, setClaimFullName] = useState("");
  const [claimContact, setClaimContact] = useState("");
  const [claimAddress, setClaimAddress] = useState("");
  const [selectedPrizePreview, setSelectedPrizePreview] = useState<RewardPrize | null>(null);
  const userCode = useRewardStore((state) => state.userCode);
  const totalPoints = useRewardStore((state) => state.totalPoints);
  const weeklyPoints = useRewardStore((state) => state.weeklyPoints);
  const monthlyPoints = useRewardStore((state) => state.monthlyPoints);
  const rewardHistory = useRewardStore((state) => state.history);
  const remoteLeaderboard = useRewardStore((state) => state.leaderboard);
  const isSyncingRewards = useRewardStore((state) => state.isSyncing);
  const isRemoteLeaderboardEnabled = useRewardStore((state) => state.isRemoteLeaderboardEnabled);
  const syncError = useRewardStore((state) => state.syncError);
  const lastSyncedAt = useRewardStore((state) => state.lastSyncedAt);
  const syncRewards = useRewardStore((state) => state.syncRewards);
  const loadLeaderboard = useRewardStore((state) => state.loadLeaderboard);
  const leaderboard: LeaderboardItem[] =
    remoteLeaderboard.length > 0
      ? remoteLeaderboard
          .filter((item) => item.points > 0 || item.code === userCode)
          .map((item) => ({ ...item, isCurrentUser: item.code === userCode }))
          .concat(remoteLeaderboard.some((item) => item.code === userCode) ? [] : [{ code: userCode, points: monthlyPoints, isCurrentUser: true }])
          .sort((first, second) => second.points - first.points)
          .slice(0, LEADERBOARD_LIMIT)
      : [{ code: userCode, points: monthlyPoints, rank: 1, isCurrentUser: true }];
  const currentRank = leaderboard.find((item) => item.isCurrentUser)?.rank || leaderboard.findIndex((item) => item.isCurrentUser) + 1;
  const rewardEligibility = rewardConfig?.eligibility;
  const currentPrize = rewardEligibility?.prize || rewardConfig?.prizes.find((prize) => prize.rank === currentRank);
  const currentClaimRank = rewardEligibility?.rank || currentRank;
  const isMonthlyWinner = Boolean(
    rewardConfig?.isActive &&
      ((rewardEligibility?.isEligible && rewardEligibility.prize) || (currentPrize && currentRank <= 2 && monthlyPoints >= (rewardConfig.minimumMonthlyPoints || 0)))
  );
  const lastSyncLabel = lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "";

  useEffect(() => {
    const refresh = () => {
      void syncRewards();
      void loadLeaderboard("monthly");
      fetchRewardConfig(userCode).then((config) => {
        if (config) {
          setRewardConfig(config);
        }
      });
    };

    refresh();
    const leaderboardTimer = setInterval(refresh, 30000);
    return () => clearInterval(leaderboardTimer);
  }, [loadLeaderboard, syncRewards, userCode]);

  const sendRewardClaim = async () => {
    if (isSubmittingClaim) {
      return;
    }

    if (claimFullName.trim().length < 3 || claimContact.trim().length < 5 || claimAddress.trim().length < 10) {
      Alert.alert("Eksik bilgi", "Lütfen ad soyad, telefon/e-posta ve teslimat adresini doldurun.");
      return;
    }

    setIsSubmittingClaim(true);

    const result = await submitRewardClaim({
      userCode,
      fullName: claimFullName,
      contact: claimContact,
      address: claimAddress,
      monthKey: rewardEligibility?.monthKey
    });

    setIsSubmittingClaim(false);

    if (result?.ok) {
      setClaimFormVisible(false);
      setClaimFullName("");
      setClaimContact("");
      setClaimAddress("");
      Alert.alert("Başvurun alındı", "Ödül teslim bilgilerin bize ulaştı. Kazanan kontrolünden sonra seninle iletişime geçilecek.");
      return;
    }

    Alert.alert("Başvuru gönderilemedi", "Ödül başvurusu şu anda kaydedilemedi. Puan tablosunu yenileyip tekrar deneyin.");
  };

  const refreshRewards = () => {
    void syncRewards();
    void loadLeaderboard("monthly");
    fetchRewardConfig(userCode).then((config) => {
      if (config) {
        setRewardConfig(config);
      }
    });
  };

  return (
    <ScreenContainer>
      <AppHeader title="Puan Tablosu ve Ödüller" />

      <Card style={styles.rewardCard}>
        <View style={styles.rewardTop}>
          <View>
            <Text style={styles.rewardLabel}>Kullanıcı kodun</Text>
            <Text style={styles.rewardCode}>{userCode}</Text>
          </View>
          <View style={styles.rewardScore}>
            <Text style={styles.rewardScoreNumber}>{totalPoints}</Text>
            <Text style={styles.rewardScoreText}>puan</Text>
          </View>
        </View>

        <View style={styles.rewardStats}>
          <View style={styles.rewardStat}>
            <Text style={styles.rewardStatValue}>{weeklyPoints}</Text>
            <Text style={styles.rewardStatLabel}>Haftalık</Text>
          </View>
          <View style={styles.rewardDivider} />
          <View style={styles.rewardStat}>
            <Text style={styles.rewardStatValue}>{monthlyPoints}</Text>
            <Text style={styles.rewardStatLabel}>Aylık</Text>
          </View>
          <View style={styles.rewardDivider} />
          <View style={styles.rewardStat}>
            <Text style={styles.rewardStatValue}>{currentRank || "-"}</Text>
            <Text style={styles.rewardStatLabel}>Sıra</Text>
          </View>
        </View>

        <View style={styles.rewardSyncRow}>
          <View style={styles.rewardSyncTextWrap}>
            <Text style={styles.rewardSyncTitle}>
              {isRemoteLeaderboardEnabled ? (isSyncingRewards ? "Canlı tablo güncelleniyor" : "Canlı tablo hazır") : "Canlı tablo bağlantısı bekleniyor"}
            </Text>
            <Text style={styles.rewardSyncSubtitle}>
              {syncError ||
                (isRemoteLeaderboardEnabled
                  ? lastSyncLabel
                    ? `Son güncelleme ${lastSyncLabel}`
                    : "Puanlar ortak tabloya gönderilecek."
                  : "EXPO_PUBLIC_REWARDS_API_URL eklenince herkes aynı tabloyu görecek.")}
            </Text>
          </View>
          <Pressable accessibilityLabel="Puan tablosunu yenile" accessibilityRole="button" onPress={refreshRewards} style={({ pressed }) => [styles.rewardRefreshButton, pressed && styles.pressed]}>
            <Ionicons name="refresh" size={18} color={colors.emerald} />
          </Pressable>
        </View>

        {rewardConfig ? (
          <View style={[styles.prizePanel, !rewardConfig.isActive && styles.prizePanelMuted]}>
            <View style={styles.prizeCopy}>
              <View style={styles.prizeTitleRow}>
                <Ionicons name={rewardConfig.isActive ? "gift" : "pause-circle"} size={18} color={colors.emerald} />
                <Text style={styles.prizeTitle}>{rewardConfig.isActive ? "Bu Ayın Ödülleri" : "Ödül sistemi pasif"}</Text>
              </View>
              <Text style={styles.prizeSubtitle}>
                {rewardConfig.isActive ? `Ay sonunda ilk iki kullanıcı ödül kazanır. Minimum ${rewardConfig.minimumMonthlyPoints} puan gerekir.` : "Bu ay ödül başvurusu kapalı. Puanlar yine tabloda birikir."}
              </Text>
            </View>
            {rewardConfig.isActive ? (
              <View style={styles.prizeList}>
                {rewardConfig.prizes.map((prize) => (
                  <View key={`${prize.rank}-${prize.title}`} style={[styles.prizeItem, currentRank === prize.rank && styles.prizeItemActive]}>
                    {prize.imageUrl ? (
                      <Pressable accessibilityRole="imagebutton" accessibilityLabel={`${prize.title} görselini büyüt`} onPress={() => setSelectedPrizePreview(prize)} style={({ pressed }) => [styles.prizeImageButton, pressed && styles.pressed]}>
                        <Image source={{ uri: prize.imageUrl }} style={styles.prizeItemImage} resizeMode="cover" />
                        <View style={styles.prizeZoomBadge}>
                          <Ionicons name="expand" size={13} color={colors.white} />
                        </View>
                      </Pressable>
                    ) : (
                      <View style={styles.prizeItemImageFallback}>
                        <Ionicons name="gift" size={24} color={colors.emerald} />
                      </View>
                    )}
                    <View style={styles.prizeItemCopy}>
                      <Text style={styles.prizeItemRank}>{prize.rank}. Ödül</Text>
                      <Text style={styles.prizeItemTitle}>{prize.title}</Text>
                      <Text style={styles.prizeItemDescription}>{prize.description}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
            {isMonthlyWinner ? <PrimaryButton label="Ödülünü Al" icon="gift" style={styles.claimButton} onPress={() => setClaimFormVisible(true)} /> : null}
          </View>
        ) : null}

        <View style={styles.rewardRulesPanel}>
          <View style={styles.rewardRulesHeader}>
            <View>
              <Text style={styles.rewardRulesKicker}>PUAN KAZANIMLARI</Text>
              <Text style={styles.rewardRulesTitle}>Puanlar nasıl veriliyor?</Text>
            </View>
            <View style={styles.rewardRulesBadge}>
              <Ionicons name="sparkles" size={17} color={colors.gold} />
            </View>
          </View>
          <View style={styles.rewardRulesGrid}>
            <View style={styles.rewardRule}>
              <View style={styles.rewardRuleIcon}>
                <Ionicons name="finger-print" size={17} color={colors.emerald} />
              </View>
              <Text style={styles.rewardRuleTitle}>Zikir</Text>
              <Text style={styles.rewardRuleText}>33 zikir +3, 99 zikir toplam +10</Text>
            </View>
            <View style={styles.rewardRule}>
              <View style={styles.rewardRuleIcon}>
                <Ionicons name="share-social" size={17} color={colors.emerald} />
              </View>
              <Text style={styles.rewardRuleTitle}>Paylaşım</Text>
              <Text style={styles.rewardRuleText}>Cuma günü ilk paylaşım +2</Text>
            </View>
            <View style={styles.rewardRule}>
              <View style={styles.rewardRuleIcon}>
                <Ionicons name="play-circle" size={17} color={colors.emerald} />
              </View>
              <Text style={styles.rewardRuleTitle}>Dinleme</Text>
              <Text style={styles.rewardRuleText}>Dinlenen her dakika +1</Text>
            </View>
            <View style={styles.rewardRule}>
              <View style={styles.rewardRuleIcon}>
                <Ionicons name="checkmark-circle" size={17} color={colors.emerald} />
              </View>
              <Text style={styles.rewardRuleTitle}>Namaz</Text>
              <Text style={styles.rewardRuleText}>Vakit +2, tam gün +10</Text>
            </View>
          </View>
        </View>

        <RewardedAdPointsCard />

        <View style={styles.leaderboard}>
          {leaderboard.map((item, index) => (
            <View key={`${item.code}-${index}`} style={[styles.leaderboardRow, item.isCurrentUser && styles.leaderboardRowActive]}>
              <View style={styles.leaderboardRank}>
                <Text style={styles.leaderboardRankText}>{item.rank ?? index + 1}</Text>
              </View>
              <Text style={[styles.leaderboardCode, item.isCurrentUser && styles.leaderboardCodeActive]}>{item.isCurrentUser ? `${item.code} (Sen)` : item.code}</Text>
              <Text style={styles.leaderboardPoints}>{item.points} p</Text>
            </View>
          ))}
        </View>

        {rewardHistory[0] ? (
          <View style={styles.lastReward}>
            <Ionicons name="checkmark-circle" size={17} color={colors.emerald} />
            <Text numberOfLines={1} style={styles.lastRewardText}>
              Son kazanım: {rewardHistory[0].title} (+{rewardHistory[0].points})
            </Text>
          </View>
        ) : (
          <View style={styles.lastReward}>
            <Ionicons name="gift" size={17} color={colors.emerald} />
            <Text style={styles.lastRewardText}>İlk puanını kazanmak için zikir, paylaşım veya sure dinleme yap.</Text>
          </View>
        )}
      </Card>

      <Modal visible={claimFormVisible} transparent animationType="fade" onRequestClose={() => setClaimFormVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.claimModal}>
            <View style={styles.claimModalTop}>
              <View style={styles.claimModalCopy}>
                <Text style={styles.claimTitle}>Ödül teslim bilgileri</Text>
                <Text style={styles.claimSubtitle}>{currentClaimRank}. sıra: {currentPrize?.title || "Ödül"} - Kod: {userCode}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setClaimFormVisible(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={20} color={colors.emerald} />
              </Pressable>
            </View>
            <TextInput value={claimFullName} onChangeText={setClaimFullName} placeholder="Ad soyad" placeholderTextColor={colors.muted} style={styles.claimInput} />
            <TextInput value={claimContact} onChangeText={setClaimContact} placeholder="Telefon veya e-posta" placeholderTextColor={colors.muted} keyboardType="email-address" style={styles.claimInput} />
            <TextInput value={claimAddress} onChangeText={setClaimAddress} placeholder="Teslimat adresi" placeholderTextColor={colors.muted} multiline style={[styles.claimInput, styles.claimAddressInput]} />
            <Pressable accessibilityRole="button" disabled={isSubmittingClaim} onPress={() => void sendRewardClaim()} style={({ pressed }) => [styles.claimSubmitButton, pressed && styles.pressed]}>
              {isSubmittingClaim ? <ActivityIndicator color={colors.white} /> : <Text style={styles.claimSubmitText}>Gönder</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(selectedPrizePreview)} transparent animationType="fade" onRequestClose={() => setSelectedPrizePreview(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.prizePreviewModal}>
            <View style={styles.claimModalTop}>
              <View style={styles.claimModalCopy}>
                <Text style={styles.claimTitle}>{selectedPrizePreview?.title}</Text>
                <Text style={styles.claimSubtitle}>{selectedPrizePreview?.rank}. Ödül</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setSelectedPrizePreview(null)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={20} color={colors.emerald} />
              </Pressable>
            </View>
            {selectedPrizePreview?.imageUrl ? <Image source={{ uri: selectedPrizePreview.imageUrl }} style={styles.prizePreviewImage} resizeMode="contain" /> : null}
            {selectedPrizePreview?.description ? <Text style={styles.prizePreviewDescription}>{selectedPrizePreview.description}</Text> : null}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  rewardCard: {
    marginTop: 16,
    padding: 16
  },
  rewardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14
  },
  rewardLabel: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "800"
  },
  rewardCode: {
    color: colors.emerald,
    fontSize: 21,
    lineHeight: 27,
    marginTop: 3,
    fontWeight: "900"
  },
  rewardScore: {
    minWidth: 92,
    borderRadius: radii.md,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  rewardScoreNumber: {
    color: colors.emerald,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900"
  },
  rewardScoreText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: "900"
  },
  rewardStats: {
    marginTop: 14,
    minHeight: 72,
    borderRadius: radii.md,
    backgroundColor: colors.emeraldSoft,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10
  },
  rewardStat: {
    flex: 1,
    alignItems: "center"
  },
  rewardStatValue: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  rewardStatLabel: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
    fontWeight: "800"
  },
  rewardDivider: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(7,94,71,0.12)"
  },
  rewardSyncRow: {
    marginTop: 14,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11
  },
  rewardSyncTextWrap: {
    flex: 1,
    minWidth: 0
  },
  rewardSyncTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  rewardSyncSubtitle: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
    fontWeight: "700"
  },
  rewardRefreshButton: {
    width: 38,
    height: 38,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  prizePanel: {
    marginTop: 14,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.12)",
    overflow: "hidden"
  },
  prizePanelMuted: {
    opacity: 0.78
  },
  prizeCopy: {
    padding: 14
  },
  prizeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  prizeTitle: {
    flex: 1,
    color: colors.emerald,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900"
  },
  prizeSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    fontWeight: "700"
  },
  claimButton: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 14
  },
  prizeList: {
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14
  },
  prizeItem: {
    minHeight: 92,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10
  },
  prizeItemActive: {
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft
  },
  prizeItemImage: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    backgroundColor: colors.emeraldSoft
  },
  prizeImageButton: {
    width: 72,
    height: 72,
    borderRadius: radii.sm
  },
  prizeZoomBadge: {
    position: "absolute",
    right: 5,
    bottom: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(7,94,71,0.86)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.68)"
  },
  prizeItemImageFallback: {
    width: 72,
    height: 72,
    borderRadius: radii.sm,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  prizeItemCopy: {
    flex: 1,
    minWidth: 0
  },
  prizeItemRank: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "900"
  },
  prizeItemTitle: {
    color: colors.emerald,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 2,
    fontWeight: "900"
  },
  prizeItemDescription: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
    fontWeight: "700"
  },
  rewardRulesPanel: {
    marginTop: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14
  },
  rewardRulesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12
  },
  rewardRulesKicker: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 0,
    fontWeight: "900"
  },
  rewardRulesTitle: {
    color: colors.ink,
    fontFamily: typography.title,
    fontSize: 20,
    lineHeight: 25,
    marginTop: 2,
    fontWeight: "900"
  },
  rewardRulesBadge: {
    width: 38,
    height: 38,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft
  },
  rewardRulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  rewardRule: {
    width: "48%",
    minHeight: 118,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.1)",
    padding: 12
  },
  rewardRuleIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldSoft,
    marginBottom: 10
  },
  rewardRuleTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  rewardRuleText: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
    fontWeight: "800"
  },
  leaderboard: {
    marginTop: 16,
    gap: 8
  },
  leaderboardRow: {
    minHeight: 46,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10
  },
  leaderboardRowActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald
  },
  leaderboardRank: {
    width: 26,
    height: 26,
    borderRadius: radii.round,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  leaderboardRankText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  leaderboardCode: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  leaderboardCodeActive: {
    color: colors.white
  },
  leaderboardPoints: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: "900"
  },
  lastReward: {
    marginTop: 14,
    borderRadius: radii.md,
    backgroundColor: colors.emeraldSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  lastRewardText: {
    flex: 1,
    color: colors.emerald,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.72
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(8,24,20,0.52)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  claimModal: {
    width: "100%",
    maxWidth: 430,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    padding: 18,
    ...shadows.card
  },
  prizePreviewModal: {
    width: "100%",
    maxWidth: 460,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    padding: 18,
    ...shadows.card
  },
  prizePreviewImage: {
    width: "100%",
    height: 320,
    borderRadius: radii.md,
    backgroundColor: colors.emeraldSoft
  },
  prizePreviewDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
    fontWeight: "800"
  },
  claimModalTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14
  },
  claimModalCopy: {
    flex: 1,
    minWidth: 0
  },
  claimTitle: {
    color: colors.emerald,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900"
  },
  claimSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
    fontWeight: "800"
  },
  modalCloseButton: {
    width: 38,
    height: 38,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  claimInput: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    color: colors.ink,
    paddingHorizontal: 13,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10
  },
  claimAddressInput: {
    minHeight: 96,
    textAlignVertical: "top"
  },
  claimSubmitButton: {
    minHeight: 50,
    borderRadius: radii.md,
    backgroundColor: colors.emerald,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14
  },
  claimSubmitText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900"
  }
});
