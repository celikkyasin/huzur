import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "@/components/AppHeader";
import { SettingsRow } from "@/components/SettingsRow";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getPrayerNotificationsEnabled, setPrayerNotificationsEnabled } from "@/services/prayerNotifications";
import type { RemoteLeaderboardItem } from "@/services/rewardsApi";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";
import { useRewardStore } from "@/store/rewardStore";
import { colors, radii, shadows, typography } from "@/theme";
import type { SettingsItem } from "@/types";

const THEME_STORAGE_KEY = "huzur.settings.theme";
const LANGUAGE_STORAGE_KEY = "huzur.settings.language";
const APP_VERSION = "1.0.14";

type ThemeMode = "Aydınlık" | "Koyu";
type LanguageMode = "Türkçe" | "English";
type LeaderboardItem = RemoteLeaderboardItem & {
  isCurrentUser?: boolean;
};

const preferenceItems: SettingsItem[] = [
  { id: "prayer", title: "Namaz Vakti Bildirimleri", subtitle: "Ezan sesi ve vakit hatırlatmaları", icon: "notifications" },
  { id: "theme", title: "Tema", subtitle: "Görünüm tercihi", icon: "color-palette" }
];

const supportItems: SettingsItem[] = [
  { id: "about", title: "Uygulama Hakkında", subtitle: `Sürüm ${APP_VERSION}`, icon: "information-circle" },
  { id: "contact", title: "İletişim", subtitle: "Destek ve geri bildirim", icon: "mail" }
];

