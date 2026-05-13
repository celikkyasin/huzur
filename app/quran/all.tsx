import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { surahs } from "@/data/mock";
import { fetchQuranChapters } from "@/services/quranApi";
import { colors, radii, typography } from "@/theme";
import type { Surah } from "@/types";

function normalizeSearch(value: string) {
  return value.toLocaleLowerCase("tr-TR").trim();
}

export default function AllSurahsScreen() {
  const [chapterList, setChapterList] = useState<Surah[]>(surahs);
  const [query, setQuery] = useState("");

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

  const filteredSurahs = useMemo(() => {
    const search = normalizeSearch(query);

    if (!search) {
      return chapterList;
    }

    return chapterList.filter((surah) => {
      const values = [surah.number.toString(), surah.name, surah.meaning, surah.revelationPlace, surah.arabicName];
      return values.some((value) => normalizeSearch(value).includes(search));
    });
  }, [chapterList, query]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <IconButton icon="chevron-back" label="Geri" onPress={() => router.back()} />
        <View style={styles.headerText}>
          <Text style={styles.title}>Tüm Sureler</Text>
          <Text style={styles.subtitle}>114 sure, sesli okuma hazır</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name="musical-notes" size={20} color={colors.emerald} />
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Sure ara"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} accessibilityRole="button" accessibilityLabel="Aramayı temizle">
            <Ionicons name="close-circle" size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {filteredSurahs.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sonuç bulunamadı</Text>
          <Text style={styles.emptyText}>Farklı bir sure adı veya numarası deneyin.</Text>
        </Card>
      ) : null}

      {filteredSurahs.map((surah) => (
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
              <Ionicons name="chevron-forward" size={20} color={colors.emerald} />
            </View>
          </Card>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  headerText: {
    flex: 1
  },
  title: {
    color: colors.emerald,
    fontFamily: typography.title,
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4
  },
  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  searchBox: {
    minHeight: 54,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 4
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700"
  },
  emptyCard: {
    marginTop: 12,
    alignItems: "center"
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  emptyText: {
    color: colors.muted,
    marginTop: 6,
    textAlign: "center"
  },
  surahCard: {
    marginTop: 12,
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
  }
});
