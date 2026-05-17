import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors, radii, typography } from "@/theme";

const religiousDays = [
  { month: "Ocak", items: [{ date: "15 Ocak 2026", title: "Regaib Kandili" }, { date: "25 Ocak 2026", title: "Miraç Kandili" }] },
  { month: "Şubat", items: [{ date: "2 Şubat 2026", title: "Berat Kandili" }, { date: "18 Şubat 2026", title: "Ramazan Başlangıcı" }] },
  { month: "Mart", items: [{ date: "19 Mart 2026", title: "Arefe" }, { date: "20-22 Mart 2026", title: "Ramazan Bayramı" }] },
  { month: "Mayıs", items: [{ date: "26 Mayıs 2026", title: "Arefe" }, { date: "27-30 Mayıs 2026", title: "Kurban Bayramı" }] },
  { month: "Haziran", items: [{ date: "16 Haziran 2026", title: "Hicri Yılbaşı" }, { date: "25 Haziran 2026", title: "Aşure Günü" }] },
  { month: "Ağustos", items: [{ date: "25 Ağustos 2026", title: "Mevlid Kandili" }] }
];

export default function ReligiousDaysScreen() {
  return (
    <ScreenContainer>
      <AppHeader title="Dini Günler" />
      <Card variant="emerald" style={styles.hero}>
        <Text style={styles.heroLabel}>2026 TAKVİMİ</Text>
        <Text style={styles.heroTitle}>Dini günler ve kandiller</Text>
        <Text style={styles.heroText}>Takvim Diyanet dini günler bilgileri esas alınarak hazırlanmıştır. Yıl değişiminde liste uzaktan güncellenecek yapıya taşınabilir.</Text>
      </Card>

      {religiousDays.map((group) => (
        <View key={group.month} style={styles.monthGroup}>
          <Text style={styles.monthTitle}>{group.month}</Text>
          {group.items.map((item) => (
            <Card key={`${item.date}-${item.title}`} style={styles.dayCard}>
              <View style={styles.dateBadge}>
                <Ionicons name="calendar-number" size={20} color={colors.emerald} />
              </View>
              <View style={styles.dayTextWrap}>
                <Text style={styles.dayTitle}>{item.title}</Text>
                <Text style={styles.dayDate}>{item.date}</Text>
              </View>
            </Card>
          ))}
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 16, marginBottom: 18 },
  heroLabel: { color: colors.gold, fontSize: 12, fontWeight: "900" },
  heroTitle: { color: colors.white, fontFamily: typography.title, fontSize: 28, lineHeight: 34, fontWeight: "900", marginTop: 8 },
  heroText: { color: "rgba(255,255,255,0.78)", marginTop: 10, lineHeight: 21, fontWeight: "700" },
  monthGroup: { marginBottom: 18 },
  monthTitle: { color: colors.emerald, fontFamily: typography.title, fontSize: 28, fontWeight: "900", marginBottom: 10 },
  dayCard: { marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 },
  dateBadge: { width: 48, height: 48, borderRadius: radii.round, backgroundColor: colors.emeraldSoft, alignItems: "center", justifyContent: "center" },
  dayTextWrap: { flex: 1, minWidth: 0 },
  dayTitle: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  dayDate: { color: colors.muted, marginTop: 4, fontWeight: "800" }
});