const leaderboardSamples: LeaderboardItem[] = [
  { code: "HZR-82914", points: 420 },
  { code: "HZR-51672", points: 315 },
  { code: "HZR-74038", points: 260 },
  { code: "HZR-19305", points: 185 }
];

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("Aydınlık");
  const [languageMode, setLanguageMode] = useState<LanguageMode>("Türkçe");
  const prayerTimes = usePrayerTimesStore((state) => state.times);
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
  const leaderboardSource = remoteLeaderboard.length > 0 ? remoteLeaderboard : leaderboardSamples;
  const leaderboard: LeaderboardItem[] = [...leaderboardSource.filter((item) => item.code !== userCode), { code: userCode, points: weeklyPoints, isCurrentUser: true }]
    .sort((first, second) => second.points - first.points)
    .slice(0, 5);
  const currentRank = leaderboard.findIndex((item) => item.isCurrentUser) + 1;
  const lastSyncLabel = lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "";

  useEffect(() => {
    getPrayerNotificationsEnabled().then(setNotificationsEnabled);
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (value === "Aydınlık" || value === "Koyu") {
        setThemeMode(value);
      }
    });
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((value) => {
      if (value === "Türkçe" || value === "English") {
        setLanguageMode(value);
      }
    });
    void syncRewards();
    void loadLeaderboard();

    const leaderboardTimer = setInterval(() => {
      void syncRewards();
      void loadLeaderboard();
    }, 30000);

    return () => clearInterval(leaderboardTimer);
  }, [loadLeaderboard, syncRewards]);

  const showProfileActions = () => {
    Alert.alert("Profil", "Profil ayarları hesap sistemiyle birlikte açılacak. Bu kart konum yenileme veya izin işlemi başlatmaz.", [{ text: "Tamam" }]);
  };

  const toggleNotifications = async (nextValue = !notificationsEnabled) => {
    if (isUpdatingNotifications) {
      return;
    }

    setIsUpdatingNotifications(true);

    try {
      const result = await setPrayerNotificationsEnabled(nextValue, prayerTimes);
      setNotificationsEnabled(result.enabled);

      if (!result.permissionGranted) {
        Alert.alert("Bildirim izni gerekli", "Vakit hatırlatmaları için bildirim izni vermeniz gerekir.");
      } else {
        Alert.alert(result.enabled ? "Bildirimler açıldı" : "Bildirimler kapatıldı", result.enabled ? "Namaz vakti hatırlatmaları hazır." : "Namaz vakti hatırlatmaları kapatıldı.");
      }
    } catch {
      Alert.alert("Bildirim ayarlanamadı", "Şu anda bildirim tercihi kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const setLanguage = async (language: LanguageMode) => {
    setLanguageMode(language);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    Alert.alert("Dil güncellendi", language === "English" ? "English selected. Full app translation will be completed with the language system update." : "Uygulama dili Türkçe olarak ayarlandı.");
  };

  const toggleTheme = async () => {
    const nextTheme: ThemeMode = themeMode === "Aydınlık" ? "Koyu" : "Aydınlık";
    setThemeMode(nextTheme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    Alert.alert("Tema güncellendi", `${nextTheme} tema tercihiniz kaydedildi.`);
  };

  const showAbout = () => {
    Alert.alert("Huzur Hakkında", `Huzur; namaz vakitleri, Kur'an-ı Kerim, dualar, zikir ve günlük manevi alışkanlıklar için hazırlanmış sakin bir İslami yaşam uygulamasıdır.\n\nSürüm: ${APP_VERSION}`);
  };

  const openContact = async () => {
    const url = "mailto:destek@huzur.app?subject=Huzur%20Destek";
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      return;
    }

    Alert.alert("İletişim", "Bize destek@huzur.app adresinden ulaşabilirsiniz.");
  };

  const showPremium = () => {
    Alert.alert("Huzur Premium", "Premium özellikler yakında açılacak: özel temalar, gelişmiş hatırlatıcılar ve reklamsız sakin deneyim.");
  };

  const handleSettingPress = (id: string) => {
    if (id === "prayer") {
      void toggleNotifications();
      return;
    }
    if (id === "theme") {
      void toggleTheme();
      return;
    }
    if (id === "about") {
      showAbout();
      return;
    }
    if (id === "contact") {
      void openContact();
    }
  };

  const NotificationSwitch = () => (
    <Switch
      value={notificationsEnabled}
      disabled={isUpdatingNotifications}
      onValueChange={(value) => void toggleNotifications(value)}
      trackColor={{ false: colors.line, true: colors.emerald }}
      thumbColor={colors.white}
      ios_backgroundColor={colors.line}
    />
  );

  const ThemeBadge = () => (
    <View style={styles.compactBadge}>
      <Ionicons name={themeMode === "Aydınlık" ? "sunny" : "moon"} size={15} color={colors.emerald} />
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={styles.compactBadgeText}>
        {themeMode}
      </Text>
    </View>
  );

  return (
    <ScreenContainer contentStyle={styles.screen}>
      <AppHeader title="Ayarlar" />

      <LinearGradient colors={["#FFFDF8", "#EEF6F0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroPanel}>
        <View style={styles.heroIcon}>
          <Ionicons name="settings" size={24} color={colors.emerald} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.title}>Ayarlar</Text>
          <Text style={styles.subtitle}>Bildirim, dil, görünüm ve destek tercihlerinizi düzenleyin.</Text>
        </View>
      </LinearGradient>

      <SectionTitle title="Hesap" />
      <Pressable accessibilityRole="button" onPress={showProfileActions} style={({ pressed }) => [styles.profilePressable, pressed && styles.pressed]}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={colors.emerald} />
          </View>
          <View style={styles.profileText}>
            <Text numberOfLines={1} style={styles.profileTitle}>
              Misafir kullanım
            </Text>
            <Text numberOfLines={2} style={styles.profileSubtitle}>
              Profil ayarları hesap özelliğiyle birlikte açılacak.
            </Text>
          </View>
          <View style={styles.soonBadge}>
            <Text style={styles.soonBadgeText}>Yakında</Text>
          </View>
        </View>
      </Pressable>

      <SectionTitle title="Puan Tablosu" />
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
          <Pressable
            accessibilityLabel="Puan tablosunu yenile"
            accessibilityRole="button"
            onPress={() => {
              void syncRewards();
              void loadLeaderboard();
            }}
            style={({ pressed }) => [styles.rewardRefreshButton, pressed && styles.pressed]}
          >
            <Ionicons name="refresh" size={18} color={colors.emerald} />
          </Pressable>
        </View>

        <View style={styles.rewardRules}>
          <View style={styles.rewardRule}>
            <Ionicons name="finger-print" size={15} color={colors.emerald} />
            <Text style={styles.rewardRuleText}>33 zikir: +3</Text>
          </View>
          <View style={styles.rewardRule}>
            <Ionicons name="sparkles" size={15} color={colors.emerald} />
            <Text style={styles.rewardRuleText}>99 zikir: toplam +10</Text>
          </View>
          <View style={styles.rewardRule}>
            <Ionicons name="share-social" size={15} color={colors.emerald} />
            <Text style={styles.rewardRuleText}>Cuma paylaşımı: +2</Text>
          </View>
          <View style={styles.rewardRule}>
            <Ionicons name="play-circle" size={15} color={colors.emerald} />
            <Text style={styles.rewardRuleText}>Dinlenen dakika: +1</Text>
          </View>
        </View>

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

      <SectionTitle title="Dil Seçimi" />
      <Card style={styles.languageCard}>
        <View style={styles.languageHeader}>
          <View style={styles.languageIcon}>
            <Ionicons name="globe" size={21} color={colors.emerald} />
          </View>
          <View style={styles.languageCopy}>
            <Text style={styles.languageTitle}>Uygulama dili</Text>
            <Text style={styles.languageSubtitle}>Dil tercihinizi buradan seçin.</Text>
          </View>
        </View>
        <View style={styles.segmentedControl}>
          {(["Türkçe", "English"] as LanguageMode[]).map((language) => {
            const selected = languageMode === language;
            return (
              <Pressable key={language} accessibilityRole="button" onPress={() => void setLanguage(language)} style={[styles.languageOption, selected && styles.languageOptionSelected]}>
                <Text style={[styles.languageOptionText, selected && styles.languageOptionTextSelected]}>{language}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <SectionTitle title="Tercihler" />
      <Card style={styles.rows}>
        <SettingsRow item={preferenceItems[0]} onPress={() => handleSettingPress("prayer")} showChevron={false} rightElement={<NotificationSwitch />} />
        <SettingsRow item={preferenceItems[1]} isLast onPress={() => handleSettingPress("theme")} showChevron={false} rightElement={<ThemeBadge />} />
      </Card>

      <SectionTitle title="Destek" />
      <Card style={styles.rows}>
        {supportItems.map((item, index) => (
          <SettingsRow key={item.id} item={item} isLast={index === supportItems.length - 1} onPress={() => handleSettingPress(item.id)} />
        ))}
      </Card>

      <Card variant="emerald" style={styles.premium}>
        <View style={styles.premiumTop}>
          <View style={styles.premiumIcon}>
            <Ionicons name="sparkles" size={22} color={colors.emerald} />
          </View>
          <Text style={styles.premiumTitle}>Huzur Premium</Text>
        </View>
        <Text style={styles.premiumSubtitle}>Özel temalar, gelişmiş hatırlatıcılar ve reklamsız sakin bir deneyim.</Text>
        <PrimaryButton label="Bilgi Al" icon="sparkles" tone="gold" style={styles.premiumButton} onPress={showPremium} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 132
  },
  heroPanel: {
    marginTop: 16,
    marginBottom: 18,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.08)",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...shadows.card
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  heroCopy: {
    flex: 1,
    minWidth: 0
  },
  title: {
    fontFamily: typography.title,
    color: colors.emerald,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    fontWeight: "700"
  },
  profilePressable: {
    borderRadius: radii.lg
  },
  profileCard: {
    minHeight: 98,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...shadows.card
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  profileText: {
    flex: 1,
    minWidth: 0
  },
  profileTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 16,
    lineHeight: 21
  },
  profileSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "700"
  },
  soonBadge: {
    minWidth: 70,
    height: 34,
    borderRadius: radii.round,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  soonBadgeText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  rewardCard: {
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
  rewardRules: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14
  },
  rewardRule: {
    minHeight: 34,
    borderRadius: radii.round,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10
  },
  rewardRuleText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: "900"
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
  languageCard: {
    padding: 16
  },
  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  languageIcon: {
    width: 46,
    height: 46,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  languageCopy: {
    flex: 1,
    minWidth: 0
  },
  languageTitle: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "900"
  },
  languageSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    fontWeight: "700"
  },
  segmentedControl: {
    marginTop: 14,
    minHeight: 48,
    borderRadius: radii.md,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.08)",
    padding: 4,
    flexDirection: "row",
    gap: 4
  },
  languageOption: {
    flex: 1,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  languageOptionSelected: {
    backgroundColor: colors.emerald
  },
  languageOptionText: {
    color: colors.emerald,
    fontSize: 13,
    fontWeight: "900"
  },
  languageOptionTextSelected: {
    color: colors.white
  },
  rows: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden"
  },
  premium: {
    marginTop: 22,
    padding: 20
  },
  premiumTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  premiumIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.round,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  premiumTitle: {
    flex: 1,
    color: colors.goldSoft,
    fontFamily: typography.title,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900"
  },
  premiumSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    fontWeight: "700"
  },
  premiumButton: {
    marginTop: 16
  },
  pressed: {
    opacity: 0.72
  },
  compactBadge: {
    minWidth: 96,
    maxWidth: 112,
    minHeight: 38,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10
  },
  compactBadgeText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900",
    flexShrink: 1
  }
});
