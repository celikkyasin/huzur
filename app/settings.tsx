import { useEffect, useState } from "react";
import { Linking, Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "@/components/AppHeader";
import { SettingsRow } from "@/components/SettingsRow";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import {
  getPrayerNotificationPreferences,
  getPrayerNotificationsEnabled,
  NOTIFIABLE_PRAYERS,
  REMINDER_PRESETS,
  setPrayerNotificationPreferences,
  setPrayerNotificationsEnabled,
  soundModeOptions,
  type PerPrayerNotificationConfig,
  type PrayerNotifiableId,
  type PrayerNotificationPreferences,
  type PrayerNotificationSoundMode
} from "@/services/prayerNotifications";
import { useLocationStore } from "@/store/locationStore";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";
import { useRewardStore } from "@/store/rewardStore";
import { colors, radii, shadows, typography } from "@/theme";
import type { SettingsItem } from "@/types";

const APP_VERSION = "1.0.90";
const SUPPORT_EMAIL = "celikkyasin@gmail.com";

type FeedbackModalState = {
  visible: boolean;
  tone: "success" | "warning" | "info";
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
};

const SOUND_SHORT_LABELS: Record<PrayerNotificationSoundMode, string> = {
  silent: "Sessiz",
  default: "Uyarı Sesi",
  adhan: "Ezan"
};

const supportItems: SettingsItem[] = [
  { id: "about", title: "Uygulama Hakkında", subtitle: `Sürüm ${APP_VERSION} • Lisans ve özellik bilgileri`, icon: "information-circle" },
  { id: "contact", title: "İletişim ve Geri Bildirim", subtitle: SUPPORT_EMAIL, icon: "mail" }
];

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [remindersExpanded, setRemindersExpanded] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<PrayerNotificationPreferences>({
    reminderMinutes: 15,
    soundMode: "default",
    notifyOnTime: true
  });
  const [expandedPrayerId, setExpandedPrayerId] = useState<PrayerNotifiableId | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModalState>({
    visible: false,
    tone: "info",
    icon: "information-circle",
    title: "",
    message: ""
  });
  const [aboutVisible, setAboutVisible] = useState(false);

  const prayerTimes = usePrayerTimesStore((state) => state.times);
  const displayPlace = useLocationStore((state) => state.displayPlace);
  const refreshLocation = useLocationStore((state) => state.refreshLocation);
  const isLoadingLocation = useLocationStore((state) => state.isLoading);
  const userCode = useRewardStore((state) => state.userCode);
  const totalPoints = useRewardStore((state) => state.totalPoints);

  useEffect(() => {
    getPrayerNotificationsEnabled().then(setNotificationsEnabled);
    getPrayerNotificationPreferences().then((preferences) => {
      setNotificationPreferences(preferences);
    });
  }, []);

  const showFeedback = (modal: Omit<FeedbackModalState, "visible">) => {
    setFeedbackModal({ ...modal, visible: true });
  };

  const closeFeedback = () => {
    setFeedbackModal((current) => ({ ...current, visible: false }));
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
        showFeedback({
          tone: "warning",
          icon: "notifications-off",
          title: "Bildirim İzni Gerekli",
          message: "Namaz vakti hatırlatmalarını alabilmek için telefon ayarlarından Huzur bildirimlerine izin vermeniz gerekiyor."
        });
      } else {
        const soundLabel = soundModeOptions.find((o) => o.mode === notificationPreferences.soundMode)?.label ?? "Kısa Uyarı Sesi";
        showFeedback({
          tone: result.enabled ? "success" : "info",
          icon: result.enabled ? "checkmark-circle" : "moon",
          title: result.enabled ? "Hatırlatıcılar Aktif" : "Hatırlatıcılar Kapatıldı",
          message: result.enabled
            ? `5 vakit namaz hatırlatıcıları kuruldu.\nVarsayılan uyarı: ${notificationPreferences.reminderMinutes === 0 ? "Tam vaktinde" : `${notificationPreferences.reminderMinutes} dk önce`} • ${soundLabel}`
            : "Tüm namaz vakti bildirimleri ve hatırlatıcıları devre dışı bırakıldı."
        });
      }
    } catch {
      showFeedback({
        tone: "warning",
        icon: "alert-circle",
        title: "Ayarlar Kaydedilemedi",
        message: "Bildirim tercihi şu anda güncellenemedi. Lütfen tekrar deneyin."
      });
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const applyGlobalPreferences = async (patch: Partial<PrayerNotificationPreferences>, applyToAllPrayers = false) => {
    const nextGlobalMinutes = patch.reminderMinutes ?? notificationPreferences.reminderMinutes;
    const nextGlobalSound = patch.soundMode ?? notificationPreferences.soundMode;

    const nextPerPrayer = { ...(notificationPreferences.perPrayer || {}) };
    if (applyToAllPrayers) {
      for (const p of NOTIFIABLE_PRAYERS) {
        const currentP = nextPerPrayer[p.id];
        nextPerPrayer[p.id] = {
          enabled: currentP?.enabled ?? true,
          reminderMinutes: patch.reminderMinutes !== undefined ? nextGlobalMinutes : (currentP?.reminderMinutes ?? nextGlobalMinutes),
          soundMode: patch.soundMode !== undefined ? nextGlobalSound : (currentP?.soundMode ?? nextGlobalSound)
        };
      }
    }

    const optimisticPreferences: PrayerNotificationPreferences = {
      ...notificationPreferences,
      ...patch,
      perPrayer: nextPerPrayer
    };

    // Anında ekranı güncelle (optimistic update)
    setNotificationPreferences(optimisticPreferences);

    try {
      const saved = await setPrayerNotificationPreferences(optimisticPreferences, prayerTimes);
      setNotificationPreferences(saved);
    } catch {
      showFeedback({
        tone: "warning",
        icon: "alert-circle",
        title: "Tercih Kaydedilemedi",
        message: "Hatırlatıcı ayarı kaydedilirken bir sorun oluştu."
      });
    }
  };

  const updateSinglePrayerConfig = async (prayerId: PrayerNotifiableId, patch: Partial<PerPrayerNotificationConfig>) => {
    const currentConfig: PerPrayerNotificationConfig = notificationPreferences.perPrayer?.[prayerId] ?? {
      enabled: true,
      reminderMinutes: notificationPreferences.reminderMinutes,
      soundMode: notificationPreferences.soundMode
    };

    const nextPerPrayer = {
      ...(notificationPreferences.perPrayer || {}),
      [prayerId]: {
        ...currentConfig,
        ...patch
      }
    };

    await applyGlobalPreferences({ perPrayer: nextPerPrayer }, false);
  };

  const openContact = async () => {
    const url = `mailto:${SUPPORT_EMAIL}?subject=Huzur%20Uygulama%20Destek`;
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
      return;
    }

    showFeedback({
      tone: "info",
      icon: "mail",
      title: "İletişim & Destek",
      message: `Öneri ve talepleriniz için bize ${SUPPORT_EMAIL} e-posta adresinden ulaşabilirsiniz.`
    });
  };

  const handleSupportPress = (id: string) => {
    if (id === "about") {
      setAboutVisible(true);
      return;
    }
    if (id === "contact") {
      void openContact();
    }
  };

  const activePrayersCount = NOTIFIABLE_PRAYERS.filter((p) => (notificationPreferences.perPrayer?.[p.id]?.enabled ?? true)).length;

  return (
    <ScreenContainer contentStyle={styles.screen}>
      <AppHeader title="Ayarlar" />

      {/* Kullanıcı & Konum Özeti Kartı */}
      <LinearGradient colors={[colors.emerald, "#054736"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.profileBanner}>
        <View style={styles.profileBannerTop}>
          <View style={styles.profileAvatar}>
            <Ionicons name="moon" size={26} color={colors.gold} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileKicker}>HUZUR KULLANICI KİMLİĞİ</Text>
            <Text style={styles.profileCode}>{userCode}</Text>
          </View>
          <View style={styles.profilePointsBadge}>
            <Ionicons name="trophy" size={14} color={colors.gold} />
            <Text style={styles.profilePointsText}>{totalPoints} Puan</Text>
          </View>
        </View>

        <View style={styles.profileDivider} />

        <View style={styles.locationRow}>
          <View style={styles.locationLeft}>
            <Ionicons name="location" size={18} color={colors.gold} />
            <View style={styles.locationTextWrap}>
              <Text style={styles.locationLabel}>Aktif Namaz Vakti Konumu</Text>
              <Text style={styles.locationValue} numberOfLines={1}>
                {isLoadingLocation ? "Konum güncelleniyor..." : displayPlace}
              </Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => void refreshLocation()}
            style={[styles.locationRefreshBtn]}
          >
            <Ionicons name="refresh" size={16} color={colors.white} />
            <Text style={styles.locationRefreshText}>Yenile</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {/* NAMAZ VAKTİ HATIRLATICI MERKEZİ (Varsayılan Olarak Kapalı / Katlanır) */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionKicker}>BİLDİRİM VE EZAN AYARLARI</Text>
          <Text style={styles.sectionTitle}>Namaz Vakti Hatırlatıcıları</Text>
        </View>
      </View>

      <Card style={styles.reminderCenterCard}>
        {/* Master Header Row: Tıklayınca detaylar açılır/kapanır, sağda Switch */}
        <View style={styles.masterSwitchRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: remindersExpanded }}
            onPress={() => setRemindersExpanded((curr) => !curr)}
            style={styles.masterHeaderPressable}
          >
            <View style={[styles.masterIconBox, notificationsEnabled && styles.masterIconBoxActive]}>
              <Ionicons name={notificationsEnabled ? "notifications" : "notifications-off"} size={23} color={notificationsEnabled ? colors.white : colors.emerald} />
            </View>
            <View style={styles.masterCopy}>
              <Text style={styles.masterTitle}>Vakit Bildirimleri</Text>
              <Text style={styles.masterSubtitle}>
                {notificationsEnabled
                  ? `${activePrayersCount} vakit aktif • ${notificationPreferences.reminderMinutes === 0 ? "Vaktinde" : `${notificationPreferences.reminderMinutes} dk önce`}`
                  : "Kapalı • Ayrıntılar için dokunun"}
              </Text>
            </View>
            <View style={styles.masterChevronBadge}>
              <Ionicons name={remindersExpanded ? "chevron-up" : "chevron-down"} size={20} color={colors.emerald} />
            </View>
          </Pressable>

          <Switch
            value={notificationsEnabled}
            disabled={isUpdatingNotifications}
            onValueChange={(value) => void toggleNotifications(value)}
            trackColor={{ false: colors.line, true: colors.emerald }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.line}
          />
        </View>

        {remindersExpanded ? (
          <View style={styles.expandedRemindersBody}>
            <View style={styles.cardSeparator} />

            {/* 1. Ön Hatırlatma Süresi Seçici */}
            <View style={styles.blockSection}>
              <View style={styles.blockHeaderRow}>
                <View style={styles.blockTitleWrap}>
                  <Ionicons name="time-outline" size={18} color={colors.emerald} />
                  <Text style={styles.blockTitle}>Vakitten Önce Uyarı Süresi</Text>
                </View>
                <View style={styles.currentValuePill}>
                  <Text style={styles.currentValuePillText}>
                    {notificationPreferences.reminderMinutes === 0 ? "Tam Vaktinde" : `${notificationPreferences.reminderMinutes} dk önce`}
                  </Text>
                </View>
              </View>
              <Text style={styles.blockDescription}>
                Ezan vaktinden kaç dakika önce hazırlık hatırlatması gönderileceğini seçin.
              </Text>

              <View style={styles.presetChipsGrid}>
                {REMINDER_PRESETS.map((minutes) => {
                  const isSelected = notificationPreferences.reminderMinutes === minutes;
                  return (
                    <Pressable
                      key={minutes}
                      accessibilityRole="button"
                      onPress={() => void applyGlobalPreferences({ reminderMinutes: minutes }, true)}
                      style={[
                        styles.presetChip,
                        isSelected ? styles.presetChipActive : styles.presetChipInactive
                      ]}
                    >
                      <Text style={[styles.presetChipText, isSelected ? styles.presetChipTextActive : styles.presetChipTextInactive]}>
                        {minutes === 0 ? "Vaktinde" : `${minutes} dk`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Tam Vakit Girdiğinde Bildirim Switch */}
              <View style={styles.subToggleRow}>
                <View style={styles.subToggleCopy}>
                  <Text style={styles.subToggleTitle}>Ezan Vakti Girdiğinde de Bildir</Text>
                  <Text style={styles.subToggleSubtitle}>Ön hatırlatmaya ek olarak tam ezan saatinde bildirim gönderir</Text>
                </View>
                <Switch
                  value={notificationPreferences.notifyOnTime !== false}
                  onValueChange={(val) => void applyGlobalPreferences({ notifyOnTime: val }, false)}
                  trackColor={{ false: colors.line, true: colors.emerald }}
                  thumbColor={colors.white}
                />
              </View>
            </View>

            <View style={styles.cardSeparator} />

            {/* 2. Bildirim ve Ezan Sesi Seçimi */}
            <View style={styles.blockSection}>
              <View style={styles.blockTitleWrap}>
                <Ionicons name="volume-high-outline" size={18} color={colors.emerald} />
                <Text style={styles.blockTitle}>Varsayılan Bildirim & Ezan Sesi</Text>
              </View>
              <Text style={styles.blockDescription}>
                Tüm vakitler için geçerli olan ana uyarı sesini belirleyin.
              </Text>

              <View style={styles.soundCardsList}>
                {soundModeOptions.map((option) => {
                  const selected = notificationPreferences.soundMode === option.mode;
                  const iconMap: Record<PrayerNotificationSoundMode, keyof typeof Ionicons.glyphMap> = {
                    silent: "volume-mute",
                    default: "notifications",
                    adhan: "musical-notes"
                  };

                  return (
                    <Pressable
                      key={option.mode}
                      accessibilityRole="button"
                      onPress={() => void applyGlobalPreferences({ soundMode: option.mode }, true)}
                      style={[
                        styles.soundCardItem,
                        selected ? styles.soundCardItemActive : styles.soundCardItemInactive
                      ]}
                    >
                      <View style={[styles.soundCardIcon, selected ? styles.soundCardIconActive : styles.soundCardIconInactive]}>
                        <Ionicons name={iconMap[option.mode]} size={20} color={selected ? colors.white : colors.emerald} />
                      </View>
                      <View style={styles.soundCardCopy}>
                        <Text style={[styles.soundCardTitle, selected ? styles.soundCardTitleActive : styles.soundCardTitleInactive]}>
                          {option.label}
                        </Text>
                        <Text style={[styles.soundCardDesc, selected ? styles.soundCardDescActive : styles.soundCardDescInactive]}>
                          {option.description}
                        </Text>
                      </View>
                      <View style={[styles.radioCircle, selected && styles.radioCircleActive]}>
                        {selected ? <View style={styles.radioInnerDot} /> : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <AdhanTestPlayerButton />
            </View>

            <View style={styles.cardSeparator} />

            {/* 3. Vakit Bazlı Ayrıntılı Özelleştirme Tablosu */}
            <View style={styles.blockSection}>
              <View style={styles.blockTitleWrap}>
                <Ionicons name="options-outline" size={18} color={colors.emerald} />
                <Text style={styles.blockTitle}>Vakitlere Göre Ayrıntılı Ayarlar</Text>
              </View>
              <Text style={styles.blockDescription}>
                Her namaz vakti için bildirimi ayrı ayrı açıp kapatabilir, süresini ve sesini özelleştirebilirsiniz.
              </Text>

              <View style={styles.perPrayerList}>
                {NOTIFIABLE_PRAYERS.map((prayerMeta) => {
                  const prayerTimeObj = prayerTimes.find((t) => t.id === prayerMeta.id);
                  const config: PerPrayerNotificationConfig = notificationPreferences.perPrayer?.[prayerMeta.id] ?? {
                    enabled: true,
                    reminderMinutes: notificationPreferences.reminderMinutes,
                    soundMode: notificationPreferences.soundMode
                  };
                  const isExpanded = expandedPrayerId === prayerMeta.id;

                  return (
                    <View key={prayerMeta.id} style={[styles.perPrayerCard, !config.enabled && styles.perPrayerCardMuted]}>
                      <View style={styles.perPrayerTopRow}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setExpandedPrayerId(isExpanded ? null : prayerMeta.id)}
                          style={styles.perPrayerMainTouch}
                        >
                          <View style={[styles.perPrayerIcon, config.enabled && styles.perPrayerIconActive]}>
                            <Ionicons name={prayerMeta.icon} size={18} color={config.enabled ? colors.emerald : colors.muted} />
                          </View>
                          <View style={styles.perPrayerInfo}>
                            <View style={styles.perPrayerNameRow}>
                              <Text style={styles.perPrayerName}>{prayerMeta.label}</Text>
                              {prayerTimeObj?.time ? (
                                <View style={styles.perPrayerTimeBadge}>
                                  <Text style={styles.perPrayerTimeText}>{prayerTimeObj.time}</Text>
                                </View>
                              ) : null}
                            </View>
                            <Text style={styles.perPrayerSummary}>
                              {config.enabled
                                ? `${config.reminderMinutes === 0 ? "Tam vaktinde" : `${config.reminderMinutes} dk önce`} • ${SOUND_SHORT_LABELS[config.soundMode]}`
                                : "Bu vakit için bildirim kapalı"}
                            </Text>
                          </View>
                          <View style={styles.perPrayerChevron}>
                            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={colors.emerald} />
                          </View>
                        </Pressable>

                        <Switch
                          value={config.enabled}
                          onValueChange={(val) => void updateSinglePrayerConfig(prayerMeta.id, { enabled: val })}
                          trackColor={{ false: colors.line, true: colors.emerald }}
                          thumbColor={colors.white}
                        />
                      </View>

                      {isExpanded && config.enabled ? (
                        <View style={styles.perPrayerExpandedPanel}>
                          <Text style={styles.perPrayerExpandedLabel}>Uyarı Süresi ({prayerMeta.label})</Text>
                          <View style={styles.miniChipsRow}>
                            {REMINDER_PRESETS.map((min) => {
                              const active = Number(config.reminderMinutes) === min;
                              return (
                                <Pressable
                                  key={min}
                                  accessibilityRole="button"
                                  hitSlop={6}
                                  onPress={() => void updateSinglePrayerConfig(prayerMeta.id, { reminderMinutes: min })}
                                  style={[styles.miniChip, active ? styles.miniChipActive : styles.miniChipInactive]}
                                >
                                  <Text style={[styles.miniChipText, active ? styles.miniChipTextActive : styles.miniChipTextInactive]}>
                                    {min === 0 ? "Vaktinde" : `${min} dk`}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>

                          <Text style={[styles.perPrayerExpandedLabel, { marginTop: 12 }]}>Bildirim Sesi ({prayerMeta.label})</Text>
                          <View style={styles.miniChipsRow}>
                            {(["silent", "default", "adhan"] as PrayerNotificationSoundMode[]).map((sMode) => {
                              const active = config.soundMode === sMode;
                              return (
                                <Pressable
                                  key={sMode}
                                  accessibilityRole="button"
                                  hitSlop={6}
                                  onPress={() => void updateSinglePrayerConfig(prayerMeta.id, { soundMode: sMode })}
                                  style={[styles.miniSoundChip, active ? styles.miniChipActive : styles.miniChipInactive]}
                                >
                                  <Text style={[styles.miniChipText, active ? styles.miniChipTextActive : styles.miniChipTextInactive]}>
                                    {SOUND_SHORT_LABELS[sMode]}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        ) : null}
      </Card>

      {/* UYGULAMA VE DESTEK BÖLÜMÜ */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionKicker}>KURUMSAL & YARDIM</Text>
          <Text style={styles.sectionTitle}>Uygulama ve Destek</Text>
        </View>
      </View>

      <Card style={styles.supportCard}>
        {supportItems.map((item, index) => (
          <SettingsRow
            key={item.id}
            item={item}
            isLast={index === supportItems.length - 1}
            onPress={() => handleSupportPress(item.id)}
          />
        ))}
      </Card>

      <FeedbackModal modal={feedbackModal} onClose={closeFeedback} />
      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} version={APP_VERSION} />
    </ScreenContainer>
  );
}

function AdhanTestPlayerButton() {
  const player = useAudioPlayer(require("../assets/audio/adhan/adhan.ogg"), { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const isPlaying = Boolean(status.playing);

  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {}
    };
  }, [player]);

  const togglePlay = () => {
    try {
      if (isPlaying) {
        player.pause();
        void player.seekTo(0);
      } else {
        void player.seekTo(0);
        player.play();
      }
    } catch {}
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={togglePlay}
      style={[styles.testAudioBtn, isPlaying ? styles.testAudioBtnPlaying : styles.testAudioBtnIdle]}
    >
      <Ionicons name={isPlaying ? "stop-circle" : "play-circle"} size={22} color={isPlaying ? colors.white : colors.emerald} />
      <Text style={[styles.testAudioBtnText, isPlaying ? styles.testAudioBtnTextPlaying : styles.testAudioBtnTextIdle]}>
        {isPlaying ? "Ezan Sesini Durdur" : "Ezan Sesini Dinle / Test Et"}
      </Text>
    </Pressable>
  );
}

function FeedbackModal({ modal, onClose }: { modal: FeedbackModalState; onClose: () => void }) {
  const toneColor = modal.tone === "warning" ? "#B7791F" : colors.emerald;

  return (
    <Modal visible={modal.visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          <View style={styles.modalTopRow}>
            <View />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kapat"
              hitSlop={12}
              onPress={onClose}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={20} color={colors.emerald} />
            </Pressable>
          </View>
          <View style={[styles.modalIcon, { backgroundColor: modal.tone === "warning" ? "#FFF4D8" : colors.emeraldSoft }]}>
            <Ionicons name={modal.icon} size={30} color={toneColor} />
          </View>
          <Text style={styles.modalTitle}>{modal.title}</Text>
          <Text style={styles.modalMessage}>{modal.message}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} style={styles.modalButton}>
            <Text style={styles.modalButtonText}>Tamam</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function AboutModal({ visible, onClose, version }: { visible: boolean; onClose: () => void; version: string }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.aboutCard} onPress={() => {}}>
          <LinearGradient colors={[colors.emerald, "#054736"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aboutHero}>
            <View style={styles.aboutHeroTopRow}>
              <View style={styles.aboutVersionPill}>
                <Text style={styles.aboutVersionPillText}>v{version}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Kapat"
                hitSlop={14}
                onPress={onClose}
                style={styles.aboutCloseButton}
              >
                <Ionicons name="close" size={22} color={colors.white} />
              </Pressable>
            </View>

            <View style={styles.aboutLogo}>
              <Ionicons name="moon" size={32} color={colors.gold} />
            </View>
            <Text style={styles.aboutTitle}>Huzur</Text>
            <Text style={styles.aboutSubtitle}>
              Namaz vakitleri, Kur'an-ı Kerim, hatim takibi, dualar, zikirmatik ve günlük manevi alışkanlıklar için tasarlanmış İslami yaşam rehberi.
            </Text>
          </LinearGradient>

          <View style={styles.aboutBody}>
            <View style={styles.aboutInfoRow}>
              <View style={styles.aboutInfoIcon}>
                <Ionicons name="shield-checkmark" size={18} color={colors.emerald} />
              </View>
              <Text style={styles.aboutInfoText}>Diyanet İşleri Başkanlığı uyumlu namaz vakitleri, Kur'an meali ve dini günler takvimi.</Text>
            </View>

            <View style={styles.aboutInfoRow}>
              <View style={styles.aboutInfoIcon}>
                <Ionicons name="phone-portrait" size={18} color={colors.emerald} />
              </View>
              <Text style={styles.aboutInfoText}>Uygulama Sürümü: {version}</Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.aboutCloseFooterBtn}
            >
              <Text style={styles.aboutCloseFooterBtnText}>Kapat</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 132
  },
  profileBanner: {
    marginTop: 14,
    borderRadius: radii.xl,
    padding: 18,
    ...shadows.card
  },
  profileBannerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(215,179,90,0.4)",
    alignItems: "center",
    justifyContent: "center"
  },
  profileInfo: {
    flex: 1,
    minWidth: 0
  },
  profileKicker: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6
  },
  profileCode: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 2
  },
  profilePointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  profilePointsText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900"
  },
  profileDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginVertical: 14
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  locationLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0
  },
  locationTextWrap: {
    flex: 1,
    minWidth: 0
  },
  locationLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "700"
  },
  locationValue: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 1
  },
  locationRefreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  locationRefreshText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900"
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between"
  },
  sectionKicker: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: typography.title,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 2
  },
  reminderCenterCard: {
    padding: 16
  },
  masterSwitchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  masterHeaderPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0
  },
  masterIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  masterIconBoxActive: {
    backgroundColor: colors.emerald
  },
  masterCopy: {
    flex: 1,
    minWidth: 0
  },
  masterTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  masterSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    fontWeight: "700"
  },
  masterChevronBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  expandedRemindersBody: {
    marginTop: 14,
    gap: 16
  },
  cardSeparator: {
    height: 1,
    backgroundColor: colors.line
  },
  blockSection: {
    gap: 10
  },
  blockHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  blockTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flex: 1
  },
  blockTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  blockDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700"
  },
  currentValuePill: {
    borderRadius: radii.round,
    backgroundColor: colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  currentValuePillText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  presetChipsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2
  },
  presetChip: {
    width: "31%",
    minHeight: 42,
    borderRadius: radii.md,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8
  },
  presetChipInactive: {
    backgroundColor: colors.white,
    borderColor: colors.line
  },
  presetChipActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald
  },
  presetChipText: {
    fontSize: 13,
    fontWeight: "900"
  },
  presetChipTextInactive: {
    color: colors.ink
  },
  presetChipTextActive: {
    color: colors.white
  },
  subToggleRow: {
    marginTop: 4,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  subToggleCopy: {
    flex: 1,
    minWidth: 0
  },
  subToggleTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  subToggleSubtitle: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
    fontWeight: "700"
  },
  soundCardsList: {
    gap: 8,
    marginTop: 2
  },
  soundCardItem: {
    width: "100%",
    borderRadius: radii.md,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  soundCardItemInactive: {
    backgroundColor: colors.white,
    borderColor: colors.line
  },
  soundCardItemActive: {
    backgroundColor: colors.emeraldSoft,
    borderColor: colors.emerald
  },
  soundCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  soundCardIconInactive: {
    backgroundColor: colors.emeraldSoft
  },
  soundCardIconActive: {
    backgroundColor: colors.emerald
  },
  soundCardCopy: {
    flex: 1,
    minWidth: 0
  },
  soundCardTitle: {
    fontSize: 14,
    fontWeight: "900"
  },
  soundCardTitleInactive: {
    color: colors.ink
  },
  soundCardTitleActive: {
    color: colors.emerald
  },
  soundCardDesc: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
    fontWeight: "700"
  },
  soundCardDescInactive: {
    color: colors.muted
  },
  soundCardDescActive: {
    color: colors.ink
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.muted,
    alignItems: "center",
    justifyContent: "center"
  },
  radioCircleActive: {
    borderColor: colors.emerald
  },
  radioInnerDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.emerald
  },
  testAudioBtn: {
    marginTop: 4,
    minHeight: 46,
    borderRadius: radii.md,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14
  },
  testAudioBtnIdle: {
    backgroundColor: colors.emeraldSoft,
    borderColor: "rgba(7,94,71,0.28)"
  },
  testAudioBtnPlaying: {
    backgroundColor: "#B91C1C",
    borderColor: "#991B1B"
  },
  testAudioBtnText: {
    fontSize: 13,
    fontWeight: "900"
  },
  testAudioBtnTextIdle: {
    color: colors.emerald
  },
  testAudioBtnTextPlaying: {
    color: colors.white
  },
  perPrayerList: {
    gap: 8,
    marginTop: 4
  },
  perPrayerCard: {
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  perPrayerCardMuted: {
    opacity: 0.65,
    backgroundColor: colors.cream
  },
  perPrayerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  perPrayerMainTouch: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0
  },
  perPrayerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center"
  },
  perPrayerIconActive: {
    backgroundColor: colors.emeraldSoft
  },
  perPrayerInfo: {
    flex: 1,
    minWidth: 0
  },
  perPrayerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  perPrayerName: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900"
  },
  perPrayerTimeBadge: {
    borderRadius: radii.sm,
    backgroundColor: colors.emeraldSoft,
    paddingHorizontal: 7,
    paddingVertical: 2
  },
  perPrayerTimeText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: "900"
  },
  perPrayerSummary: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
    fontWeight: "700"
  },
  perPrayerChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  perPrayerExpandedPanel: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  perPrayerExpandedLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8
  },
  miniChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  miniChip: {
    minWidth: "28%",
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center"
  },
  miniSoundChip: {
    flex: 1,
    minHeight: 38,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.sm,
    borderWidth: 1.5
  },
  miniChipInactive: {
    backgroundColor: colors.cream,
    borderColor: colors.line
  },
  miniChipActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald
  },
  miniChipText: {
    fontSize: 12,
    fontWeight: "900"
  },
  miniChipTextInactive: {
    color: colors.ink
  },
  miniChipTextActive: {
    color: colors.white
  },
  supportCard: {
    paddingVertical: 2,
    paddingHorizontal: 0
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,18,14,0.52)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    backgroundColor: colors.paper,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card
  },
  modalTopRow: {
    width: "100%",
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
    width: 64,
    height: 64,
    borderRadius: 32,
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
    width: "100%",
    minHeight: 46,
    borderRadius: radii.round,
    backgroundColor: colors.emerald,
    alignItems: "center",
    justifyContent: "center"
  },
  modalButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900"
  },
  aboutCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 26,
    backgroundColor: colors.paper,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card
  },
  aboutHero: {
    padding: 20,
    alignItems: "center"
  },
  aboutHeroTopRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  aboutVersionPill: {
    borderRadius: radii.round,
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  aboutVersionPillText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900"
  },
  aboutCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center"
  },
  aboutLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center"
  },
  aboutTitle: {
    marginTop: 10,
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900"
  },
  aboutSubtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    textAlign: "center"
  },
  aboutBody: {
    padding: 18,
    gap: 12
  },
  aboutInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  aboutInfoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  aboutInfoText: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800"
  },
  aboutCloseFooterBtn: {
    marginTop: 6,
    minHeight: 46,
    borderRadius: radii.round,
    backgroundColor: colors.emerald,
    alignItems: "center",
    justifyContent: "center"
  },
  aboutCloseFooterBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900"
  }
});
