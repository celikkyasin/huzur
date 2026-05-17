import { Pressable, StyleSheet, Text, View } from "react-native";
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
  route: string;
  badge?: string;
};

const menuItems: MenuItem[] = [
  { title: "Namaz Devamlılığı", subtitle: "Gün gün 5 vakit namaz takibi", icon: "calendar", route: "/prayer-continuity", badge: "Yeni" },
  { title: "Kaza Namazı Takibi", subtitle: "Kalan kaza namazlarını düzenli azalt", icon: "repeat", route: "/qada-prayers", badge: "Yeni" },
  { title: "Hatim Oku", subtitle: "30 cüz üzerinden Kur'an oku ve ilerlemeni takip et", icon: "book", route: "/khatm-tracker", badge: "Yeni" },
  { title: "Allah'ın 99 İsmi", subtitle: "Görsel kartlar ve anlamları", icon: "sparkles", route: "/names-of-allah", badge: "Yeni" },
  { title: "Cuma Hutbeleri", subtitle: "Haftalık hutbeleri oku", icon: "document-text", route: "/friday-sermons", badge: "Yeni" },
  { title: "Zekat Hesapla", subtitle: "Zekat ve fitre hesabı", icon: "calculator", route: "/zakat-calculator", badge: "Yeni" },
  { title: "Dini Günler", subtitle: "2026 Diyanet dini günler takvimi", icon: "calendar-number", route: "/religious-days", badge: "Yeni" },
  { title: "Kur'an Radyo", subtitle: "Diyanet Kur'an Radyo canlı dinle", icon: "radio", route: "/quran-radio", badge: "Yeni" },
  { title: "Kabe Canlı", subtitle: "Kabe'den canlı yayın", icon: "videocam", route: "/kaaba-live", badge: "Yeni" },
  { title: "Dua İste", subtitle: "Dua talebi oluştur ve takip et", icon: "heart", route: "/dua-requests", badge: "Yeni" },
  { title: "Puan Tablosu ve Ödüller", subtitle: "Sıralama, ödüller ve başvuru alanı", icon: "trophy", route: "/rewards" },
  { title: "Ayarlar", subtitle: "Bildirimler, profil ve uygulama tercihleri", icon: "settings", route: "/settings" }
];

export default function MoreScreen() {
  return (
    <ScreenContainer>
      <AppHeader />
      <Text style={styles.title}>Daha Fazla</Text>
      <Text style={styles.subtitle}>Takip, ayarlar ve ödül alanlarını buradan yönet.</Text>
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
            <View style={styles.badgeSlot}>
              {item.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              ) : null}
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
    flex: 1,
    minWidth: 0
  },
  itemTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 16,
    lineHeight: 21
  },
  itemSubtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
    lineHeight: 17
  },
  badgeSlot: {
    width: 58,
    alignItems: "flex-end"
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
