import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { duaCategories, duas } from "@/data/mock";
import { useFavoriteDuaStore } from "@/store/favoriteDuaStore";
import { colors, radii, typography } from "@/theme";

export default function DuasScreen() {
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const featured = duas[0];
  const favoriteIds = useFavoriteDuaStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoriteDuaStore((state) => state.toggleFavorite);
  const isFeaturedFavorite = favoriteIds.includes(featured.id);
  const visibleDuas = activeTab === "favorites" ? duas.filter((dua) => favoriteIds.includes(dua.id)) : duas;

  return (
    <ScreenContainer>
      <AppHeader />
      <Text style={styles.title}>Dualar</Text>
      <Text style={styles.subtitle}>Günlük manevi rehberiniz ve sığınağınız.</Text>

      <View style={styles.segment}>
        <Pressable accessibilityRole="button" onPress={() => setActiveTab("all")} style={[styles.segmentButton, activeTab === "all" && styles.segmentButtonActive]}>
          <Text style={[styles.segmentText, activeTab === "all" && styles.segmentTextActive]}>Tüm Dualar</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setActiveTab("favorites")} style={[styles.segmentButton, activeTab === "favorites" && styles.segmentButtonActive]}>
          <Text style={[styles.segmentText, activeTab === "favorites" && styles.segmentTextActive]}>Favoriler</Text>
        </Pressable>
      </View>

      {activeTab === "all" ? (
        <>
          <Pressable onPress={() => router.push(`/duas/detail/${featured.id}` as never)}>
            <Card variant="soft" style={styles.featured}>
              <View style={styles.featuredTop}>
                <Text style={styles.featuredLabel}>Günün Duası</Text>
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    void toggleFavorite(featured.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={isFeaturedFavorite ? "Favoriden çıkar" : "Favoriye ekle"}
                >
                  <Ionicons name={isFeaturedFavorite ? "heart" : "heart-outline"} size={22} color={isFeaturedFavorite ? colors.gold : colors.emerald} />
                </Pressable>
              </View>
              <Text style={styles.arabic}>{featured.arabic}</Text>
              <Text style={styles.meaning}>“{featured.meaning}”</Text>
              <Text style={styles.source}>{featured.source}</Text>
            </Card>
          </Pressable>

          <SectionTitle title="Kategoriler" />
          <View style={styles.grid}>
            {duaCategories.map((category) => (
              <Pressable key={category.id} onPress={() => router.push(`/duas/${category.id}` as never)} style={styles.categoryPressable}>
                <Card variant="soft" style={styles.category}>
                  <View style={styles.categoryIcon}>
                    <Ionicons name={category.icon} size={24} color={colors.emerald} />
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                </Card>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}

      <SectionTitle title={activeTab === "favorites" ? "Favori Dualar" : "Okuma Listesi"} />
      {activeTab === "favorites" && visibleDuas.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="heart-outline" size={24} color={colors.emerald} />
          <Text style={styles.emptyTitle}>Henüz favori duanız yok</Text>
          <Text style={styles.emptyText}>Beğendiğiniz duaların kalp simgesine dokunarak burada saklayabilirsiniz.</Text>
        </Card>
      ) : null}

      {visibleDuas.map((dua) => {
        const isFavorite = favoriteIds.includes(dua.id);

        return (
          <Pressable key={dua.id} onPress={() => router.push(`/duas/detail/${dua.id}` as never)}>
            <Card style={styles.duaCard}>
              <View style={styles.duaHeader}>
                <Text style={styles.duaTitle}>{dua.title}</Text>
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    void toggleFavorite(dua.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={isFavorite ? "Favoriden çıkar" : "Favoriye ekle"}
                >
                  <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? colors.gold : colors.emerald} />
                </Pressable>
              </View>
              <Text style={styles.duaArabic}>{dua.arabic}</Text>
              <Text style={styles.duaMeaning}>{dua.meaning}</Text>
              <Text style={styles.source}>{dua.source}</Text>
            </Card>
          </Pressable>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.title,
    color: colors.emerald,
    fontSize: 36,
    fontWeight: "900",
    marginTop: 18
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16
  },
  segment: {
    flexDirection: "row",
    backgroundColor: colors.emeraldSoft,
    borderRadius: radii.round,
    padding: 5,
    marginBottom: 18
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentButtonActive: {
    backgroundColor: colors.emerald
  },
  segmentText: {
    color: colors.emerald,
    fontSize: 13,
    fontWeight: "900"
  },
  segmentTextActive: {
    color: colors.white
  },
  featured: {
    minHeight: 210
  },
  featuredTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  featuredLabel: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: "900"
  },
  arabic: {
    color: colors.emerald,
    textAlign: "right",
    fontSize: 28,
    lineHeight: 45,
    marginTop: 18,
    fontWeight: "800"
  },
  meaning: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 18,
    fontWeight: "700"
  },
  source: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 10,
    fontWeight: "700"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  categoryPressable: {
    width: "48%"
  },
  category: {
    minHeight: 145,
    justifyContent: "center"
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: radii.round,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  categoryTitle: {
    color: colors.emerald,
    fontWeight: "900",
    fontSize: 15
  },
  categorySubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4
  },
  emptyCard: {
    alignItems: "center",
    marginBottom: 14
  },
  emptyTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 17,
    marginTop: 10
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 6
  },
  duaCard: {
    marginBottom: 12
  },
  duaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  duaTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 17,
    flex: 1,
    paddingRight: 10
  },
  duaArabic: {
    color: colors.emerald,
    textAlign: "right",
    fontSize: 23,
    lineHeight: 38,
    marginTop: 16,
    fontWeight: "800"
  },
  duaMeaning: {
    color: colors.ink,
    lineHeight: 22,
    marginTop: 12
  }
});
