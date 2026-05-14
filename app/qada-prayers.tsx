import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { trackedPrayers } from "@/store/prayerTrackerStore";
import { useQadaPrayerStore } from "@/store/qadaPrayerStore";
import { colors, radii, typography } from "@/theme";

export default function QadaPrayersScreen() {
  const counts = useQadaPrayerStore((state) => state.counts);
  const hydrateQadaPrayers = useQadaPrayerStore((state) => state.hydrateQadaPrayers);
  const changeCount = useQadaPrayerStore((state) => state.changeCount);
  const total = trackedPrayers.reduce((sum, prayer) => sum + counts[prayer.id], 0);

  useEffect(() => {
    void hydrateQadaPrayers();
  }, [hydrateQadaPrayers]);

  return (
    <ScreenContainer>
      <AppHeader title="Kaza Namazı Takibi" />
      <Card variant="emerald" style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Toplam kalan kaza</Text>
        <Text style={styles.summaryValue}>{total}</Text>
        <Text style={styles.summaryText}>Önce kalan borcunu ekle. Kaza namazı kıldığında "Kaza kıldım" ile kalan sayı azalır.</Text>
      </Card>

      <View style={styles.list}>
        {trackedPrayers.map((prayer) => (
          <Card key={prayer.id} style={styles.item}>
            <View style={styles.left}>
              <View style={styles.icon}>
                <Ionicons name={prayer.icon} size={22} color={colors.emerald} />
              </View>
              <View>
                <Text style={styles.title}>{prayer.name}</Text>
                <Text style={styles.subtitle}>{counts[prayer.id]} kaza kaldı</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={() => void changeCount(prayer.id, -1)} style={[styles.actionButton, styles.doneButton]}>
                <Ionicons name="checkmark-circle" size={16} color={colors.emerald} />
                <Text style={styles.actionText}>Kaza kıldım</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => void changeCount(prayer.id, 1)} style={styles.actionButton}>
                <Ionicons name="add-circle" size={16} color={colors.emerald} />
                <Text style={styles.actionText}>Borç ekle</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginTop: 16
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.7)",
    fontWeight: "800"
  },
  summaryValue: {
    color: colors.white,
    marginTop: 4,
    fontSize: 44,
    lineHeight: 50,
    fontFamily: typography.title,
    fontWeight: "900"
  },
  summaryText: {
    color: "rgba(255,255,255,0.76)",
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "700"
  },
  list: {
    gap: 12,
    marginTop: 18,
    paddingBottom: 18
  },
  item: {
    minHeight: 112,
    gap: 14
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 16
  },
  subtitle: {
    color: colors.muted,
    marginTop: 3,
    fontSize: 12,
    fontWeight: "800"
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  actionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: radii.md,
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.12)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10
  },
  doneButton: {
    backgroundColor: colors.goldSoft,
    borderColor: "rgba(215,179,90,0.34)"
  },
  actionText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  }
});
