import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows, typography } from "@/theme";
import type { PrayerTime } from "@/types";
import { getDynamicPrayerState } from "@/utils/prayerTimes";

const heroBackground = require("../../assets/home/prayer-hero-bg.png");

type WeatherIcon = "sunny" | "partly-sunny" | "cloudy" | "rainy" | "snow" | "thunderstorm";

type PrayerTimeCardProps = {
  locationLabel: string;
  prayerTimes: PrayerTime[];
  isLocating?: boolean;
  isLoadingTimes?: boolean;
  sourceLabel?: string;
  weatherLabel?: string;
  weatherIcon?: WeatherIcon;
};

export function PrayerTimeCard({ locationLabel, prayerTimes, isLocating, isLoadingTimes, sourceLabel, weatherLabel, weatherIcon = "partly-sunny" }: PrayerTimeCardProps) {
  const prayerState = getDynamicPrayerState(prayerTimes);
  const statusText = isLoadingTimes ? "Vakitler güncelleniyor" : `${prayerState.next.time} vaktine kadar`;

  return (
    <ImageBackground source={heroBackground} style={styles.card} imageStyle={styles.cardImage} resizeMode="cover">
      <LinearGradient colors={["rgba(3,47,36,0.02)", "rgba(3,47,36,0.12)", "rgba(3,47,36,0.32)"]} style={styles.overlay}>
        <View style={styles.topRow}>
          <View style={styles.locationChip}>
            <Ionicons name="location" size={15} color={colors.goldSoft} />
            <Text style={styles.locationText} numberOfLines={1}>
              {isLocating ? "Konum alınıyor" : locationLabel}
            </Text>
          </View>
          {weatherLabel ? (
            <View style={styles.weatherChip}>
              <Ionicons name={weatherIcon} size={14} color={colors.goldSoft} />
              <Text style={styles.weatherText} numberOfLines={1}>
                {weatherLabel}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.heroBody}>
          <Text style={styles.kicker}>Sıradaki Vakit</Text>
          <Text style={styles.prayerName}>{prayerState.next.name}</Text>
          <Text style={styles.countdown}>{prayerState.countdown}</Text>
          <View style={styles.goldLine} />
          <Text style={styles.countdownLabel}>{statusText}</Text>
        </View>

        <View style={styles.infoBar}>
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={15} color={colors.goldSoft} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Bugün</Text>
              <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
                {prayerState.displayDate} • {prayerState.hijriDate}
              </Text>
            </View>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <View style={styles.infoIcon}>
              <Ionicons name="book" size={15} color={colors.goldSoft} />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoLabel}>Kaynak</Text>
              <Text style={styles.infoValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>
                {sourceLabel ?? "Yerel vakit"}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 168,
    borderRadius: 24,
    marginTop: 2,
    overflow: "hidden",
    backgroundColor: colors.emeraldDark,
    ...shadows.soft
  },
  cardImage: {
    borderRadius: 24
  },
  overlay: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between"
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  locationChip: {
    flex: 1,
    minHeight: 30,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12
  },
  locationText: {
    color: colors.white,
    flex: 1,
    fontSize: 11,
    fontWeight: "900"
  },
  weatherChip: {
    minWidth: 78,
    maxWidth: 104,
    minHeight: 30,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 10
  },
  weatherText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "900"
  },
  heroBody: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 2
  },
  kicker: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign: "center"
  },
  prayerName: {
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 2,
    textAlign: "center"
  },
  countdown: {
    color: colors.goldSoft,
    fontFamily: typography.title,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 0,
    textAlign: "center"
  },
  goldLine: {
    width: 96,
    height: 2,
    borderRadius: 2,
    backgroundColor: "rgba(255,241,191,0.34)",
    marginTop: 3,
    marginBottom: 3
  },
  countdownLabel: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center"
  },
  infoBar: {
    minHeight: 38,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,253,248,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  infoIcon: {
    width: 20,
    height: 20,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,241,191,0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  infoTextWrap: {
    flex: 1,
    minWidth: 0
  },
  infoDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginHorizontal: 6
  },
  infoLabel: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  infoValue: {
    color: colors.white,
    marginTop: 2,
    fontSize: 9,
    fontWeight: "900"
  }
});
