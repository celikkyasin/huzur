import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { QuranMiniPlayer } from "@/components/QuranMiniPlayer";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { surahs } from "@/data/mock";
import { fetchQuranChapters } from "@/services/quranApi";
import { useQuranStore } from "@/store/quranStore";
import { colors, radii, typography } from "@/theme";
import type { Surah } from "@/types";

export default function QuranScreen() {
  const [chapterList, setChapterList] = useState<Surah[]>(surahs);
  const savedVerses = useQuranStore((state) => state.savedVerses);
  const featuredSurahs = chapterList.slice(0, 10);
  const savedPreview = savedVerses.slice(0, 4);

  useEffect(() => {
    let isMounted = true;

    fetchQuranChapters().then((chapters) => {
      if (isMounted) {
        setChapterList(chapters);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.root}>
      <ScreenContainer>
        <AppHeader title="Kur'an-ı Kerim" subtitle="Sesli okuma ve meal" />
        <Card variant="soft" style={styles.hero}>
          <Text style={styles.heroTitle}>Fatiha Suresi</Text>
          <Text style={styles.heroSubtitle}>Rahman ve Rahim olan Allah'ın adıyla</Text>
          <Text style={styles.heroArabic}>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ</Text>
        </Card>

        <SectionTitle title="Kaydedilen Ayetler" />
        {savedPreview.length === 0 ? (
          <Card style={styles.emptySaved}>
            <Ionicons name="bookmark-outline" size={24} color={colors.emerald} />
            <Text style={styles.emptySavedTitle}>Henüz kaydedilen ayet yok</Text>
            <Text style={styles.emptySavedText}>Sure içindeki ayetlerin sağ üstündeki kaydet simgesine dokunarak burada saklayabilirsiniz.</Text>
          </Card>
        ) : null}
        {savedPreview.map((verse) => (
          <Pressable key={verse.id} accessibilityRole="button" onPress={() => router.push(`/quran/${verse.surahId}` as never)}>
            <Card style={styles.savedCard}>
              <View style={styles.savedHeader}>
                <Text style={styles.savedSurah}>
                  {verse.surahName} • {verse.number}. ayet
                </Text>
                <Ionicons name="bookmark" size={18} color={colors.gold} />
              </View>
              <Text style={styles.savedArabic} numberOfLines={2}>
                {verse.arabic}
              </Text>
              <Text style={styles.savedTranslation} numberOfLines={2}>
                {verse.translation}
              </Text>
            </Card>
          </Pressable>
        ))}

        <SectionTitle title="Sureler" action="Tümünü Gör" onActionPress={() => router.push("/quran/all" as never)} />
        {featuredSurahs.map((surah) => (
          <Pressable key={surah.id} onPress={() => router.push(`/quran/${surah.id}` as never)} accessibilityRole="button">
            <Card style={styles.surahCard}>
              <View style={styles.surahRow}>
                <View style={styles.number}>
                  <Text style={styles.numberText}>{surah.number}</Text>
                </View>
                <View style={styles.surahInfo}>
                  <Text style={styles.surahName}>{surah.name}</Text>
                  <Text style={styles.surahMeta}>
                    {surah.revelationPlace} • {surah.meaning} • {surah.verses} ayet
                  </Text>
                </View>
                <View style={styles.rightSide}>
                  <Text style={styles.duration}>{surah.duration}</Text>
                  <Ionicons name="chevron-forward" size={20} color={colors.emerald} />
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </ScreenContainer>
      <QuranMiniPlayer title="Kur'an-ı Kerim" subtitle="Dinlemek için sure seçin" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream
  },
  hero: {
    marginTop: 16,
    alignItems: "center"
  },
  heroTitle: {
    fontFamily: typography.title,
    color: colors.emerald,
    fontSize: 26,
    fontWeight: "900"
  },
  heroSubtitle: {
    color: colors.muted,
    marginTop: 6,
    fontSize: 13
  },
  heroArabic: {
    color: colors.emerald,
    fontSize: 25,
    marginTop: 22,
    fontWeight: "800",
    textAlign: "center"
  },
  emptySaved: {
    alignItems: "center",
    marginBottom: 12
  },
  emptySavedTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 10
  },
  emptySavedText: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 6
  },
  savedCard: {
    marginBottom: 10,
    padding: 14
  },
  savedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  savedSurah: {
    color: colors.emerald,
    fontWeight: "900",
    fontSize: 13
  },
  savedArabic: {
    color: colors.emerald,
    fontSize: 22,
    lineHeight: 36,
    textAlign: "right",
    marginTop: 12,
    fontWeight: "800"
  },
  savedTranslation: {
    color: colors.ink,
    marginTop: 10,
    lineHeight: 21,
    fontWeight: "700"
  },
  surahCard: {
    marginBottom: 12,
    padding: 14
  },
  surahRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  number: {
    width: 38,
    height: 38,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  numberText: {
    color: colors.emerald,
    fontWeight: "900"
  },
  surahInfo: {
    flex: 1
  },
  surahName: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 16
  },
  surahMeta: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 12
  },
  rightSide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  duration: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  }
});
