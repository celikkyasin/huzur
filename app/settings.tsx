import { useEffect, useState } from "react";
import { Linking, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View, type GestureResponderEvent } from "react-native";
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

const APP_VERSION = "1.0.78";
const SUPPORT_EMAIL = "celikkyasin@gmail.com";

type FeedbackModalState = {
  visible: boolean;
  tone: "success" | "warning" | "info";
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
};

const preferenceItems: SettingsItem[] = [{ id: "prayer", title: "Namaz Vakti Bildirimleri", subtitle: "Dakika ve ses tercihini düzenle", icon: "notifications" }];

const supportItems: SettingsItem[] = [
  { id: "about", title: "Uygulama Hakkında", subtitle: `Sürüm ${APP_VERSION}`, icon: "information-circle" },
  { id: "contact", title: "İletişim", subtitle: "Destek ve geri bildirim", icon: "mail" }
];

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsExpanded, setNotificationsExpanded] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<PrayerNotificationPreferences>({ reminderMinutes: 15, soundMode: "default" });
  const [selectedReminderMinutes, setSelectedReminderMinutes] = useState(15);
  const [reminderTrackWidth, setReminderTrackWidth] = useState(1);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    visible: false,
    tone: "info",
    icon: "information-circle",
    title: "",
    message: ""
  });
  const [aboutVisible, setAboutVisible] = useState(false);
  const prayerTimes = usePrayerTimesStore((state) => state.times);
  const reminderRatio = selectedReminderMinutes / MAX_REMINDER_MINUTES;

  useEffect(() => {
    getPrayerNotificationsEnabled().then(setNotificationsEnabled);
    getPrayerNotificationPreferences().then((preferences) => {
      setNotificationPreferences(preferences);
      setSelectedReminderMinutes(preferences.reminderMinutes);
    });
  }, []);

  const showFeedback = (modal: Omit<FeedbackModalState, "visible">) => {
    setFeedbackModal({ ...modal, visible: true });
  };

  const closeFeedback = () => {
    setFeedbackModal((current) => ({ ...current, visible: false }));
  };

  const showProfileActions = () => {
    showFeedback({
      tone: "info",
      icon: "person-circle",
      title: "Profil yakında",
      message: "Profil ayarları hesap sistemiyle birlikte açılacak. Bu alan konum yenileme veya izin işlemi başlatmaz."
    });
  };

  const toggleNotifications = async (nextValue = !notificationsEnabled) => {
    if (isUpdatingNotifications) {
      return;
    }

    setIsUpdatingNotifications(true);
    try {
      const preferencesForToggle: PrayerNotificationPreferences = {
        ...notificationPreferences,
        reminderMinutes: selectedReminderMinutes
      };
      const result = await setPrayerNotificationsEnabled(nextValue, prayerTimes, preferencesForToggle);
      setNotificationsEnabled(result.enabled);
      if (result.enabled) {
        setNotificationPreferences(preferencesForToggle);
      }

      if (!result.permissionGranted) {
        showFeedback({
          tone: "warning",
          icon: "notifications-off",
          title: "Bildirim izni gerekli",
          message: "Namaz vakti hatırlatmalarını kullanmak için Huzur bildirimlerine izin vermen gerekiyor."
        });
      } else {
        showFeedback({
          tone: result.enabled ? "success" : "info",
          icon: result.enabled ? "checkmark-circle" : "moon",
          title: result.enabled ? "Hatırlatmalar açıldı" : "Hatırlatmalar kapatıldı",
          message: result.enabled
            ? `${preferencesForToggle.reminderMinutes === 0 ? "Vakit girince" : `${preferencesForToggle.reminderMinutes} dakika önce`} uyarı hazır. Ses tercihin: ${soundModeOptions.find((option) => option.mode === preferencesForToggle.soundMode)?.label ?? "Kısa uyarı"}.`
            : "Namaz vakti hatırlatmaları kapatıldı."
        });
      }
    } catch {
      showFeedback({
        tone: "warning",
        icon: "alert-circle",
        title: "Bildirim ayarlanamadı",
        message: "Şu anda bildirim tercihi kaydedilemedi. Lütfen tekrar deneyin."
      });
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
      setSelectedReminderMinutes(nextPreferences.reminderMinutes);
    } catch {
      showFeedback({
        tone: "warning",
        icon: "alert-circle",
        title: "Tercih kaydedilemedi",
        message: "Bildirim tercihi şu anda kaydedilemedi. Lütfen tekrar deneyin."
      });
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const openContact = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=Huzur%20Destek`;
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
      return;
    }

    showFeedback({
      tone: "info",
      icon: "mail",
      title: "İletişim",
      message: `Bize ${SUPPORT_EMAIL} adresinden ulaşabilirsiniz.`
    });
  };

  const showPremium = () => {
    showFeedback({
      tone: "info",
      icon: "sparkles",
      title: "Huzur Premium",
      message: "Özel temalar, gelişmiş hatırlatıcılar ve reklamsız sakin bir deneyim yakında açılacak."
    });
  };

  const handleSettingPress = (id: string) => {
    if (id === "prayer") {
      setNotificationsExpanded((current) => !current);
      return;
    }
    if (id === "about") {
      setAboutVisible(true);
      return;
    }
    if (id === "contact") {
      void openContact();
    }
  };

  const updateReminderFromGesture = (event: GestureResponderEvent) => {
    const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / Math.max(1, reminderTrackWidth)));
    setSelectedReminderMinutes(Math.round(ratio * MAX_REMINDER_MINUTES));
  };

  const commitReminderMinutes = (minutes = selectedReminderMinutes) => {
    const nextMinutes = Math.max(0, Math.min(MAX_REMINDER_MINUTES, Math.round(minutes)));
    setSelectedReminderMinutes(nextMinutes);
    void updateNotificationPreferences({ reminderMinutes: nextMinutes });
  };

  const adjustReminderMinutes = (amount: number) => {
    commitReminderMinutes(selectedReminderMinutes + amount);
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
    <View style={styles.notificationPanel}>
      <View style={styles.preferenceTitleRow}>
        <Text style={styles.preferenceLabel}>Ne kadar önce haber versin?</Text>
        <Text style={styles.preferenceValue}>{selectedReminderMinutes === 0 ? "Vakit girince" : `${selectedReminderMinutes} dk önce`}</Text>
      </View>

      <View style={styles.minutePicker}>
        <Pressable accessibilityRole="button" disabled={isUpdatingNotifications} onPress={() => adjustReminderMinutes(-1)} style={({ pressed }) => [styles.minuteButton, pressed && styles.pressed]}>
          <Ionicons name="remove" size={18} color={colors.emerald} />
        </Pressable>
        <View style={styles.minuteInputWrap}>
          <TextInput
            value={String(selectedReminderMinutes)}
            keyboardType="number-pad"
            maxLength={2}
            onChangeText={(value) => {
              const number = Number(value.replace(/\D/g, ""));
              setSelectedReminderMinutes(Number.isFinite(number) ? Math.max(0, Math.min(MAX_REMINDER_MINUTES, number)) : 0);
            }}
            onEndEditing={() => commitReminderMinutes()}
            onSubmitEditing={() => commitReminderMinutes()}
            selectTextOnFocus
            style={styles.minuteInput}
          />
          <Text style={styles.minuteSuffix}>dk</Text>
        </View>
        <Pressable accessibilityRole="button" disabled={isUpdatingNotifications} onPress={() => adjustReminderMinutes(1)} style={({ pressed }) => [styles.minuteButton, pressed && styles.pressed]}>
          <Ionicons name="add" size={18} color={colors.emerald} />
        </Pressable>
      </View>

      <View
        accessibilityRole="adjustable"
        onLayout={(event) => setReminderTrackWidth(event.nativeEvent.layout.width)}
        onResponderGrant={updateReminderFromGesture}
        onResponderMove={updateReminderFromGesture}
        onResponderRelease={() => commitReminderMinutes()}
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
            default: "notifications",
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

      <View style={styles.soundNote}>
        <Ionicons name="shield-checkmark" size={16} color={colors.emerald} />
        <Text style={styles.soundNoteText}>Ses tercihi uygulama içinden seçilir; telefonun genel bildirim sesi değiştirilmez.</Text>
      </View>
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
      <Card style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: notificationsExpanded }} onPress={() => handleSettingPress("prayer")} style={({ pressed }) => [styles.notificationHeaderButton, pressed && styles.pressed]}>
            <View style={styles.notificationIcon}>
              <Ionicons name="notifications" size={21} color={colors.emerald} />
            </View>
            <View style={styles.notificationCopy}>
              <Text style={styles.notificationTitle}>Namaz vakti bildirimleri</Text>
              <Text style={styles.notificationSubtitle}>{notificationsEnabled ? `${selectedReminderMinutes === 0 ? "Vakit girince" : `${selectedReminderMinutes} dk önce`} haber verir` : "Kapalı"}</Text>
            </View>
            <Ionicons name={notificationsExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.muted} />
          </Pressable>
          <NotificationSwitch />
        </View>
        {notificationsExpanded ? <NotificationPreferencesPanel /> : null}
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

      <FeedbackModal modal={feedbackModal} onClose={closeFeedback} />
      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} version={APP_VERSION} />
    </ScreenContainer>
  );
}

function FeedbackModal({ modal, onClose }: { modal: FeedbackModalState; onClose: () => void }) {
  const toneColor = modal.tone === "warning" ? "#B7791F" : colors.emerald;

  return (
    <Modal visible={modal.visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalTopRow}>
            <View />
            <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={onClose} style={({ pressed }) => [styles.modalCloseButton, pressed && styles.pressed]}>
              <Ionicons name="close" size={20} color={colors.emerald} />
            </Pressable>
          </View>
          <View style={[styles.modalIcon, { backgroundColor: modal.tone === "warning" ? "#FFF4D8" : colors.emeraldSoft }]}>
            <Ionicons name={modal.icon} size={30} color={toneColor} />
          </View>
          <Text style={styles.modalTitle}>{modal.title}</Text>
          <Text style={styles.modalMessage}>{modal.message}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}>
            <Text style={styles.modalButtonText}>Tamam</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function AboutModal({ visible, onClose, version }: { visible: boolean; onClose: () => void; version: string }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.aboutCard}>
          <Pressable accessibilityRole="button" accessibilityLabel="Kapat" onPress={onClose} style={({ pressed }) => [styles.aboutCloseButton, pressed && styles.pressed]}>
            <Ionicons name="close" size={20} color={colors.white} />
          </Pressable>
          <LinearGradient colors={[colors.emerald, "#0B7A5C"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aboutHero}>
            <View style={styles.aboutLogo}>
              <Ionicons name="moon" size={30} color={colors.gold} />
            </View>
            <Text style={styles.aboutTitle}>Huzur</Text>
            <Text style={styles.aboutSubtitle}>Namaz vakitleri, Kur'an-ı Kerim, dualar, zikir ve günlük manevi alışkanlıklar için sakin bir İslami yaşam uygulaması.</Text>
          </LinearGradient>
          <View style={styles.aboutInfoRow}>
            <Ionicons name="phone-portrait" size={18} color={colors.emerald} />
            <Text style={styles.aboutInfoText}>Sürüm {version}</Text>
          </View>
          <View style={styles.aboutInfoRow}>
            <Ionicons name="heart" size={18} color={colors.emerald} />
            <Text style={styles.aboutInfoText}>Sade, okunaklı ve günlük kullanıma uygun bir deneyim.</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}>
            <Text style={styles.modalButtonText}>Kapat</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
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
  notificationCard: {
    paddingVertical: 12,
    gap: 12
  },
  notificationPanel: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 14,
    gap: 14
  },
  notificationHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  notificationHeaderButton: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
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
  minutePicker: {
    minHeight: 54,
    borderRadius: radii.md,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    padding: 7,
    gap: 8
  },
  minuteButton: {
    width: 40,
    height: 40,
    borderRadius: radii.round,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.16)",
    alignItems: "center",
    justifyContent: "center"
  },
  minuteInputWrap: {
    flex: 1,
    minHeight: 42,
    borderRadius: radii.round,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  minuteInput: {
    minWidth: 44,
    paddingVertical: 0,
    color: colors.emerald,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "900"
  },
  minuteSuffix: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  reminderSlider: {
    height: 44,
    justifyContent: "center",
    paddingHorizontal: 3
  },
  reminderTrack: {
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.line
  },
  reminderFill: {
    position: "absolute",
    left: 3,
    height: 10,
    borderRadius: 10,
    backgroundColor: colors.emerald
  },
  reminderThumb: {
    position: "absolute",
    width: 30,
    height: 30,
    marginLeft: -12,
    borderRadius: 15,
    backgroundColor: colors.white,
    borderWidth: 6,
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
  soundNote: {
    minHeight: 44,
    borderRadius: radii.md,
    backgroundColor: colors.emeraldSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  soundNoteText: {
    flex: 1,
    color: colors.emerald,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "800"
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,18,14,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 28,
    backgroundColor: colors.paper,
    padding: 22,
    paddingTop: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card
  },
  modalTopRow: {
    width: "100%",
    minHeight: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  modalIcon: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center"
  },
  modalTitle: {
    marginTop: 14,
    color: colors.ink,
    fontFamily: typography.title,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "900",
    textAlign: "center"
  },
  modalMessage: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    textAlign: "center"
  },
  modalButton: {
    marginTop: 18,
    minHeight: 46,
    minWidth: 130,
    borderRadius: radii.round,
    backgroundColor: colors.emerald,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900"
  },
  aboutCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 30,
    backgroundColor: colors.paper,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card
  },
  aboutCloseButton: {
    position: "absolute",
    right: 14,
    top: 14,
    zIndex: 3,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center"
  },
  aboutHero: {
    padding: 22,
    alignItems: "center"
  },
  aboutLogo: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center"
  },
  aboutTitle: {
    marginTop: 12,
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  aboutSubtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center"
  },
  aboutInfoRow: {
    marginHorizontal: 18,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  aboutInfoText: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800"
  },
  pressed: {
    opacity: 0.72
  }
});
