import { useEffect, useState } from "react";
import { Alert, Linking, Platform, Pressable, StyleSheet, Switch, Text, View, type GestureResponderEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "@/components/AppHeader";
import { SettingsRow } from "@/components/SettingsRow";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  getPrayerNotificationPreferences,
  getPrayerNotificationsEnabled,
  MAX_REMINDER_MINUTES,
  setPrayerNotificationPreferences,
  setPrayerNotificationsEnabled,
  soundModeOptions,
  type PrayerNotificationPreferences,
  type PrayerNotificationSoundMode
} from "@/services/prayerNotifications";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";
import { colors, radii, shadows, typography } from "@/theme";
import type { SettingsItem } from "@/types";

const APP_VERSION = "1.0.61";

const preferenceItems: SettingsItem[] = [{ id: "prayer", title: "Namaz Vakti Bildirimleri", subtitle: "Dakika ve ses tercihini düzenle", icon: "notifications" }];

const supportItems: SettingsItem[] = [
  { id: "about", title: "Uygulama Hakkında", subtitle: `Sürüm ${APP_VERSION}`, icon: "information-circle" },
  { id: "contact", title: "İletişim", subtitle: "Destek ve geri bildirim", icon: "mail" }
];

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<PrayerNotificationPreferences>({ reminderMinutes: 15, soundMode: "default" });
  const [reminderTrackWidth, setReminderTrackWidth] = useState(1);
  const prayerTimes = usePrayerTimesStore((state) => state.times);
  const reminderRatio = notificationPreferences.reminderMinutes / MAX_REMINDER_MINUTES;

  useEffect(() => {
    getPrayerNotificationsEnabled().then(setNotificationsEnabled);
    getPrayerNotificationPreferences().then(setNotificationPreferences);
  }, []);

  const showProfileActions = () => {
    Alert.alert("Profil", "Profil ayarları hesap sistemiyle birlikte açılacak. Bu kart konum yenileme veya izin işlemi başlatmaz.", [{ text: "Tamam" }]);
  };

  const toggleNotifications = async (nextValue = !notificationsEnabled) => {
    if (isUpdatingNotifications) {
      return;
    }

    setIsUpdatingNotifications(true);
    try {
      const result = await setPrayerNotificationsEnabled(nextValue, prayerTimes, notificationPreferences);
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

  const updateNotificationPreferences = async (preferences: Partial<PrayerNotificationPreferences>) => {
    if (isUpdatingNotifications) {
      return;
    }

    setIsUpdatingNotifications(true);
    try {
      const nextPreferences = await setPrayerNotificationPreferences(preferences, prayerTimes);
      setNotificationPreferences(nextPreferences);
    } catch {
      Alert.alert("Bildirim ayarlanamadı", "Bildirim tercihi şu anda kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const showAbout = () => {
    Alert.alert("Huzur Hakkında", `Huzur; namaz vakitleri, Kur'an-ı Kerim, dualar, zikir ve günlük manevi alışkanlıklar için hazırlanmış sakin bir İslami yaşam uygulamasıdır.\n\nSürüm: ${APP_VERSION}`);
  };

  const openContact = async () => {
    const url = "mailto:destek@huzur.app?subject=Huzur%20Destek";
    if (await Linking.canOpenURL(url)) {
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
    if (id === "about") {
      showAbout();
      return;
    }
    if (id === "contact") {
      void openContact();
    }
  };

  const updateReminderFromGesture = (event: GestureResponderEvent) => {
    const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / Math.max(1, reminderTrackWidth)));
    const nextMinutes = Math.round(ratio * MAX_REMINDER_MINUTES);
    void updateNotificationPreferences({ reminderMinutes: nextMinutes });
  };

  const openAppNotificationSettings = async () => {
    try {
      if (Platform.OS === "android" && Linking.sendIntent) {
        await Linking.sendIntent("android.settings.APP_NOTIFICATION_SETTINGS", [
          { key: "android.provider.extra.APP_PACKAGE", value: "com.huzur.app" }
        ]);
        return;
      }

      await Linking.openSettings();
    } catch {
      Alert.alert("Ayarlar açılamadı", "Telefon ayarlarından Huzur > Bildirimler bölümüne girerek sadece Huzur uygulamasının bildirim sesini değiştirebilirsiniz.");
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

  const NotificationPreferencesPanel = () => (
    <Card style={styles.notificationPanel}>
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Ionicons name="notifications" size={21} color={colors.emerald} />
        </View>
        <View style={styles.notificationCopy}>
          <Text style={styles.notificationTitle}>Namaz vakti uyarıları</Text>
          <Text style={styles.notificationSubtitle}>Ezan sesi sadece siz seçerseniz çalar. Toplantı ve sessiz ortamlar için standart ya da sessiz modu kullanabilirsiniz.</Text>
        </View>
      </View>

      <View style={styles.preferenceTitleRow}>
        <Text style={styles.preferenceLabel}>Ne kadar önce haber versin?</Text>
        <Text style={styles.preferenceValue}>{notificationPreferences.reminderMinutes === 0 ? "Vakit girince" : `${notificationPreferences.reminderMinutes} dk önce`}</Text>
      </View>

      <View
        accessibilityRole="adjustable"
        onLayout={(event) => setReminderTrackWidth(event.nativeEvent.layout.width)}
        onResponderGrant={updateReminderFromGesture}
        onResponderMove={updateReminderFromGesture}
        onStartShouldSetResponder={() => true}
        style={styles.reminderSlider}
      >
        <View style={styles.reminderTrack} />
        <View style={[styles.reminderFill, { width: `${reminderRatio * 100}%` }]} />
        <View style={[styles.reminderThumb, { left: `${reminderRatio * 100}%` }]} />
      </View>
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>0 dk</Text>
        <Text style={styles.sliderLabel}>15 dk</Text>
        <Text style={styles.sliderLabel}>30 dk</Text>
      </View>

      <Text style={styles.preferenceLabel}>Bildirim sesi</Text>
      <View style={styles.soundGrid}>
        {soundModeOptions.map((option) => {
          const selected = notificationPreferences.soundMode === option.mode;
          const iconName: Record<PrayerNotificationSoundMode, keyof typeof Ionicons.glyphMap> = {
            silent: "volume-mute",
            default: "phone-portrait",
            adhan: "musical-notes"
          };

          return (
            <Pressable
              key={option.mode}
              accessibilityRole="button"
              disabled={isUpdatingNotifications}
              onPress={() => void updateNotificationPreferences({ soundMode: option.mode })}
              style={[styles.soundOption, selected && styles.soundOptionSelected]}
            >
              <Ionicons name={iconName[option.mode]} size={18} color={selected ? colors.white : colors.emerald} />
              <View style={styles.soundTextWrap}>
                <Text style={[styles.soundTitle, selected && styles.soundTitleSelected]}>{option.label}</Text>
                <Text style={[styles.soundDescription, selected && styles.soundDescriptionSelected]} numberOfLines={2}>
                  {option.description}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable accessibilityRole="button" onPress={openAppNotificationSettings} style={({ pressed }) => [styles.systemSoundButton, pressed && styles.pressed]}>
        <Ionicons name="settings" size={17} color={colors.emerald} />
        <Text style={styles.systemSoundText}>Huzur bildirim sesini değiştir</Text>
      </Pressable>
    </Card>
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
          <Text style={styles.subtitle}>Bildirim ve destek tercihlerinizi düzenleyin.</Text>
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

      <SectionTitle title="Tercihler" />
      <Card style={styles.rows}>
        <SettingsRow item={preferenceItems[0]} isLast onPress={() => handleSettingPress("prayer")} showChevron={false} rightElement={<NotificationSwitch />} />
      </Card>
      <NotificationPreferencesPanel />

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
  rows: {
    paddingVertical: 2
  },
  notificationPanel: {
    marginTop: 12,
    gap: 14
  },
  notificationHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  notificationCopy: {
    flex: 1,
    minWidth: 0
  },
  notificationTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  notificationSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "700"
  },
  preferenceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  preferenceLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  preferenceValue: {
    color: colors.emerald,
    fontSize: 13,
    fontWeight: "900"
  },
  reminderSlider: {
    height: 34,
    justifyContent: "center"
  },
  reminderTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line
  },
  reminderFill: {
    position: "absolute",
    left: 0,
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.emerald
  },
  reminderThumb: {
    position: "absolute",
    width: 24,
    height: 24,
    marginLeft: -12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 5,
    borderColor: colors.emerald,
    ...shadows.soft
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -8
  },
  sliderLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  soundGrid: {
    gap: 9
  },
  soundOption: {
    minHeight: 62,
    borderRadius: radii.md,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  soundOptionSelected: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald
  },
  soundTextWrap: {
    flex: 1,
    minWidth: 0
  },
  soundTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  soundTitleSelected: {
    color: colors.white
  },
  soundDescription: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
    fontWeight: "700"
  },
  soundDescriptionSelected: {
    color: "rgba(255,255,255,0.76)"
  },
  systemSoundButton: {
    minHeight: 44,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.18)",
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14
  },
  systemSoundText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  premium: {
    marginTop: 18,
    gap: 12
  },
  premiumTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  premiumTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "900",
    fontFamily: typography.title
  },
  premiumSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  premiumButton: {
    marginTop: 2
  },
  pressed: {
    opacity: 0.72
  }
});
