import { useMemo, useRef, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Sharing from "expo-sharing";
import ViewShot from "react-native-view-shot";
import { AppHeader } from "@/components/AppHeader";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { namesOfAllah, type AllahName } from "@/data/namesOfAllah";
import { colors, radii, typography } from "@/theme";

export default function NamesOfAllahScreen() {
  const [query, setQuery] = useState("");
  const [sharingId, setSharingId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, ViewShot | null>>({});
  const filteredNames = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr-TR");
    if (!term) {
      return namesOfAllah;
    }

    return namesOfAllah.filter((item) => `${item.transliteration} ${item.meaning} ${item.arabic}`.toLocaleLowerCase("tr-TR").includes(term));
  }, [query]);

  const shareNameCard = async (item: AllahName) => {
    try {
      setSharingId(item.id);
      const canShare = await Sharing.isAvailableAsync();
      const uri = await cardRefs.current[item.id]?.capture?.();

      if (!uri || !canShare) {
        Alert.alert("Paylaşım hazırlanamadı", "Bu cihazda görsel paylaşım şu anda kullanılamıyor.");
        return;
      }

      await Sharing.shareAsync(uri, {
        dialogTitle: item.transliteration,
        mimeType: "image/png"
      });
    } catch {
      Alert.alert("Paylaşım hazırlanamadı", "İsim kartı görseli oluşturulurken bir sorun oluştu.");
    } finally {
      setSharingId(null);
    }
  };

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
        <Text style={styles.subtitle}>Her isim için premium görsel kartları inceleyin, anlamlarını okuyun ve tek dokunuşla paylaşın.</Text>
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
          <View style={styles.nameCardWrap}>
            <ViewShot
              ref={(ref) => {
                cardRefs.current[item.id] = ref;
              }}
              options={{ format: "png", quality: 1, result: "tmpfile" }}
            >
              <NameArtCard item={item} />
            </ViewShot>
            <Pressable accessibilityRole="button" accessibilityLabel={`${item.transliteration} kartını paylaş`} disabled={sharingId === item.id} onPress={() => shareNameCard(item)} style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}>
              <Ionicons name={sharingId === item.id ? "hourglass-outline" : "share-social"} size={18} color={colors.emerald} />
            </Pressable>
          </View>
        )}
      />
    </ScreenContainer>
  );
}

function NameArtCard({ item }: { item: AllahName }) {
  return (
    <LinearGradient colors={["#063F34", "#082F2A", "#F6EFD9"]} locations={[0, 0.68, 1]} start={{ x: 0.1, y: 0 }} end={{ x: 0.95, y: 1 }} style={styles.artCard}>
      <View style={styles.patternTop} />
      <View style={styles.patternBottom} />
      <View style={styles.goldOrb} />
      <View style={styles.cornerFrame} />
      <View style={styles.artHeader}>
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{String(item.order).padStart(2, "0")}</Text>
        </View>
        <Text style={styles.kicker}>Esmaül Hüsna</Text>
      </View>

      <View style={styles.artCenter}>
        <Text style={styles.artArabic} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.68}>
          {item.arabic}
        </Text>
        <View style={styles.goldLine} />
        <Text style={styles.artName}>{item.transliteration}</Text>
        <Text style={styles.artMeaning}>{item.meaning}</Text>
      </View>

      <View style={styles.artFooter}>
        <Text style={styles.footerText}>huzur.app</Text>
      </View>
    </LinearGradient>
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
    gap: 16
  },
  nameCardWrap: {
    borderRadius: 28,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 14 },
    shadowRadius: 22,
    elevation: 5
  },
  pressed: {
    opacity: 0.72
  },
  shareButton: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 42,
    height: 42,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.5)"
  },
  artCard: {
    minHeight: 520,
    aspectRatio: 9 / 14,
    width: "100%",
    borderRadius: 28,
    padding: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.5)"
  },
  patternTop: {
    position: "absolute",
    right: -56,
    top: -54,
    width: 190,
    height: 190,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: "rgba(246,239,217,0.18)"
  },
  patternBottom: {
    position: "absolute",
    left: -76,
    bottom: -74,
    width: 230,
    height: 230,
    borderRadius: radii.round,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.22)"
  },
  goldOrb: {
    position: "absolute",
    right: 40,
    bottom: 72,
    width: 78,
    height: 78,
    borderRadius: radii.round,
    backgroundColor: "rgba(212,175,55,0.16)"
  },
  cornerFrame: {
    position: "absolute",
    left: 18,
    right: 18,
    top: 18,
    bottom: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(246,239,217,0.14)"
  },
  artHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  orderBadge: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(246,239,217,0.12)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.38)"
  },
  orderText: {
    color: colors.gold,
    fontWeight: "900"
  },
  kicker: {
    color: "rgba(246,239,217,0.82)",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  artCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4
  },
  artArabic: {
    color: "#F9F2DD",
    fontSize: 68,
    lineHeight: 92,
    textAlign: "center",
    fontWeight: "900"
  },
  goldLine: {
    width: 86,
    height: 4,
    borderRadius: radii.round,
    backgroundColor: colors.gold,
    marginTop: 18,
    marginBottom: 18
  },
  artName: {
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    textAlign: "center"
  },
  artMeaning: {
    marginTop: 12,
    color: "rgba(246,239,217,0.82)",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "center"
  },
  artFooter: {
    minHeight: 34,
    alignItems: "flex-end",
    justifyContent: "center"
  },
  footerText: {
    color: colors.emerald,
    fontSize: 15,
    fontWeight: "900"
  }
});
