import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, radii } from "@/theme";
import type { IconName } from "@/types";

type PrimaryButtonProps = {
  label: string;
  icon?: IconName;
  tone?: "emerald" | "gold" | "light";
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function PrimaryButton({ label, icon, tone = "emerald", style, onPress }: PrimaryButtonProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[styles.button, styles[tone]]}
      >
        {icon ? <Ionicons name={icon} size={18} color={tone === "light" ? colors.emerald : colors.white} /> : null}
        <Text style={[styles.label, tone === "light" && styles.lightLabel]}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18
  },
  emerald: {
    backgroundColor: colors.emerald
  },
  gold: {
    backgroundColor: colors.gold
  },
  light: {
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: colors.sage
  },
  label: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 14
  },
  lightLabel: {
    color: colors.emerald
  }
});
