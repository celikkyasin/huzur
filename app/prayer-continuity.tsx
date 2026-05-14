import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";
import { useRewardStore } from "@/store/rewardStore";
import {
  formatDateLabel,
  getCompletionStreak,
  getDateKey,
  getPrayerProgress,
  getRecentPrayerDates,
  trackedPrayers,
  usePrayerTrackerStore,
  type PrayerCompletionStatus,
  type TrackedPrayerId
} from "@/store/prayerTrackerStore";
import { colors, radii, typography } from "@/theme";

const statusOptions: Array<{ status: PrayerCompletionStatus; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { status: "done", label: "Kıldım", icon: "checkmark-circle" },
  { status: "later", label: "Sonra", icon: "time" },
  { status: "missed", label: "Kılmadım", icon: "close-circle" }
];

function getTimeDate(date: Date, time?: string) {
  if (!time) {
    return null;
  }

  const [hour, minute] = time.split(":").map(Number);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }

  const timeDate = new Date(date);
  timeDate.setHours(hour, minute, 0, 0);
  return timeDate;
}

function canMarkPrayer(date: Date, time?: string) {
  const todayKey = getDateKey();
  const dateKey = getDateKey(date);

  if (dateKey < todayKey) {
    return true;
  }

  if (dateKey > todayKey) {
    return false;
  }

  const prayerDate = getTimeDate(date, time);
  return prayerDate ? new Date().getTime() >= prayerDate.getTime() : false;
}

