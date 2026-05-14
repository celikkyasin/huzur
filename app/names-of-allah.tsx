import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { namesOfAllah, type AllahName } from "@/data/namesOfAllah";
import { colors, radii, typography } from "@/theme";

function speakName(item: AllahName) {
  Speech.stop();
  Speech.speak(`${item.transliteration}. ${item.meaning}`, {
    language: "tr-TR",
    rate: 0.82,
    pitch: 0.95
  });
}

export default function NamesOfAllahScreen() {
  const [query, setQuery] = useState("");
  const filteredNames = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr-TR");
    if (!term) {
      return namesOfAllah;
    }

    return namesOfAllah.filter((item) => `${item.transliteration} ${item.meaning} ${item.arabic}`.toLocaleLowerCase("tr-TR").includes(term));
  }, [query]);

  const playAll = () => {
    Speech.stop();
    const text = namesOfAllah.map((item) => `${item.order}. ${item.transliteration}. ${item.meaning}.`).join(" ");
    Speech.speak(text, { language: "tr-TR", rate: 0.78, pitch: 0.95 });
  };

  return (
    <ScreenContainer>
      <AppHeader title="Allah'ın 99 İsmi" />
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="sparkles" size={30} color={colors.gold} />
        </View>
        <Text style={styles.title}>Esmaül Hüsna</Text>
        <Text style={styles.subtitle}>İsimleri kart kart inceleyin, anlamlarını okuyun veya sesli dinleyin.</Text>
        <View style={styles.heroActions}>
          <Pressable accessibilityRole="button" onPress={playAll} style={styles.heroButton}>
            <Ionicons name="play" size={18} color={colors.white} />
            <Text style={styles.heroButtonText}>Tümünü Dinle</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => Speech.stop()} style={[styles.heroButton, styles.stopButton]}>
            <Ionicons name="stop" size={18} color={colors.emerald} />
            <Text style={[styles.heroButtonText, styles.stopButtonText]}>Durdur</Text>
          </Pressable>
        </View>
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
              <Pressable accessibilityRole="button" accessibilityLabel={`${item.transliteration} ismini dinle`} onPress={() => speakName(item)} style={styles.listenButton}>
                <Ionicons name="volume-high" size={20} color={colors.emerald} />
              </Pressable>
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
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)"
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
  heroActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18
  },
  heroButton: {
    minHeight: 46,
    borderRadius: radii.round,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.gold
  },
  stopButton: {
    backgroundColor: colors.white
  },
  heroButtonText: {
    color: colors.white,
    fontWeight: "900"
  },
  stopButtonText: {
    color: colors.emerald
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
  listenButton: {
    width: 42,
    height: 42,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldSoft
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
