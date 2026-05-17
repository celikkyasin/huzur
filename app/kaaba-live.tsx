import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors, radii, typography } from "@/theme";

const KAABA_VIDEO_ID = "H5D7gPbnLrY";

function getKaabaEmbedHtml() {
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <style>
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #050807; overflow: hidden; }
      iframe { position: fixed; inset: 0; width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <iframe
      src="https://www.youtube-nocookie.com/embed/${KAABA_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&controls=1&fs=1&iv_load_policy=3"
      title="Kabe canlı yayın"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen>
    </iframe>
  </body>
</html>`;
}

export default function KaabaLiveScreen() {
  return (
    <ScreenContainer scroll={false} contentStyle={styles.content}>
      <AppHeader title="Kabe Canlı" />
      <Card variant="emerald" style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="videocam" size={28} color={colors.gold} />
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroLabel}>CANLI YAYIN</Text>
          <Text style={styles.heroTitle}>Kabe'den canlı yayın</Text>
        </View>
      </Card>
      <View style={styles.videoFrame}>
        <WebView
          source={{ html: getKaabaEmbedHtml(), baseUrl: "https://www.youtube-nocookie.com" }}
          javaScriptEnabled
          domStorageEnabled
          allowsFullscreenVideo
          allowsInlineMediaPlayback={false}
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          androidLayerType="hardware"
          style={styles.webView}
        />
      </View>
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
  videoFrame: { flex: 1, overflow: "hidden", borderRadius: radii.lg, backgroundColor: "#050807" },
  webView: { flex: 1, backgroundColor: "#050807" }
});
