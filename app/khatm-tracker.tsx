import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { fetchJuzVerses } from "@/services/quranApi";
import { getKhatmProgress, KHATM_TOTAL_JUZ, useKhatmTrackerStore, type KhatmJuzStatus } from "@/store/khatmTrackerStore";
import { useRewardStore } from "@/store/rewardStore";
import { colors, radii, typography } from "@/theme";
import type { SurahVerse } from "@/types";

const statusOptions: Array<{ status: KhatmJuzStatus; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { status: "unread", label: "Okunmadı", icon: "ellipse-outline" },
  { status: "reading", label: "Devam", icon: "book-outline" },
  { status: "done", label: "Okundu", icon: "checkmark-circle" }
];

const statusColors: Record<KhatmJuzStatus, string> = {
  unread: colors.line,
  reading: colors.gold,
  done: colors.emerald
};

function formatStartDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function KhatmTrackerScreen() {
  const [selectedJuz, setSelectedJuz] = useState(1);
  const [verses, setVerses] = useState<SurahVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(true);
  const [verseError, setVerseError] = useState("");
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const statuses = useKhatmTrackerStore((state) => state.statuses);
  const startedAt = useKhatmTrackerStore((state) => state.startedAt);
  const completionRewarded = useKhatmTrackerStore((state) => state.completionRewarded);
  const hydrateKhatmTracker = useKhatmTrackerStore((state) => state.hydrateKhatmTracker);
  const setJuzStatus = useKhatmTrackerStore((state) => state.setJuzStatus);
  const resetKhatm = useKhatmTrackerStore((state) => state.resetKhatm);
  const markCompletionRewarded = useKhatmTrackerStore((state) => state.markCompletionRewarded);
  const awardReward = useRewardStore((state) => state.awardReward);
  const progress = getKhatmProgress(statuses);
  const juzList = useMemo(() => Array.from({ length: KHATM_TOTAL_JUZ }, (_, index) => index + 1), []);
  const selectedStatus = statuses[selectedJuz] ?? "unread";

  useEffect(() => {
    void hydrateKhatmTracker();
  }, [hydrateKhatmTracker]);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingVerses(true);
    setVerseError("");
    setVerses([]);

    fetchJuzVerses(selectedJuz)
      .then((items) => {
        if (isMounted) {
          setVerses(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setVerseError("Cüz verisi alınamadı. Diyanet Kur'an API ayarını kontrol edin.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingVerses(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedJuz]);

  useEffect(() => {
    if (!progress.isComplete || completionRewarded) {
      return;
    }

    setCompletionModalVisible(true);
    void awardReward({
      action: "khatmComplete",
      title: "Hatim tamamlandı",
      description: "30 cüz hatim takibi",
      points: 50
    });
    void markCompletionRewarded();
  }, [awardReward, completionRewarded, markCompletionRewarded, progress.isComplete]);

  const confirmReset = () => {
    setResetModalVisible(false);
    void resetKhatm();
  };

  return (
    <ScreenContainer>
      <AppHeader title="Hatim Oku" />
      <Card variant="emerald" style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <View style={styles.summaryTextWrap}>
            <Text style={styles.summaryLabel}>Hatim ilerlemesi</Text>
            <Text style={styles.summaryTitle}>{progress.completed}/{progress.total} cüz tamamlandı</Text>
            <Text style={styles.summaryDate}>Başlangıç: {formatStartDate(startedAt)}</Text>
          </View>
          <View style={styles.percentBadge}>
            <Text style={styles.percentText}>%{progress.percent}</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress.percent}%` }]} />
        </View>
      </Card>

      <View style={styles.toolbar}>
        <Text style={styles.sectionTitle}>Cüz Seç</Text>
        <Pressable accessibilityRole="button" onPress={() => setResetModalVisible(true)} style={styles.resetButton}>
          <Ionicons name="refresh" size={16} color={colors.danger} />
          <Text style={styles.resetText}>Sıfırla</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.juzSelector}>
        {juzList.map((juz) => {
          const status = statuses[juz] ?? "unread";
          const isSelected = selectedJuz === juz;

          return (
            <Pressable
              key={juz}
              accessibilityRole="button"
              onPress={() => setSelectedJuz(juz)}
              style={[styles.juzPill, isSelected && styles.selectedJuzPill, status === "done" && styles.doneJuzPill]}
            >
              <Text style={[styles.juzPillText, (isSelected || status === "done") && styles.activeJuzPillText]}>{juz}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Card style={styles.readerCard}>
        <View style={styles.readerHeader}>
          <View>
            <Text style={styles.readerEyebrow}>Seçili cüz</Text>
            <Text style={styles.readerTitle}>{selectedJuz}. Cüz</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: selectedStatus === "unread" ? colors.emeraldSoft : statusColors[selectedStatus] }]}>
            <Text style={[styles.statusBadgeText, selectedStatus !== "unread" && styles.activeStatusBadgeText]}>
              {statusOptions.find((item) => item.status === selectedStatus)?.label}
            </Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          {statusOptions.map((option) => {
            const isActive = selectedStatus === option.status;
            const activeColor = statusColors[option.status];

            return (
              <Pressable
                key={option.status}
                accessibilityRole="button"
                onPress={() => void setJuzStatus(selectedJuz, option.status)}
                style={[styles.statusButton, isActive && { backgroundColor: activeColor, borderColor: activeColor }]}
              >
                <Ionicons name={option.icon} size={16} color={isActive && option.status !== "unread" ? colors.white : colors.emerald} />
                <Text style={[styles.statusText, isActive && option.status !== "unread" && styles.activeStatusText]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {isLoadingVerses ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={colors.emerald} />
          <Text style={styles.loadingText}>Cüz hazırlanıyor...</Text>
        </Card>
      ) : null}

      {verseError ? (
        <Card style={styles.errorCard}>
          <Ionicons name="cloud-offline-outline" size={20} color={colors.emerald} />
          <Text style={styles.errorText}>{verseError}</Text>
        </Card>
      ) : null}

      <View style={styles.verseList}>
        {verses.map((verse, index) => (
          <Card key={`${verse.verseKey ?? verse.number}-${index}`} style={styles.verseCard}>
            <View style={styles.verseHeader}>
              <View style={styles.verseNumber}>
                <Text style={styles.verseNumberText}>{verse.verseKey ?? verse.number}</Text>
              </View>
              <Text style={styles.surahName}>{verse.surahName ?? "Kur'an-ı Kerim"}</Text>
            </View>
            <Text style={styles.arabicVerse}>{verse.arabic}</Text>
            <Text style={styles.translation}>{verse.translation}</Text>
          </Card>
        ))}
      </View>

      <Modal transparent visible={completionModalVisible} animationType="fade" onRequestClose={() => setCompletionModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.completionModal}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="sparkles" size={42} color={colors.gold} />
            </View>
            <Text style={styles.modalEyebrow}>HATİM TAMAMLANDI</Text>
            <Text style={styles.modalTitle}>30 cüz hatim takibin tamamlandı</Text>
            <Text style={styles.modalText}>Allah kabul etsin. Hatim ilerlemen kaydedildi ve ödül altyapısına işlendi.</Text>
            <View style={styles.modalReward}>
              <Ionicons name="trophy" size={18} color={colors.gold} />
              <Text style={styles.modalRewardText}>+50 puan</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => setCompletionModalVisible(false)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Tamam</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={resetModalVisible} animationType="fade" onRequestClose={() => setResetModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Hatim takibi sıfırlansın mı?</Text>
            <Text style={styles.confirmText}>Tüm cüz durumları temizlenir ve yeni başlangıç tarihi oluşturulur.</Text>
            <Pressable accessibilityRole="button" onPress={confirmReset} style={styles.dangerButton}>
              <Text style={styles.dangerButtonText}>Evet, sıfırla</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setResetModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Vazgeç</Text>
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
    gap: 14
  },
  summaryTextWrap: {
    flex: 1
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800"
  },
  summaryTitle: {
    color: colors.white,
    marginTop: 4,
    fontSize: 24,
    lineHeight: 30,
    fontFamily: typography.title,
    fontWeight: "900"
  },
  summaryDate: {
    color: "rgba(255,255,255,0.74)",
    marginTop: 8,
    fontSize: 12,
    fontWeight: "800"
  },
  percentBadge: {
    width: 72,
    height: 72,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(215,179,90,0.4)"
  },
  percentText: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: "900"
  },
  progressTrack: {
    height: 9,
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
  toolbar: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900",
    fontFamily: typography.title
  },
  resetButton: {
    minHeight: 38,
    borderRadius: radii.round,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line
  },
  resetText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "900"
  },
  juzSelector: {
    gap: 8,
    paddingBottom: 14
  },
  juzPill: {
    width: 48,
    height: 48,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line
  },
  selectedJuzPill: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald
  },
  doneJuzPill: {
    backgroundColor: colors.gold,
    borderColor: colors.gold
  },
  juzPillText: {
    color: colors.emerald,
    fontWeight: "900"
  },
  activeJuzPillText: {
    color: colors.white
  },
  readerCard: {
    gap: 14,
    marginBottom: 14
  },
  readerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  readerEyebrow: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900"
  },
  readerTitle: {
    color: colors.ink,
    marginTop: 3,
    fontSize: 22,
    fontFamily: typography.title,
    fontWeight: "900"
  },
  statusBadge: {
    minHeight: 34,
    borderRadius: radii.round,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  statusBadgeText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  activeStatusBadgeText: {
    color: colors.white
  },
  statusRow: {
    flexDirection: "row",
    gap: 7
  },
  statusButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: radii.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 6,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.1)"
  },
  statusText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: "900"
  },
  activeStatusText: {
    color: colors.white
  },
  loadingCard: {
    marginBottom: 14,
    alignItems: "center",
    gap: 10
  },
  loadingText: {
    color: colors.muted,
    fontWeight: "800"
  },
  errorCard: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  errorText: {
    color: colors.ink,
    flex: 1,
    lineHeight: 20,
    fontWeight: "700"
  },
  verseList: {
    gap: 12,
    paddingBottom: 22
  },
  verseCard: {
    gap: 14
  },
  verseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  verseNumber: {
    minWidth: 44,
    height: 32,
    borderRadius: radii.round,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldSoft
  },
  verseNumberText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  surahName: {
    color: colors.muted,
    flex: 1,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "800"
  },
  arabicVerse: {
    color: colors.emerald,
    textAlign: "right",
    fontSize: 27,
    lineHeight: 48,
    fontWeight: "800"
  },
  translation: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "800"
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
  },
  confirmModal: {
    width: "100%",
    maxWidth: 370,
    borderRadius: radii.xl,
    padding: 22,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line
  },
  confirmTitle: {
    color: colors.ink,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    fontFamily: typography.title
  },
  confirmText: {
    color: colors.muted,
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "800"
  },
  dangerButton: {
    minHeight: 48,
    marginTop: 20,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.danger
  },
  dangerButtonText: {
    color: colors.white,
    fontWeight: "900"
  },
  cancelButton: {
    minHeight: 44,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  cancelButtonText: {
    color: colors.emerald,
    fontWeight: "900"
  }
});
