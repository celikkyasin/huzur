import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, typography } from "@/theme";
import { IconButton } from "@/components/ui/IconButton";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
  showBell?: boolean;
};

export function AppHeader({ title = "Huzur", subtitle, showBell = true }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.brandMark}>
        <Ionicons name="business" size={18} color={colors.emerald} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {showBell ? <IconButton icon="notifications" label="Bildirimler" /> : <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  textWrap: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 10
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
  },
  spacer: {
    width: 50
  }
});
