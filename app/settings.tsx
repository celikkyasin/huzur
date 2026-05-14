import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { AppHeader } from "@/components/AppHeader";
import { SettingsRow } from "@/components/SettingsRow";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getPrayerNotificationsEnabled, setPrayerNotificationsEnabled } from "@/services/prayerNotifications";
import { usePrayerTimesStore } from "@/store/prayerTimesStore";
import { colors, radii, shadows, typography } from "@/theme";
import type { SettingsItem } from "@/types";

const THEME_STORAGE_KEY = "huzur.settings.theme";
const LANGUAGE_STORAGE_KEY = "huzur.settings.language";
const APP_VERSION = "1.0.34";

type ThemeMode = "Aydınlık" | "Koyu";
type LanguageMode = "Türkçe" | "English";

const preferenceItems: SettingsItem[] = [
  { id: "prayer", title: "Namaz Vakti Bildirimleri", subtitle: "Ezan sesi ve vakit hatırlatmaları", icon: "notifications" },
  { id: "theme", title: "Tema", subtitle: "Görünüm tercihi", icon: "color-palette" }
];

const supportItems: SettingsItem[] = [
  { id: "about", title: "Uygulama Hakkında", subtitle: `Sürüm ${APP_VERSION}`, icon: "information-circle" },
  { id: "contact", title: "İletişim", subtitle: "Destek ve geri bildirim", icon: "mail" }
];

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>("Aydınlık");
  const [languageMode, setLanguageMode] = useState<LanguageMode>("Türkçe");
  const prayerTimes = usePrayerTimesStore((state) => state.times);

  useEffect(() => {
    getPrayerNotificationsEnabled().then(setNotificationsEnabled);
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((value) => {
      if (value === "Aydınlık" || value === "Koyu") {
        setThemeMode(value);
      }
    });
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((value) => {
      if (value === "Türkçe" || value === "English") {
        setLanguageMode(value);
      }
    });
  }, []);

  const showProfileActions = () => {
    Alert.alert("Profil", "Profil ayarları hesap sistemiyle birlikte açılacak. Bu kart konum yenileme veya izin işlemi başlatmaz.", [{ text: "Tamam" }]);
  };

  const toggleNotifications = async (nextValue = !notificationsEnabled) => {
    if (isUpdatingNotifications) {
      return;
    }

    setIsUpdatingNotifications(true);

    try {
      const result = await setPrayerNotificationsEnabled(nextValue, prayerTimes);
      setNotificationsEnabled(result.enabled);

      if (!result.permissionGranted) {
        Alert.alert("Bildirim izni gerekli", "Vakit hatırlatmaları için bildirim izni vermeniz gerekir.");
      } else {
        Alert.alert(result.enabled ? "Bildirimler açıldı" : "Bildirimler kapatıldı", result.enabled ? "Namaz vakti hatırlatmaları hazır." : "Namaz vakti hatırlatmaları kapatıldı.");
      }
    } catch {
      Alert.alert("Bildirim ayarlanamadı", "Şu anda bildirim tercihi kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  const setLanguage = async (language: LanguageMode) => {
    setLanguageMode(language);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    Alert.alert("Dil güncellendi", language === "English" ? "English selected. Full app translation will be completed with the language system update." : "Uygulama dili Türkçe olarak ayarlandı.");
  };

  const toggleTheme = async () => {
    const nextTheme: ThemeMode = themeMode === "Aydınlık" ? "Koyu" : "Aydınlık";
    setThemeMode(nextTheme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    Alert.alert("Tema güncellendi", `${nextTheme} tema tercihiniz kaydedildi.`);
  };

  const showAbout = () => {
    Alert.alert("Huzur Hakkında", `Huzur; namaz vakitleri, Kur'an-ı Kerim, dualar, zikir ve günlük manevi alışkanlıklar için hazırlanmış sakin bir İslami yaşam uygulamasıdır.\n\nSürüm: ${APP_VERSION}`);
  };

  const openContact = async () => {
    const url = "mailto:destek@huzur.app?subject=Huzur%20Destek";
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      return;
    }

    Alert.alert("İletişim", "Bize destek@huzur.app adresinden ulaşabilirsiniz.");
  };

  const showPremium = () => {
    Alert.alert("Huzur Premium", "Premium özellikler yakında açılacak: özel temalar, gelişmiş hatırlatıcılar ve reklamsız sakin deneyim.");
  };

  const handleSettingPress = (id: string) => {
    if (id === "prayer") {
      void toggleNotifications();
      return;
    }
    if (id === "theme") {
      void toggleTheme();
      return;
    }
    if (id === "about") {
      showAbout();
      return;
    }
    if (id === "contact") {
      void openContact();
    }
  };

  const NotificationSwitch = () => (
    <Switch
      value={notificationsEnabled}
      disabled={isUpdatingNotifications}
      onValueChange={(value) => void toggleNotifications(value)}
      trackColor={{ false: colors.line, true: colors.emerald }}
      thumbColor={colors.white}
      ios_backgroundColor={colors.line}
    />
  );

  const ThemeBadge = () => (
    <View style={styles.compactBadge}>
      <Ionicons name={themeMode === "Aydınlık" ? "sunny" : "moon"} size={15} color={colors.emerald} />
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82} style={styles.compactBadgeText}>
        {themeMode}
      </Text>
    </View>
  );

  return (
    <ScreenContainer contentStyle={styles.screen}>
      <AppHeader title="Ayarlar" />

      <LinearGradient colors={["#FFFDF8", "#EEF6F0"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroPanel}>
        <View style={styles.heroIcon}>
          <Ionicons name="settings" size={24} color={colors.emerald} />
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.title}>Ayarlar</Text>
          <Text style={styles.subtitle}>Bildirim, dil, görünüm ve destek tercihlerinizi düzenleyin.</Text>
        </View>
      </LinearGradient>

      <SectionTitle title="Hesap" />
      <Pressable accessibilityRole="button" onPress={showProfileActions} style={({ pressed }) => [styles.profilePressable, pressed && styles.pressed]}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={colors.emerald} />
          </View>
          <View style={styles.profileText}>
            <Text numberOfLines={1} style={styles.profileTitle}>
              Misafir kullanım
            </Text>
            <Text numberOfLines={2} style={styles.profileSubtitle}>
              Profil ayarları hesap özelliğiyle birlikte açılacak.
            </Text>
          </View>
          <View style={styles.soonBadge}>
            <Text style={styles.soonBadgeText}>Yakında</Text>
          </View>
        </View>
      </Pressable>

      <SectionTitle title="Dil Seçimi" />
      <Card style={styles.languageCard}>
        <View style={styles.languageHeader}>
          <View style={styles.languageIcon}>
            <Ionicons name="globe" size={21} color={colors.emerald} />
          </View>
          <View style={styles.languageCopy}>
            <Text style={styles.languageTitle}>Uygulama dili</Text>
            <Text style={styles.languageSubtitle}>Dil tercihinizi buradan seçin.</Text>
          </View>
        </View>
        <View style={styles.segmentedControl}>
          {(["Türkçe", "English"] as LanguageMode[]).map((language) => {
            const selected = languageMode === language;
            return (
              <Pressable key={language} accessibilityRole="button" onPress={() => void setLanguage(language)} style={[styles.languageOption, selected && styles.languageOptionSelected]}>
                <Text style={[styles.languageOptionText, selected && styles.languageOptionTextSelected]}>{language}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <SectionTitle title="Tercihler" />
      <Card style={styles.rows}>
        <SettingsRow item={preferenceItems[0]} onPress={() => handleSettingPress("prayer")} showChevron={false} rightElement={<NotificationSwitch />} />
        <SettingsRow item={preferenceItems[1]} isLast onPress={() => handleSettingPress("theme")} showChevron={false} rightElement={<ThemeBadge />} />
      </Card>

      <SectionTitle title="Destek" />
      <Card style={styles.rows}>
        {supportItems.map((item, index) => (
          <SettingsRow key={item.id} item={item} isLast={index === supportItems.length - 1} onPress={() => handleSettingPress(item.id)} />
        ))}
      </Card>

      <Card variant="emerald" style={styles.premium}>
        <View style={styles.premiumTop}>
          <View style={styles.premiumIcon}>
            <Ionicons name="sparkles" size={22} color={colors.emerald} />
          </View>
          <Text style={styles.premiumTitle}>Huzur Premium</Text>
        </View>
        <Text style={styles.premiumSubtitle}>Özel temalar, gelişmiş hatırlatıcılar ve reklamsız sakin bir deneyim.</Text>
        <PrimaryButton label="Bilgi Al" icon="sparkles" tone="gold" style={styles.premiumButton} onPress={showPremium} />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 132
  },
  heroPanel: {
    marginTop: 16,
    marginBottom: 18,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.08)",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    ...shadows.card
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.1)",
    alignItems: "center",
    justifyContent: "center"
  },
  heroCopy: {
    flex: 1,
    minWidth: 0
  },
  title: {
    fontFamily: typography.title,
    color: colors.emerald,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    fontWeight: "700"
  },
  profilePressable: {
    borderRadius: radii.lg
  },
  profileCard: {
    minHeight: 98,
    borderRadius: radii.lg,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...shadows.card
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  profileText: {
    flex: 1,
    minWidth: 0
  },
  profileTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 16,
    lineHeight: 21
  },
  profileSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
    fontWeight: "700"
  },
  soonBadge: {
    minWidth: 70,
    height: 34,
    borderRadius: radii.round,
    backgroundColor: colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  soonBadgeText: {
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  },
  languageCard: {
    gap: 14
  },
  languageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  languageIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  languageCopy: {
    flex: 1,
    minWidth: 0
  },
  languageTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  languageSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
    fontWeight: "700"
  },
  segmentedControl: {
    minHeight: 50,
    borderRadius: radii.round,
    backgroundColor: colors.cream,
    flexDirection: "row",
    padding: 5,
    gap: 5
  },
  languageOption: {
    flex: 1,
    minHeight: 40,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  languageOptionSelected: {
    backgroundColor: colors.emerald
  },
  languageOptionText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  languageOptionTextSelected: {
    color: colors.white
  },
  rows: {
    paddingVertical: 2
  },
  premium: {
    marginTop: 18,
    gap: 12
  },
  premiumTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  premiumIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.round,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  premiumTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: "900",
    fontFamily: typography.title
  },
  premiumSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700"
  },
  premiumButton: {
    marginTop: 2
  },
  pressed: {
    opacity: 0.72
  },
  compactBadge: {
    maxWidth: 96,
    minWidth: 74,
    height: 34,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 10
  },
  compactBadgeText: {
    flexShrink: 1,
    color: colors.emerald,
    fontSize: 12,
    fontWeight: "900"
  }
});
