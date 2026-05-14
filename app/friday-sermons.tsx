import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { fridayKhutbahs } from "@/data/fridayKhutbahs";
import { colors, radii, typography } from "@/theme";

export default function FridaySermonsScreen() {
  const latest = fridayKhutbahs[0];

  return (
    <ScreenContainer>
      <AppHeader title="Cuma Hutbeleri" />
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.eyebrow}>Bu haftanın hutbesi</Text>
          <Text style={styles.title}>{latest.title}</Text>
          <Text style={styles.subtitle}>{latest.date}</Text>
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="document-text" size={30} color={colors.gold} />
        </View>
      </View>

      <ScrollView scrollEnabled={false} contentContainerStyle={styles.list}>
        {fridayKhutbahs.map((khutbah, index) => (
          <Card key={khutbah.id} style={[styles.card, index === 0 && styles.latestCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>{khutbah.date}</Text>
              </View>
              {index === 0 ? (
                <View style={styles.latestBadge}>
                  <Text style={styles.latestBadgeText}>Güncel</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.cardTitle}>{khutbah.title}</Text>
            <Text style={styles.summary}>{khutbah.summary}</Text>
            <View style={styles.content}>
              {khutbah.content.map((paragraph) => (
                <Text key={paragraph} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>
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
  list: {
    gap: 14,
    paddingTop: 18,
    paddingBottom: 18
  },
  card: {
    gap: 10
  },
  latestCard: {
    borderColor: "rgba(215,179,90,0.7)"
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
  content: {
    gap: 9,
    paddingTop: 4
  },
  paragraph: {
    color: colors.muted,
    lineHeight: 22
  }
});
