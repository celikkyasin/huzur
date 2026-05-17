import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { NativeMessageAdCard } from "@/components/NativeMessageAdCard";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useQadaPrayerStore } from "@/store/qadaPrayerStore";
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

const statusTones: Record<PrayerCompletionStatus, { active: string }> = {
  done: {
    active: colors.emerald
  },
  later: {
    active: colors.gold
  },
  missed: {
    active: colors.danger
  }
};

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
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const records = usePrayerTrackerStore((state) => state.records);
  const hydratePrayerTracker = usePrayerTrackerStore((state) => state.hydratePrayerTracker);
  const markPrayer = usePrayerTrackerStore((state) => state.markPrayer);
  const addQadaPrayer = useQadaPrayerStore((state) => state.changeCount);
  const prayerTimes = usePrayerTimesStore((state) => state.times);
  const awardReward = useRewardStore((state) => state.awardReward);
  const recentDates = useMemo(() => getRecentPrayerDates(7), []);
  const selectedDateKey = getDateKey(selectedDate);
  const selectedRecord = records[selectedDateKey];
  const progress = getPrayerProgress(records, selectedDateKey);
  const streak = getCompletionStreak(records, selectedDate);

  const timeMap = useMemo(() => new Map(prayerTimes.map((time) => [time.id, time.time])), [prayerTimes]);

  useEffect(() => {
    void hydratePrayerTracker();
  }, [hydratePrayerTracker]);

  const updatePrayer = async (prayerId: TrackedPrayerId, status: PrayerCompletionStatus) => {
    const previousStatus = records[selectedDateKey]?.prayers[prayerId];
    const rewards = await markPrayer(selectedDateKey, prayerId, status);

    if (status === "missed" && previousStatus !== "missed") {
      await addQadaPrayer(prayerId, 1);
    }

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
      setCompletionModalVisible(true);
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
                  const tone = statusTones[option.status];
                  return (
                    <Pressable
                      key={option.status}
                      accessibilityRole="button"
                      disabled={!isPrayerEnabled}
                      onPress={() => void updatePrayer(prayer.id, option.status)}
                      style={[
                        styles.statusButton,
                        !isPrayerEnabled && styles.disabledStatusButton,
                        isActive && { backgroundColor: tone.active, borderColor: tone.active }
                      ]}
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
        <NativeMessageAdCard style={styles.bottomAdCard} />
      </View>

      <Modal transparent visible={completionModalVisible} animationType="fade" onRequestClose={() => setCompletionModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.completionModal}>
            <View style={styles.modalGlow} />
            <View style={styles.modalIconWrap}>
              <Ionicons name="checkmark-circle" size={42} color={colors.gold} />
            </View>
            <Text style={styles.modalEyebrow}>GÜN TAMAMLANDI</Text>
            <Text style={styles.modalTitle}>5 vakit namaz takibin tamamlandı</Text>
            <Text style={styles.modalText}>Bugünün devamlılığı kaydedildi ve ödül puanın eklendi.</Text>
            <View style={styles.modalReward}>
              <Ionicons name="sparkles" size={18} color={colors.gold} />
              <Text style={styles.modalRewardText}>+10 puan</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => setCompletionModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Tamam</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  bottomAdCard: {
    marginTop: 4,
    marginBottom: 0
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
  disabledStatusButton: {
    backgroundColor: colors.paper,
    borderColor: colors.line
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
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(9,22,18,0.58)"
  },
  completionModal: {
    width: "100%",
    maxWidth: 390,
    overflow: "hidden",
    alignItems: "center",
    borderRadius: radii.xl,
    padding: 24,
    backgroundColor: colors.emerald,
    borderWidth: 1,
    borderColor: "rgba(215,179,90,0.55)"
  },
  modalGlow: {
    position: "absolute",
    top: -90,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(215,179,90,0.22)"
  },
  modalIconWrap: {
    width: 76,
    height: 76,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  modalEyebrow: {
    marginTop: 18,
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  modalTitle: {
    marginTop: 8,
    color: colors.white,
    textAlign: "center",
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "900",
    fontFamily: typography.title
  },
  modalText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
    fontWeight: "800",
    lineHeight: 21
  },
  modalReward: {
    marginTop: 18,
    minHeight: 44,
    borderRadius: radii.round,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  modalRewardText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900"
  },
  modalButton: {
    width: "100%",
    minHeight: 48,
    marginTop: 20,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold
  },
  modalButtonText: {
    color: colors.ink,
    fontWeight: "900"
  }
});
