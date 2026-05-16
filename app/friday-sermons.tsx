import { useEffect, useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { buildFridayKhutbahMonths, getKhutbahPreview, getKhutbahYoutubeEmbedHtml, latestFridayKhutbah, mergeFridayKhutbahs } from "@/data/fridayKhutbahs";
import { fetchRemoteFridaySermons } from "@/services/fridaySermonsApi";
import { colors, radii, typography } from "@/theme";

export default function FridaySermonsScreen() {
  const [khutbahs, setKhutbahs] = useState(() => mergeFridayKhutbahs(null));
  const [openMonthKey, setOpenMonthKey] = useState(latestFridayKhutbah.monthKey);
  const [openVideoId, setOpenVideoId] = useState<string | null>(null);
  const months = useMemo(() => buildFridayKhutbahMonths(khutbahs), [khutbahs]);
  const latestKhutbah = khutbahs[0] || latestFridayKhutbah;

  useEffect(() => {
    let isMounted = true;

    fetchRemoteFridaySermons().then((remoteKhutbahs) => {
      if (!isMounted || !remoteKhutbahs?.length) {
        return;
      }

      const merged = mergeFridayKhutbahs(remoteKhutbahs);
      setKhutbahs(merged);
      setOpenMonthKey((current) => current || merged[0]?.monthKey || latestFridayKhutbah.monthKey);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScreenContainer>
      <AppHeader title="Cuma Hutbeleri" />
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>Bu haftanın hutbesi</Text>
          <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.84}>
            {latestKhutbah.title}
          </Text>
          <Text style={styles.subtitle}>
            {latestKhutbah.date} - {latestKhutbah.sourceName}
          </Text>
        </View>
      </View>

      <Card style={styles.sourceCard}>
        <Ionicons name="shield-checkmark" size={22} color={colors.emerald} />
        <Text style={styles.sourceText}>
          Hutbe başlıkları ve kaynak bağlantıları Diyanet Haber / Diyanet TV arşivine göre gösterilir. Önizleme kısa özettir; resmi metnin devamı kaynakta açılır.
        </Text>
      </Card>

      <View style={styles.list}>
        {months.map((month) => {
          const isOpen = openMonthKey === month.key;

          return (
            <Card key={month.key} style={styles.monthCard}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${month.label} hutbelerini ${isOpen ? "kapat" : "aç"}`}
                onPress={() => setOpenMonthKey(isOpen ? "" : month.key)}
                style={styles.monthHeader}
              >
                <View style={styles.monthHeaderText}>
                  <Text style={styles.monthTitle}>{month.label}</Text>
                  <Text style={styles.monthCount}>{month.items.length} hutbe</Text>
                </View>
                <View style={styles.chevron}>
                  <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={22} color={colors.emerald} />
                </View>
              </Pressable>

              {isOpen ? (
                <View style={styles.monthItems}>
                  {month.items.map((khutbah) => {
                    const isLatest = khutbah.id === latestKhutbah.id;
                    const embedHtml = getKhutbahYoutubeEmbedHtml(khutbah);
                    const isVideoOpen = openVideoId === khutbah.id;

                    return (
                      <View key={khutbah.id} style={[styles.sermonRow, isLatest && styles.latestRow]}>
                        <View style={styles.cardHeader}>
                          <View style={styles.dateBadge}>
                            <Text style={styles.dateText}>{khutbah.date}</Text>
                          </View>
                          {isLatest ? (
                            <View style={styles.latestBadge}>
                              <Text style={styles.latestBadgeText}>Güncel</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.cardTitle}>{khutbah.title}</Text>
                        <Text style={styles.summary}>{khutbah.summary}</Text>
                        {embedHtml ? (
                          <View style={styles.videoCard}>
                            <View style={styles.videoHeader}>
                              <View style={styles.videoTitleRow}>
                                <Ionicons name="logo-youtube" size={20} color="#d93025" />
                                <Text style={styles.videoTitle}>Hutbe videosu</Text>
                              </View>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`${khutbah.title} videosunu ${isVideoOpen ? "kapat" : "oynat"}`}
                                onPress={() => setOpenVideoId(isVideoOpen ? null : khutbah.id)}
                                style={styles.videoButton}
                              >
                                <Ionicons name={isVideoOpen ? "close" : "play"} size={17} color={colors.white} />
                                <Text style={styles.videoButtonText}>{isVideoOpen ? "Kapat" : "Oynat"}</Text>
                              </Pressable>
                            </View>
                            {isVideoOpen ? (
                              <View style={styles.videoFrame}>
                                <WebView
                                  source={{ html: embedHtml, baseUrl: "https://www.youtube-nocookie.com" }}
                                  allowsFullscreenVideo
                                  allowsInlineMediaPlayback
                                  androidLayerType="hardware"
                                  javaScriptEnabled
                                  domStorageEnabled
                                  mediaPlaybackRequiresUserAction={false}
                                  setSupportMultipleWindows={false}
                                  style={styles.videoWebView}
                                />
                              </View>
                            ) : null}
                          </View>
                        ) : null}
                        <View style={styles.previewBox}>
                          <View style={styles.previewHeader}>
                            <Ionicons name="reader-outline" size={17} color={colors.gold} />
                            <Text style={styles.previewLabel}>Kısa bölüm</Text>
                          </View>
                          <Text style={styles.previewText}>{getKhutbahPreview(khutbah.id)}</Text>
                        </View>
                        <View style={styles.actionRow}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`${khutbah.title} hutbesinin devamını Diyanet kaynağında aç`}
                            onPress={() => Linking.openURL(khutbah.sourceUrl)}
                            style={styles.sourceButton}
                          >
                            <Ionicons name="open-outline" size={18} color={colors.emerald} />
                            <Text style={styles.sourceButtonText}>Devamını Diyanet'te oku</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: 18,
    borderRadius: radii.lg,
    padding: 20,
    backgroundColor: colors.emerald,
    flexDirection: "row",
    alignItems: "flex-start"
  },
  heroText: {
    flex: 1
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontWeight: "900"
  },
  title: {
    marginTop: 8,
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.74)",
    fontWeight: "800"
  },
  sourceCard: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: colors.goldSoft
  },
  sourceText: {
    flex: 1,
    color: colors.ink,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  list: {
    gap: 14,
    paddingTop: 18,
    paddingBottom: 18
  },
  monthCard: {
    padding: 0,
    overflow: "hidden"
  },
  monthHeader: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  monthHeaderText: {
    flex: 1
  },
  monthTitle: {
    color: colors.ink,
    fontSize: 21,
    fontFamily: typography.title,
    fontWeight: "900"
  },
  monthCount: {
    marginTop: 3,
    color: colors.muted,
    fontWeight: "800"
  },
  chevron: {
    width: 42,
    height: 42,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  monthItems: {
    borderTopWidth: 1,
    borderTopColor: colors.line
  },
  sermonRow: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  latestRow: {
    backgroundColor: "rgba(215,179,90,0.12)"
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  dateBadge: {
    minHeight: 30,
    borderRadius: radii.round,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldSoft
  },
  dateText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  latestBadge: {
    minHeight: 30,
    borderRadius: radii.round,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft
  },
  latestBadgeText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  summary: {
    color: colors.emerald,
    fontWeight: "800",
    lineHeight: 21
  },
  videoCard: {
    gap: 10,
    borderRadius: radii.md,
    padding: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(0,105,79,0.16)"
  },
  videoHeader: {
    minHeight: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  videoTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  videoTitle: {
    color: colors.ink,
    fontWeight: "900"
  },
  videoButton: {
    minHeight: 36,
    borderRadius: radii.round,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.emerald
  },
  videoButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900"
  },
  videoFrame: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
    borderRadius: radii.md,
    backgroundColor: colors.ink
  },
  videoWebView: {
    flex: 1,
    backgroundColor: colors.ink
  },
  previewBox: {
    gap: 8,
    borderRadius: radii.md,
    padding: 13,
    backgroundColor: "rgba(215,179,90,0.13)",
    borderWidth: 1,
    borderColor: "rgba(215,179,90,0.34)"
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  previewLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  previewText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700"
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  sourceButton: {
    minHeight: 42,
    alignSelf: "flex-start",
    borderRadius: radii.round,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.emeraldSoft
  },
  sourceButtonText: {
    color: colors.emerald,
    fontWeight: "900"
  }
});
