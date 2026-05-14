import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { namesOfAllah } from "@/data/namesOfAllah";
import { colors, radii, typography } from "@/theme";

export default function NamesOfAllahScreen() {
  const [query, setQuery] = useState("");
  const filteredNames = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr-TR");
    if (!term) {
      return namesOfAllah;
    }

    return namesOfAllah.filter((item) => `${item.transliteration} ${item.meaning} ${item.arabic}`.toLocaleLowerCase("tr-TR").includes(term));
  }, [query]);

  return (
    <ScreenContainer>
      <AppHeader title="Allah'ın 99 İsmi" />
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles" size={30} color={colors.gold} />
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>99 isim</Text>
          </View>
        </View>
        <Text style={styles.title}>Esmaül Hüsna</Text>
        <Text style={styles.subtitle}>İsimleri sade kartlarla inceleyin, anlamlarını okuyun ve aradığınız isme hızlıca ulaşın.</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={19} color={colors.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="İsim veya anlam ara" placeholderTextColor={colors.muted} style={styles.searchInput} />
      </View>

      <FlatList
        data={filteredNames}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.nameCard}>
            <View style={styles.cardTop}>
              <View style={styles.number}>
                <Text style={styles.numberText}>{item.order}</Text>
              </View>
              <Text style={styles.arabic}>{item.arabic}</Text>
            </View>
            <Text style={styles.name}>{item.transliteration}</Text>
            <Text style={styles.meaning}>{item.meaning}</Text>
            <Text style={styles.note}>{item.note}</Text>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: 18,
    borderRadius: radii.lg,
    padding: 20,
    backgroundColor: colors.emerald,
    overflow: "hidden"
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  countBadge: {
    minHeight: 34,
    borderRadius: radii.round,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  countText: {
    color: colors.white,
    fontWeight: "900"
  },
  title: {
    marginTop: 14,
    fontFamily: typography.title,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    color: colors.white
  },
  subtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 22,
    fontWeight: "700"
  },
  searchWrap: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    fontWeight: "800"
  },
  list: {
    paddingTop: 16,
    paddingBottom: 18,
    gap: 12
  },
  nameCard: {
    gap: 10
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  number: {
    width: 38,
    height: 38,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldSoft
  },
  numberText: {
    color: colors.emerald,
    fontWeight: "900"
  },
  arabic: {
    flex: 1,
    color: colors.emerald,
    fontSize: 30,
    textAlign: "right",
    fontWeight: "800"
  },
  name: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  meaning: {
    color: colors.emerald,
    fontSize: 15,
    fontWeight: "900"
  },
  note: {
    color: colors.muted,
    lineHeight: 21
  }
});
