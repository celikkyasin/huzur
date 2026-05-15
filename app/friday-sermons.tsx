import { useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { fridayKhutbahMonths, latestFridayKhutbah } from "@/data/fridayKhutbahs";
import { colors, radii, typography } from "@/theme";

export default function FridaySermonsScreen() {
  const [openMonthKey, setOpenMonthKey] = useState(latestFridayKhutbah.monthKey);

  return (
    <ScreenContainer>
      <AppHeader title="Cuma Hutbeleri" />
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>Bu haftanın hutbesi</Text>
          <Text style={styles.title}>{latestFridayKhutbah.title}</Text>
          <Text style={styles.subtitle}>
            {latestFridayKhutbah.date} - {latestFridayKhutbah.sourceName}
          </Text>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="document-text" size={30} color={colors.gold} />
        </View>
      </View>

      <Card style={styles.sourceCard}>
        <Ionicons name="shield-checkmark" size={22} color={colors.emerald} />
        <Text style={styles.sourceText}>
          Hutbe başlıkları ve kaynak bağlantıları Diyanet Haber / Diyanet TV arşivine göre gösterilir. Tam resmi metin için kaynağı açabilirsin.
        </Text>
      </Card>

      <View style={styles.list}>
        {fridayKhutbahMonths.map((month) => {
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
                    const isLatest = khutbah.id === latestFridayKhutbah.id;

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
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`${khutbah.title} resmi kaynak sayfasını aç`}
                          onPress={() => Linking.openURL(khutbah.sourceUrl)}
                          style={styles.sourceButton}
                        >
                          <Ionicons name="open-outline" size={18} color={colors.emerald} />
                          <Text style={styles.sourceButtonText}>Resmi kaynağı aç</Text>
                        </Pressable>
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
    alignItems: "center",
    gap: 16
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
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.74)",
    fontWeight: "800"
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)"
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
