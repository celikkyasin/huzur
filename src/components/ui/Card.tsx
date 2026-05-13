import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radii, shadows } from "@/theme";

type CardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  variant?: "paper" | "soft" | "emerald";
}>;

export function Card({ children, style, variant = "paper" }: CardProps) {
  return <View style={[styles.base, styles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(7, 94, 71, 0.07)",
    ...shadows.card
  },
  paper: {
    backgroundColor: colors.paper
  },
  soft: {
    backgroundColor: colors.emeraldSoft
  },
  emerald: {
    backgroundColor: colors.emerald,
    borderColor: "rgba(255,255,255,0.16)"
  }
});