export default function PrayerContinuityScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const records = usePrayerTrackerStore((state) => state.records);
  const markPrayer = usePrayerTrackerStore((state) => state.markPrayer);
  const prayerTimes = usePrayerTimesStore((state) => state.times);
  const awardReward = useRewardStore((state) => state.awardReward);
  const recentDates = useMemo(() => getRecentPrayerDates(7), []);
  const selectedDateKey = getDateKey(selectedDate);
  const selectedRecord = records[selectedDateKey];
  const progress = getPrayerProgress(records, selectedDateKey);
  const streak = getCompletionStreak(records);

  const timeMap = useMemo(() => new Map(prayerTimes.map((time) => [time.id, time.time])), [prayerTimes]);

  const updatePrayer = async (prayerId: TrackedPrayerId, status: PrayerCompletionStatus) => {
    const rewards = await markPrayer(selectedDateKey, prayerId, status);

    if (rewards.prayerReward) {
      void awardReward({
        action: "prayerDone",
        ...rewards.prayerReward
      });
    }

    if (rewards.dayReward) {
      void awardReward({
        action: "prayerCompleteDay",
        ...rewards.dayReward
      });
      Alert.alert("Gün tamamlandı", "Bugünün 5 vakit namaz takibi tamamlandı. +10 puan eklendi.");
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Namaz Devamlılığı" />

      <Card variant="emerald" style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View>
            <Text style={styles.summaryLabel}>{formatDateLabel(selectedDate)}</Text>
            <Text style={styles.summaryTitle}>{progress.completed}/{progress.total} vakit tamamlandı</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={18} color={colors.gold} />
            <Text style={styles.streakText}>{streak} gün</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(progress.completed / progress.total) * 100}%` }]} />
        </View>
      </Card>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
        {recentDates.map((date) => {
          const dateKey = getDateKey(date);
          const dayProgress = getPrayerProgress(records, dateKey);
          const isSelected = dateKey === selectedDateKey;

          return (
            <Pressable key={dateKey} accessibilityRole="button" onPress={() => setSelectedDate(date)} style={[styles.datePill, isSelected && styles.selectedDatePill]}>
              <Text style={[styles.dateWeekday, isSelected && styles.selectedDateText]}>{date.toLocaleDateString("tr-TR", { weekday: "short" })}</Text>
              <Text style={[styles.dateDay, isSelected && styles.selectedDateText]}>{date.getDate()}</Text>
              <View style={[styles.dateDot, dayProgress.isComplete && styles.completeDateDot]} />
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.prayerList}>
        {trackedPrayers.map((prayer) => {
          const currentStatus = selectedRecord?.prayers[prayer.id];
          const prayerTime = timeMap.get(prayer.timeId);
          const isPrayerEnabled = canMarkPrayer(selectedDate, prayerTime);

          return (
            <Card key={prayer.id} style={[styles.prayerCard, !isPrayerEnabled && styles.disabledPrayerCard]}>
              <View style={styles.prayerHeader}>
                <View style={styles.prayerIcon}>
                  <Ionicons name={isPrayerEnabled ? prayer.icon : "lock-closed"} size={22} color={isPrayerEnabled ? colors.emerald : colors.muted} />
                </View>
                <View style={styles.prayerTextWrap}>
                  <Text style={styles.prayerName}>{prayer.name}</Text>
                  <Text style={styles.prayerTime}>{prayerTime ?? "--:--"}</Text>
                </View>
                {currentStatus === "done" ? <Ionicons name="checkmark-circle" size={22} color={colors.emerald} /> : null}
              </View>
              {!isPrayerEnabled ? <Text style={styles.lockedText}>Bu vakit girince işaretlenebilir.</Text> : null}

              <View style={styles.statusRow}>
                {statusOptions.map((option) => {
                  const isActive = currentStatus === option.status;
                  return (
                    <Pressable
                      key={option.status}
                      accessibilityRole="button"
                      disabled={!isPrayerEnabled}
                      onPress={() => void updatePrayer(prayer.id, option.status)}
                      style={[styles.statusButton, !isPrayerEnabled && styles.disabledStatusButton, isActive && styles.activeStatusButton, option.status === "missed" && isActive && styles.missedStatusButton]}
                    >
                      <Ionicons name={option.icon} size={17} color={isActive ? colors.white : isPrayerEnabled ? colors.emerald : colors.muted} />
                      <Text style={[styles.statusText, !isPrayerEnabled && styles.disabledStatusText, isActive && styles.activeStatusText]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginTop: 16
  },
  summaryTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800"
  },
  summaryTitle: {
    color: colors.white,
    marginTop: 4,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    fontFamily: typography.title
  },
  streakBadge: {
    minWidth: 84,
    height: 40,
    borderRadius: radii.round,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  streakText: {
    color: colors.white,
    fontWeight: "900"
  },
  progressTrack: {
    height: 8,
    borderRadius: radii.round,
    overflow: "hidden",
    marginTop: 18,
    backgroundColor: "rgba(255,255,255,0.18)"
  },
  progressFill: {
    height: "100%",
    borderRadius: radii.round,
    backgroundColor: colors.gold
  },
  dateRow: {
    gap: 8,
    paddingVertical: 18
  },
  datePill: {
    width: 60,
    height: 76,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line
  },
  selectedDatePill: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald
  },
  dateWeekday: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900"
  },
  dateDay: {
    color: colors.ink,
    marginTop: 4,
    fontSize: 20,
    fontWeight: "900"
  },
  selectedDateText: {
    color: colors.white
  },
  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    backgroundColor: colors.line
  },
  completeDateDot: {
    backgroundColor: colors.gold
  },
  prayerList: {
    gap: 12,
    paddingBottom: 18
  },
  prayerCard: {
    gap: 14
  },
  disabledPrayerCard: {
    opacity: 0.72
  },
  prayerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  prayerIcon: {
    width: 46,
    height: 46,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  prayerTextWrap: {
    flex: 1
  },
  prayerName: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  prayerTime: {
    color: colors.muted,
    marginTop: 3,
    fontWeight: "800"
  },
  lockedText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  statusRow: {
    flexDirection: "row",
    gap: 8
  },
  statusButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.1)"
  },
  activeStatusButton: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald
  },
  disabledStatusButton: {
    backgroundColor: colors.paper,
    borderColor: colors.line
  },
  missedStatusButton: {
    backgroundColor: colors.danger,
    borderColor: colors.danger
  },
  statusText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  activeStatusText: {
    color: colors.white
  },
  disabledStatusText: {
    color: colors.muted
  }
});
