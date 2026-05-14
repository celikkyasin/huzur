import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors, radii, typography } from "@/theme";
import type { IconName } from "@/types";

type MenuItem = {
  title: string;
  subtitle: string;
  icon: IconName;
  route?: string;
  badge?: string;
};

const menuItems: MenuItem[] = [
  { title: "Namaz Devamlılığı", subtitle: "Gün gün 5 vakit namaz takibi", icon: "calendar", route: "/prayer-continuity", badge: "Yeni" },
  { title: "Kaza Namazı Takibi", subtitle: "Kalan kaza namazlarını düzenli azalt", icon: "repeat", route: "/qada-prayers", badge: "Yeni" },
  { title: "Puan Tablosu ve Ödüller", subtitle: "Sıralama, ödüller ve başvuru alanı", icon: "trophy", route: "/settings" },
  { title: "Ayarlar", subtitle: "Bildirimler, profil ve uygulama tercihleri", icon: "settings", route: "/settings" },
  { title: "Allah'ın 99 İsmi", subtitle: "Görsel kartlar ve sesli okuma hazırlanıyor", icon: "sparkles" },
  { title: "Cuma Hutbeleri", subtitle: "Her cuma hutbesi uzaktan eklenecek", icon: "document-text" }
];

export default function MoreScreen() {
  return (
    <ScreenContainer>
      <AppHeader />
      <Text style={styles.title}>Daha Fazla</Text>
      <Text style={styles.subtitle}>Takip, ayarlar ve ödül alanlarını buradan yönet.</Text>
      {menuItems.map((item) => (
        <Pressable
          key={item.title}
          accessibilityRole="button"
          onPress={() => {
            if (item.route) {
              router.push(item.route as never);
              return;
            }

            Alert.alert("Hazırlanıyor", `${item.title} bölümü sıradaki geliştirme aşamasında eklenecek.`);
          }}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Card style={styles.item}>
            <View style={styles.icon}>
              <Ionicons name={item.icon} size={23} color={colors.emerald} />
            </View>
            <View style={styles.textWrap}>
              <View style={styles.titleRow}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                ) : null}
              </View>
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap"
  },
  itemTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 16
  },
  itemSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17
  },
  badge: {
    height: 22,
    borderRadius: radii.round,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.goldSoft
  },
  badgeText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.72
  }
});
