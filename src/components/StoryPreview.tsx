import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { StoryTemplate } from "@/types";
import { colors, radii, shadows, typography } from "@/theme";

type StoryPreviewProps = {
  template: StoryTemplate;
  message: string;
};

export function StoryPreview({ template, message }: StoryPreviewProps) {
  return (
    <View style={styles.frame}>
      <LinearGradient colors={[template.background, "#0F1F1A"]} style={styles.story}>
        <View style={[styles.patternLarge, { borderColor: template.accent }]} />
        <View style={[styles.patternSmall, { borderColor: template.accent }]} />
        <Text style={[styles.kicker, { color: template.accent }]}>Hayırlı Cumalar</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={[styles.divider, { backgroundColor: template.accent }]} />
        <Text style={styles.brand}>Huzur</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: "center",
    width: "72%",
    aspectRatio: 9 / 16,
    borderRadius: radii.xl,
    padding: 8,
    backgroundColor: colors.paper,
    ...shadows.soft
  },
  story: {
    flex: 1,
    borderRadius: radii.lg,
    padding: 22,
    justifyContent: "center",
    overflow: "hidden"
  },
  patternLarge: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    borderWidth: 1,
    opacity: 0.2,
    top: 34,
    alignSelf: "center"
  },
  patternSmall: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    opacity: 0.26,
    bottom: 50,
    right: 28
  },
  kicker: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  message: {
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 28,
    lineHeight: 36,
    textAlign: "center",
    fontWeight: "900",
    marginTop: 18
  },
  divider: {
    width: 58,
    height: 3,
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 24
  },
  brand: {
    color: "rgba(255,255,255,0.72)",
    fontFamily: typography.title,
    textAlign: "center",
    fontSize: 16,
    marginTop: 14,
    fontWeight: "900"
  }
});
