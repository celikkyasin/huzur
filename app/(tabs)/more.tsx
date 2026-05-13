import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors, radii, typography } from "@/theme";
import type { IconName } from "@/types";

const menuItems: Array<{ title: string; subtitle: string; icon: IconName; route: string }> = [
  { title: "Namaz", subtitle: "Kılınış, rekatlar ve okunacak dualar", icon: "accessibility", route: "/namaz" },
  { title: "Namaz Vakitleri", subtitle: "Günlük vakitler ve bildirimler", icon: "time", route: "/prayer-times" },
  { title: "Zikirmatik", subtitle: "Günlük zikir hedefinizi takip edin", icon: "finger-print", route: "/dhikr" },
  { title: "Yakındaki Camiler", subtitle: "Size yakın ibadethaneler", icon: "business", route: "/mosques" },
  { title: "Cuma Mesajları", subtitle: "Paylaşıma hazır zarif kartlar", icon: "sparkles", route: "/friday-messages" },
  { title: "Ayarlar", subtitle: "Tercihler ve bildirimler", icon: "settings", route: "/settings" }
];

export default function MoreScreen() {
  return (
    <ScreenContainer>
      <AppHeader />
      <Text style={styles.title}>Daha Fazla</Text>
      <Text style={styles.subtitle}>Huzur deneyiminizi zenginleştiren araçlar.</Text>
      {menuItems.map((item) => (
        <Pressable key={item.title} accessibilityRole="button" onPress={() => router.push(item.route as never)} style={({ pressed }) => pressed && styles.pressed}>
          <Card style={styles.item}>
            <View style={styles.icon}>
              <Ionicons name={item.icon} size={23} color={colors.emerald} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.muted} />
          </Card>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.title,
    color: colors.emerald,
    fontSize: 34,
    fontWeight: "900",
    marginTop: 20
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4,
    marginBottom: 20
  },
  item: {
    minHeight: 82,
    marginBottom: 12,
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
  textWrap: {
    flex: 1
  },
  itemTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 16
  },
  itemSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  pressed: {
    opacity: 0.72
  }
});
