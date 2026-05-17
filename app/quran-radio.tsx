import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors, radii, typography } from "@/theme";

const RADIO_URL = "https://diyanetkuranradyo.com/yayin-akisi";

export default function QuranRadioScreen() {
  return (
    <ScreenContainer scroll={false} contentStyle={styles.content}>
      <AppHeader title="Kur'an Radyo" />
      <Card variant="emerald" style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="radio" size={28} color={colors.gold} />
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroLabel}>CANLI DİNLE</Text>
          <Text style={styles.heroTitle}>Diyanet Kur'an Radyo</Text>
        </View>
      </Card>
      <Card style={styles.playerCard}>
        <WebView source={{ uri: RADIO_URL }} javaScriptEnabled domStorageEnabled mediaPlaybackRequiresUserAction={false} style={styles.webView} />
      </Card>
      <Pressable accessibilityRole="button" onPress={() => Linking.openURL(RADIO_URL)} style={styles.sourceButton}>
        <Text style={styles.sourceText}>Kaynağı tarayıcıda aç</Text>
        <Ionicons name="open-outline" size={18} color={colors.emerald} />
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 24 },
  hero: { marginTop: 16, marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 14 },
  heroIcon: { width: 54, height: 54, borderRadius: radii.round, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  heroTextWrap: { flex: 1 },
  heroLabel: { color: colors.gold, fontSize: 12, fontWeight: "900" },
  heroTitle: { color: colors.white, fontFamily: typography.title, fontSize: 25, fontWeight: "900", marginTop: 3 },
  playerCard: { flex: 1, overflow: "hidden", padding: 0 },
  webView: { flex: 1, backgroundColor: colors.paper },
  sourceButton: { minHeight: 48, marginTop: 12, borderRadius: radii.round, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  sourceText: { color: colors.emerald, fontWeight: "900" }
});
