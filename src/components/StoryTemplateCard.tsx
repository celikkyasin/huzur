import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { StoryTemplate } from "@/types";
import { colors, radii, shadows, typography } from "@/theme";

type StoryTemplateCardProps = {
  template: StoryTemplate;
  selected?: boolean;
  onPress?: () => void;
};

export function StoryTemplateCard({ template, selected, onPress }: StoryTemplateCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.wrap, selected && styles.selected]}>
      <LinearGradient colors={[template.background, "#10201B"]} style={styles.preview}>
        <View style={[styles.ring, { borderColor: template.accent }]} />
        <Text style={[styles.previewText, { color: template.accent }]}>{template.message}</Text>
      </LinearGradient>
      <View style={styles.info}>
        <Text style={styles.title}>{template.title}</Text>
        <Text style={styles.size}>{template.size}</Text>
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={22} color={colors.emerald} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 160,
    borderRadius: radii.lg,
    padding: 10,
    backgroundColor: colors.paper,
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card
  },
  selected: {
    borderColor: colors.gold,
    borderWidth: 2
  },
  preview: {
    height: 190,
    borderRadius: radii.md,
    padding: 14,
    justifyContent: "center",
    overflow: "hidden"
  },
  ring: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    opacity: 0.24,
    top: 20,
    alignSelf: "center"
  },
  previewText: {
    fontFamily: typography.title,
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "900"
  },
  info: {
    marginTop: 10
  },
  title: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  size: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  }
});
