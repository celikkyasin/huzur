import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { duaCategories, duas } from "@/data/mock";
import { useFavoriteDuaStore } from "@/store/favoriteDuaStore";
import { colors, radii, typography } from "@/theme";

export default function DuaCategoryScreen() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const category = duaCategories.find((item) => item.id === categoryId) ?? duaCategories[0];
  const categoryDuas = duas.filter((dua) => dua.categoryId === category.id);
  const favoriteIds = useFavoriteDuaStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoriteDuaStore((state) => state.toggleFavorite);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <IconButton icon="chevron-back" label="Geri" onPress={() => router.back()} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{category.title}</Text>
          <Text style={styles.subtitle}>{category.subtitle}</Text>
        </View>
        <View style={styles.headerIcon}>
          <Ionicons name={category.icon} size={22} color={colors.emerald} />
        </View>
      </View>

      {categoryDuas.length === 0 ? (
        <Card style={styles.empty}>
          <Text style={styles.emptyTitle}>Bu kategoride dua hazırlanıyor</Text>
          <Text style={styles.emptyText}>Yakında bu başlık altında yeni dualar eklenecek.</Text>
        </Card>
      ) : null}

      {categoryDuas.map((dua) => {
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
              <Text style={styles.arabic}>{dua.arabic}</Text>
              <Text style={styles.meaning}>{dua.meaning}</Text>
              <Text style={styles.source}>{dua.source}</Text>
            </Card>
          </Pressable>
        );
      })}
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
  empty: {
    marginTop: 20
  },
  emptyTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 17
  },
  emptyText: {
    color: colors.muted,
    marginTop: 6,
    lineHeight: 20
  },
  duaCard: {
    marginTop: 14
  },
  duaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  duaTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  arabic: {
    color: colors.emerald,
    textAlign: "right",
    fontSize: 26,
    lineHeight: 42,
    marginTop: 18,
    fontWeight: "800"
  },
  meaning: {
    color: colors.ink,
    lineHeight: 23,
    marginTop: 16,
    fontWeight: "700"
  },
  source: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 10,
    fontWeight: "700"
  }
});
