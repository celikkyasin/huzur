import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "@/theme";

type SectionTitleProps = {
  title: string;
  action?: string;
  onActionPress?: () => void;
};

export function SectionTitle({ title, action, onActionPress }: SectionTitleProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? (
        <Pressable onPress={onActionPress} disabled={!onActionPress} accessibilityRole={onActionPress ? "button" : undefined} hitSlop={10}>
          <Text style={styles.action}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  title: {
    fontFamily: typography.title,
    fontSize: 17,
    color: colors.ink,
    fontWeight: "800"
  },
  action: {
    color: colors.emerald,
    fontSize: 13,
    fontWeight: "700"
  }
});
