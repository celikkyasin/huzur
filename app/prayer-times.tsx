import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  getPrayerNotificationPreferences,
  getPrayerNotificationsEnabled,
  setPrayerNotificationsEnabled,
  soundModeOptions,
  type PrayerNotificationPreferences
} from "@/services/prayerNotifications";
import { useLocationStore } from "@/store/locationStore";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";
import { colors, radii, typography } from "@/theme";
import { getDynamicPrayerState } from "@/utils/prayerTimes";

export default function PrayerTimesScreen() {
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
  const prayerTimesDate = usePrayerTimesStore((state) => state.dateLabel);
  const loadPrayerTimes = usePrayerTimesStore((state) => state.loadPrayerTimes);
  const prayerState = getDynamicPrayerState(prayerTimes);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState<PrayerNotificationPreferences>({ reminderMinutes: 15, soundMode: "default" });
  const reminderLabel = notificationPreferences.reminderMinutes === 0 ? "Vakit girince uyar" : `${notificationPreferences.reminderMinutes} dakika önce hatırlat`;
  const soundLabel = soundModeOptions.find((option) => option.mode === notificationPreferences.soundMode)?.label ?? "Standart";

  useEffect(() => {
    getPrayerNotificationsEnabled().then(setNotificationsEnabled);
    getPrayerNotificationPreferences().then(setNotificationPreferences);
  }, []);

  useEffect(() => {
    void loadPrayerTimes({ city, district, country, latitude, longitude });
  }, [city, country, district, latitude, loadPrayerTimes, longitude]);

  useEffect(() => {
    if (notificationsEnabled && !isLoadingPrayerTimes) {
      void setPrayerNotificationsEnabled(true, prayerTimes, notificationPreferences);
    }
  }, [isLoadingPrayerTimes, notificationPreferences, notificationsEnabled, prayerTimes]);

  const handleNotificationToggle = async (enabled: boolean) => {
    if (isUpdatingNotifications) {
      return;
    }

    setIsUpdatingNotifications(true);

    try {
      const result = await setPrayerNotificationsEnabled(enabled, prayerTimes, notificationPreferences);
      setNotificationsEnabled(result.enabled);

      if (!result.permissionGranted) {
        Alert.alert("Bildirim İzni Gerekli", "Vakit hatırlatmaları ve ezan sesi için bildirim izni vermeniz gerekir.");
      }
    } catch {
      Alert.alert("Bildirim Ayarlanamadı", "Vakit bildirimleri şu anda hazırlanamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Namaz Vakitleri" subtitle={isLoadingLocation ? "Konum alınıyor" : displayPlace} />
      {locationError ? (
        <Card style={styles.locationNotice}>
          <Ionicons name="location" size={20} color={colors.gold} />
          <Text style={styles.locationNoticeText}>{locationError}</Text>
        </Card>
      ) : null}
      {prayerTimesError ? (
        <Card style={styles.locationNotice}>
          <Ionicons name="cloud-offline" size={20} color={colors.gold} />
          <Text style={styles.locationNoticeText}>{prayerTimesError}</Text>
        </Card>
      ) : null}
      <Card variant="emerald" style={styles.summary}>
        <Text style={styles.summaryLabel}>Sıradaki Vakit</Text>
        <Text style={styles.summaryTitle}>{prayerState.next.name}</Text>
        <Text style={styles.summaryTime}>{prayerState.next.time}</Text>
        <Text style={styles.summaryCountdown}>{prayerState.countdown} kaldı</Text>
        <Text style={styles.summarySource}>{isLoadingPrayerTimes ? "Vakitler güncelleniyor" : prayerTimesSource}</Text>
      </Card>

      <Card style={styles.notification}>
        <View style={styles.notificationText}>
          <Text style={styles.notificationTitle}>Vakit Bildirimleri</Text>
          <Text style={styles.notificationSubtitle}>
            {reminderLabel}, ses: {soundLabel}
          </Text>
        </View>
        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: notificationsEnabled, disabled: isUpdatingNotifications }}
          accessibilityLabel="Vakit bildirimleri"
          disabled={isUpdatingNotifications}
          onPress={() => handleNotificationToggle(!notificationsEnabled)}
          style={[styles.toggle, notificationsEnabled && styles.toggleOn, isUpdatingNotifications && styles.toggleBusy]}
        >
          <View style={[styles.toggleThumb, notificationsEnabled && styles.toggleThumbOn]}>
            {isUpdatingNotifications ? <ActivityIndicator size="small" color={colors.emerald} /> : null}
          </View>
        </Pressable>
      </Card>

      <SectionTitle title={prayerTimesDate ? prayerTimesDate : "Bugünün Vakitleri"} />
      <View style={styles.timeline}>
        {prayerState.markedTimes.map((item, index) => (
          <View key={item.id} style={styles.timelineItem}>
            <View style={styles.lineWrap}>
              <View style={[styles.dot, item.isNext && styles.nextDot, item.isPast && styles.pastDot]} />
              {index < prayerState.markedTimes.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <Card style={[styles.timeCard, item.isNext && styles.nextCard, item.isPast && styles.pastCard]}>
              <View>
                <Text style={[styles.timeName, item.isNext && styles.nextText]}>{item.name}</Text>
                <Text style={[styles.timeNote, item.isNext && styles.nextNote]}>{item.isNext ? "Sıradaki vakit" : item.isPast ? "Vakti geçti" : "Bugünün vakti"}</Text>
              </View>
              <Text style={[styles.time, item.isNext && styles.nextText]}>{item.time}</Text>
            </Card>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginTop: 18,
    alignItems: "center"
  },
  locationNotice: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14
  },
  locationNoticeText: {
    flex: 1,
    color: colors.ink,
    lineHeight: 20,
    fontWeight: "700"
  },
  summaryLabel: {
    color: colors.gold,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12
  },
  summaryTitle: {
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 12
  },
  summaryTime: {
    color: colors.goldSoft,
    fontSize: 46,
    fontWeight: "900"
  },
  summaryCountdown: {
    color: "rgba(255,255,255,0.76)",
    fontWeight: "700"
  },
  summarySource: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 10
  },
  notification: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  notificationText: {
    flex: 1
  },
  notificationTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 16
  },
  notificationSubtitle: {
    color: colors.muted,
    marginTop: 3,
    fontSize: 12
  },
  toggle: {
    width: 58,
    height: 34,
    borderRadius: radii.round,
    backgroundColor: colors.line,
    padding: 4,
    justifyContent: "center"
  },
  toggleOn: {
    backgroundColor: colors.emerald
  },
  toggleBusy: {
    opacity: 0.72
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: radii.round,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3
  },
  toggleThumbOn: {
    alignSelf: "flex-end"
  },
  timeline: {
    gap: 0
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12
  },
  lineWrap: {
    width: 24,
    alignItems: "center"
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.sage,
    marginTop: 28
  },
  pastDot: {
    backgroundColor: colors.line
  },
  nextDot: {
    backgroundColor: colors.gold,
    borderWidth: 4,
    borderColor: colors.goldSoft
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: colors.line
  },
  timeCard: {
    flex: 1,
    marginBottom: 12,
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  pastCard: {
    opacity: 0.62
  },
  nextCard: {
    backgroundColor: colors.emerald,
    opacity: 1
  },
  timeName: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 17
  },
  timeNote: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12
  },
  time: {
    color: colors.emerald,
    fontSize: 23,
    fontWeight: "900"
  },
  nextText: {
    color: colors.white
  },
  nextNote: {
    color: "rgba(255,255,255,0.72)"
  }
});
