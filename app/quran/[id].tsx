import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { surahDetails } from "@/data/mock";
import { fetchSurahVerses } from "@/services/quranApi";
import { useQuranStore } from "@/store/quranStore";
import { useRewardStore } from "@/store/rewardStore";
import { colors, radii, shadows, typography } from "@/theme";
import type { SurahVerse } from "@/types";

const VERSE_PAGE_SIZE = 12;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function QuranDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showStory, setShowStory] = useState(false);
  const [showReadingSettings, setShowReadingSettings] = useState(false);
  const [verses, setVerses] = useState<SurahVerse[]>([]);
  const [visibleVerseCount, setVisibleVerseCount] = useState(VERSE_PAGE_SIZE);
  const [isLoadingVerses, setIsLoadingVerses] = useState(true);
  const [verseError, setVerseError] = useState("");
  const [trackWidth, setTrackWidth] = useState(1);
  const listenedSecondsRef = useRef(0);
  const awardedMinutesRef = useRef(0);
  const lastAudioTimeRef = useRef<number | null>(null);
  const surah = surahDetails.find((item) => item.id === id) ?? surahDetails[0];
  const player = useAudioPlayer({ uri: surah.audioUri, name: surah.name }, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const awardReward = useRewardStore((state) => state.awardReward);
  const savedVerses = useQuranStore((state) => state.savedVerses);
  const fontScale = useQuranStore((state) => state.fontScale);
  const showTranslation = useQuranStore((state) => state.showTranslation);
  const showExplanation = useQuranStore((state) => state.showExplanation);
  const setFontScale = useQuranStore((state) => state.setFontScale);
  const toggleTranslation = useQuranStore((state) => state.toggleTranslation);
  const toggleExplanation = useQuranStore((state) => state.toggleExplanation);
  const toggleSavedVerse = useQuranStore((state) => state.toggleSavedVerse);

  useEffect(() => {
    let isMounted = true;

    setShowStory(false);
    setVisibleVerseCount(VERSE_PAGE_SIZE);
    setIsLoadingVerses(true);
    setVerseError("");
    setVerses([]);

    fetchSurahVerses(surah)
      .then((items) => {
        if (isMounted) {
          setVerses(items);
        }
      })
      .catch(() => {
        if (isMounted) {
          setVerses(surah.versesText);
          setVerseError("Ayetler çevrim içi alınamadı. Kayıtlı örnek metin gösteriliyor.");
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
  }, [surah]);

  const hasDuration = status.duration > 0;
  const isFinished = hasDuration && !status.playing && (status.didJustFinish || status.currentTime >= status.duration - 0.35);
  const progress = hasDuration ? Math.min(status.currentTime / status.duration, 1) : 0;
  const isPlaying = status.playing;
  const visibleVerses = verses.slice(0, visibleVerseCount);
  const hasMoreVerses = visibleVerseCount < verses.length;
  const savedVerseIds = new Set(savedVerses.map((verse) => verse.id));

  useEffect(() => {
    listenedSecondsRef.current = 0;
    awardedMinutesRef.current = 0;
    lastAudioTimeRef.current = null;
  }, [surah.id]);

  useEffect(() => {
    if (!hasDuration) {
      lastAudioTimeRef.current = null;
      return;
    }

    if (!status.playing) {
      lastAudioTimeRef.current = status.currentTime;
      return;
    }

    const lastAudioTime = lastAudioTimeRef.current;
    lastAudioTimeRef.current = status.currentTime;

    if (lastAudioTime === null) {
      return;
    }

    const delta = status.currentTime - lastAudioTime;

    if (delta <= 0 || delta > 2) {
      return;
    }

    listenedSecondsRef.current += delta;

    const listenedMinutes = Math.floor(listenedSecondsRef.current / 60);
    const newMinutes = listenedMinutes - awardedMinutesRef.current;

    if (newMinutes <= 0) {
      return;
    }

    awardedMinutesRef.current = listenedMinutes;

    void awardReward({
      action: "surahListen",
      title: `${newMinutes} dakika sure dinlendi`,
      description: surah.name,
      points: newMinutes
    });
  }, [awardReward, hasDuration, status.currentTime, status.playing, surah.name]);

  const togglePlayback = async () => {
    if (isPlaying) {
      player.pause();
      return;
    }

    if (isFinished) {
      await player.seekTo(0);
    }

    player.play();
  };

  const loadMoreVerses = () => {
    if (!hasMoreVerses) {
      return;
    }

    setVisibleVerseCount((count) => Math.min(count + VERSE_PAGE_SIZE, verses.length));
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);

    if (distanceFromBottom < 420) {
      loadMoreVerses();
    }
  };

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(Math.max(event.nativeEvent.layout.width, 1));
  };

  const seekToPosition = (event: GestureResponderEvent) => {
    if (!hasDuration) {
      return;
    }

    const nextProgress = Math.max(0, Math.min(event.nativeEvent.locationX / trackWidth, 1));
    void player.seekTo(status.duration * nextProgress);
  };

  return (
    <View style={styles.root}>
      <ScreenContainer
        contentStyle={styles.content}
        scrollProps={{
          onScroll: handleScroll,
          scrollEventThrottle: 120
        }}
      >
        <View style={styles.header}>
          <IconButton icon="chevron-back" label="Geri" onPress={() => router.back()} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{surah.name}</Text>
            <Text style={styles.headerSubtitle}>
              {surah.revelationPlace} • {surah.verses} ayet
            </Text>
          </View>
          <IconButton icon="settings" label="Okuma ayarları" selected={showReadingSettings} onPress={() => setShowReadingSettings((value) => !value)} />
        </View>

        {showReadingSettings ? (
          <Card style={styles.settingsCard}>
            <Text style={styles.settingsTitle}>Okuma Ayarları</Text>
            <Text style={styles.settingsSubtitle}>Ayet metnini kendi okuma alışkanlığınıza göre düzenleyin.</Text>
            <View style={styles.fontRow}>
              {[
                { label: "Küçük", value: 0.9 },
                { label: "Normal", value: 1 },
                { label: "Büyük", value: 1.14 }
              ].map((item) => (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  onPress={() => {
                    void setFontScale(item.value);
                  }}
                  style={[styles.fontButton, fontScale === item.value && styles.fontButtonActive]}
                >
                  <Text style={[styles.fontButtonText, fontScale === item.value && styles.fontButtonTextActive]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable accessibilityRole="button" onPress={() => void toggleTranslation()} style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Türkçe meal</Text>
                <Text style={styles.settingText}>Ayetlerin Türkçe anlamını göster.</Text>
              </View>
              <View style={[styles.switch, showTranslation && styles.switchActive]}>
                <View style={[styles.switchKnob, showTranslation && styles.switchKnobActive]} />
              </View>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => void toggleExplanation()} style={styles.settingRow}>
              <View>
                <Text style={styles.settingTitle}>Açıklama</Text>
                <Text style={styles.settingText}>Kısa tefekkür notlarını göster.</Text>
              </View>
              <View style={[styles.switch, showExplanation && styles.switchActive]}>
                <View style={[styles.switchKnob, showExplanation && styles.switchKnobActive]} />
              </View>
            </Pressable>
          </Card>
        ) : null}

        <Card variant="emerald" style={styles.hero}>
          <Text style={styles.arabicName}>{surah.arabicName}</Text>
          <Text style={styles.surahTitle}>{surah.name}</Text>
          <Text style={styles.description}>{surah.description}</Text>
        </Card>

        <Card style={styles.storyCard}>
          <Pressable onPress={() => setShowStory((value) => !value)} style={styles.storyToggle} accessibilityRole="button">
            <View>
              <Text style={styles.storyLabel}>İniş Bağlamı</Text>
              <Text style={styles.storyTitle}>Ne zaman indiğini oku</Text>
            </View>
            <Ionicons name={showStory ? "chevron-up" : "chevron-down"} size={22} color={colors.emerald} />
          </Pressable>
          {showStory ? <Text style={styles.storyText}>{surah.revelationStory}</Text> : null}
        </Card>

        <Card style={styles.playerCard}>
          <View style={styles.playerTop}>
            <View>
              <Text style={styles.playerTitle}>Sesli Dinle</Text>
              <Text style={styles.playerSubtitle}>Mişari Raşid el-Afasi</Text>
            </View>
            <Pressable onPress={togglePlayback} style={styles.playButton} accessibilityRole="button">
              <Ionicons name={isPlaying ? "pause" : "play"} size={28} color={colors.emerald} />
            </Pressable>
          </View>
          <Pressable onPressIn={seekToPosition} onLayout={handleTrackLayout} style={styles.seekArea} accessibilityRole="button" accessibilityLabel="Ses ilerleme çubuğu">
            <View pointerEvents="none" style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
            </View>
          </Pressable>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(status.currentTime)}</Text>
            <Text style={styles.timeText}>{status.duration > 0 ? formatTime(status.duration) : surah.duration}</Text>
          </View>
          <Text style={styles.seekHint}>İlerletmek için çizgiye dokunun.</Text>
          <PrimaryButton
            label={isPlaying ? "Duraklat" : isFinished ? "Tekrar Dinle" : "Sureyi Dinle"}
            icon={isPlaying ? "pause" : "play"}
            onPress={togglePlayback}
            style={styles.listenButton}
          />
        </Card>

        <SectionTitle title="Ayetler ve Türkçe Açıklama" />
        {isLoadingVerses ? (
          <Card style={styles.loadingCard}>
            <ActivityIndicator color={colors.emerald} />
            <Text style={styles.loadingText}>Ayetler hazırlanıyor...</Text>
          </Card>
        ) : null}
        {verseError ? (
          <Card style={styles.errorCard}>
            <Ionicons name="cloud-offline-outline" size={20} color={colors.emerald} />
            <Text style={styles.errorText}>{verseError}</Text>
          </Card>
        ) : null}
        {visibleVerses.map((verse) => {
          const savedId = `${surah.id}:${verse.number}`;
          const isSaved = savedVerseIds.has(savedId);

          return (
            <Card key={verse.number} style={styles.verseCard}>
              <View style={styles.verseHeader}>
                <View style={styles.verseNumber}>
                  <Text style={styles.verseNumberText}>{verse.number}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isSaved ? "Ayet kayıtlardan çıkar" : "Ayeti kaydet"}
                  onPress={() => {
                    void toggleSavedVerse({
                      ...verse,
                      surahId: surah.id,
                      surahName: surah.name
                    });
                  }}
                  style={[styles.bookmarkButton, isSaved && styles.bookmarkButtonSaved]}
                >
                  <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? colors.white : colors.gold} />
                </Pressable>
              </View>
              <Text style={[styles.arabicVerse, { fontSize: 28 * fontScale, lineHeight: 48 * fontScale }]}>{verse.arabic}</Text>
              {showTranslation ? <Text style={[styles.translation, { fontSize: 16 * fontScale, lineHeight: 24 * fontScale }]}>{verse.translation}</Text> : null}
              {showExplanation ? (
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationLabel}>Açıklama</Text>
                  <Text style={styles.explanation}>{verse.explanation}</Text>
                </View>
              ) : null}
            </Card>
          );
        })}
        {hasMoreVerses ? <PrimaryButton label="Daha Fazla Ayet Göster" icon="chevron-down" onPress={loadMoreVerses} style={styles.moreButton} /> : null}
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream
  },
  content: {
    paddingBottom: 52
  },
  header: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  headerText: {
    flex: 1,
    alignItems: "center"
  },
  headerTitle: {
    color: colors.emerald,
    fontFamily: typography.title,
    fontSize: 20,
    fontWeight: "900"
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
    fontWeight: "700"
  },
  settingsCard: {
    marginTop: 10,
    marginBottom: 10,
    padding: 16
  },
  settingsTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  settingsSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5
  },
  fontRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  fontButton: {
    flex: 1,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    paddingVertical: 10,
    alignItems: "center"
  },
  fontButtonActive: {
    backgroundColor: colors.emerald
  },
  fontButtonText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  fontButtonTextActive: {
    color: colors.white
  },
  settingRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  settingTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  settingText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  switch: {
    width: 48,
    height: 28,
    borderRadius: radii.round,
    backgroundColor: colors.sage,
    padding: 3
  },
  switchActive: {
    backgroundColor: colors.emerald
  },
  switchKnob: {
    width: 22,
    height: 22,
    borderRadius: radii.round,
    backgroundColor: colors.white
  },
  switchKnobActive: {
    transform: [{ translateX: 20 }]
  },
  hero: {
    marginTop: 12,
    alignItems: "center"
  },
  arabicName: {
    color: colors.goldSoft,
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center"
  },
  surahTitle: {
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 10
  },
  description: {
    color: "rgba(255,255,255,0.78)",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10
  },
  storyCard: {
    marginTop: 16,
    padding: 16
  },
  storyToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  storyLabel: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  storyTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4
  },
  storyText: {
    color: colors.ink,
    lineHeight: 23,
    marginTop: 14,
    fontSize: 14
  },
  playerCard: {
    marginTop: 16
  },
  playerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  playerTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  playerSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4
  },
  playButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card
  },
  seekArea: {
    height: 34,
    justifyContent: "center",
    marginTop: 10
  },
  progressTrack: {
    height: 6,
    borderRadius: radii.round,
    backgroundColor: colors.sage,
    overflow: "hidden"
  },
  progressBar: {
    height: 6,
    borderRadius: radii.round,
    backgroundColor: colors.gold
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8
  },
  timeText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  seekHint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center"
  },
  listenButton: {
    marginTop: 16
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
  verseCard: {
    marginBottom: 14
  },
  verseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  verseNumber: {
    width: 32,
    height: 32,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  verseNumberText: {
    color: colors.emerald,
    fontWeight: "900"
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  bookmarkButtonSaved: {
    backgroundColor: colors.gold
  },
  arabicVerse: {
    color: colors.emerald,
    textAlign: "right",
    fontWeight: "800",
    marginTop: 18
  },
  translation: {
    color: colors.ink,
    marginTop: 16,
    fontWeight: "800"
  },
  explanationBox: {
    marginTop: 14,
    borderRadius: radii.md,
    backgroundColor: colors.emeraldSoft,
    padding: 14
  },
  explanationLabel: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6
  },
  explanation: {
    color: colors.ink,
    lineHeight: 21
  },
  moreButton: {
    marginTop: 4
  }
});
