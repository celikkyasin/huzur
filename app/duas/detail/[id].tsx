import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { duaCategories, duas } from "@/data/mock";
import { useFavoriteDuaStore } from "@/store/favoriteDuaStore";
import { colors, radii, typography } from "@/theme";

export default function DuaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dua = duas.find((item) => item.id === id) ?? duas[0];
  const category = duaCategories.find((item) => item.id === dua.categoryId);
  const favoriteIds = useFavoriteDuaStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoriteDuaStore((state) => state.toggleFavorite);
  const isFavorite = favoriteIds.includes(dua.id);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <IconButton icon="chevron-back" label="Geri" onPress={() => router.back()} />
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{dua.title}</Text>
          <Text style={styles.headerSubtitle}>{category?.title ?? "Dua"}</Text>
        </View>
        <Pressable
          onPress={() => {
            void toggleFavorite(dua.id);
          }}
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonSelected]}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? "Favoriden çıkar" : "Favoriye ekle"}
        >
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? colors.white : colors.emerald} />
        </Pressable>
      </View>

      <Card variant="emerald" style={styles.hero}>
        <Text style={styles.arabic}>{dua.arabic}</Text>
      </Card>

      <Card style={styles.readingCard}>
        <Text style={styles.sectionLabel}>Türkçe Anlamı</Text>
        <Text style={styles.meaning}>{dua.meaning}</Text>
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Açıklama</Text>
        <Text style={styles.explanation}>{dua.explanation}</Text>
        <Text style={styles.source}>{dua.source}</Text>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  headerText: {
    flex: 1,
    alignItems: "center"
  },
  headerTitle: {
    color: colors.emerald,
    fontFamily: typography.title,
    fontSize: 22,
    fontWeight: "900"
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
    fontWeight: "700"
  },
  favoriteButton: {
    width: 42,
    height: 42,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldSoft
  },
  favoriteButtonSelected: {
    backgroundColor: colors.gold
  },
  hero: {
    marginTop: 18,
    minHeight: 210,
    justifyContent: "center"
  },
  arabic: {
    color: colors.goldSoft,
    textAlign: "right",
    fontSize: 32,
    lineHeight: 54,
    fontWeight: "900"
  },
  readingCard: {
    marginTop: 16
  },
  sectionLabel: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  meaning: {
    color: colors.ink,
    fontFamily: typography.title,
    fontSize: 21,
    lineHeight: 31,
    fontWeight: "800",
    marginTop: 10
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 18
  },
  explanation: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 10
  },
  source: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 18,
    fontWeight: "800"
  }
});
