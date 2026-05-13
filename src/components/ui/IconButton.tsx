import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii } from "@/theme";
import type { IconName } from "@/types";

type IconButtonProps = {
  icon: IconName;
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function IconButton({ icon, label, selected, onPress }: IconButtonProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.button, selected && styles.selected]}>
      <Ionicons name={icon} size={23} color={selected ? colors.white : colors.emerald} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldSoft
  },
  selected: {
    backgroundColor: colors.emerald
  }
});
