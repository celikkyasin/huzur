import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "@/theme";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showBell?: boolean;
};

export function AppHeader({ title = "Huzur", subtitle }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center"
  },
  textWrap: {
    alignItems: "center",
    paddingHorizontal: 8
  },
  title: {
    fontFamily: typography.title,
    color: colors.emerald,
    fontSize: 22,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  }
});
