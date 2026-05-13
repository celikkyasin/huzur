import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii, shadows } from "@/theme";
import { IconButton } from "@/components/ui/IconButton";

type QuranMiniPlayerProps = {
  title?: string;
  subtitle?: string;
};

export function QuranMiniPlayer({ title = "Fatiha Suresi", subtitle = "Ayet 3" }: QuranMiniPlayerProps) {
  return (
    <View style={styles.player}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.progressWrap}>
        <View style={styles.progress} />
      </View>
      <IconButton icon="play" label="Oynat" selected />
      <Ionicons name="play-skip-forward" size={20} color={colors.emerald} />
    </View>
  );
}

const styles = StyleSheet.create({
  player: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 92,
    minHeight: 70,
    borderRadius: radii.lg,
    backgroundColor: colors.emerald,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    ...shadows.soft
  },
  textWrap: {
    flex: 1
  },
  title: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900"
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    marginTop: 2
  },
  progressWrap: {
    position: "absolute",
    left: 16,
    right: 88,
    bottom: 12,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 2
  },
  progress: {
    width: "46%",
    height: 3,
    backgroundColor: colors.gold,
    borderRadius: 2
  }
});
