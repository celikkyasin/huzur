import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { SettingsItem } from "@/types";
import { colors, radii } from "@/theme";

type SettingsRowProps = {
  item: SettingsItem;
  onPress?: () => void;
  value?: string;
  rightElement?: ReactNode;
  isLast?: boolean;
  showChevron?: boolean;
};

export function SettingsRow({ item, onPress, value, rightElement, isLast, showChevron = true }: SettingsRowProps) {
  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.pressable, isLast && styles.lastRow, pressed && styles.pressed]}>
      <View style={styles.rowContent}>
        <View style={styles.icon}>
          <Ionicons name={item.icon} size={21} color={colors.emerald} />
        </View>
        <View style={styles.textWrap}>
          <Text numberOfLines={2} style={styles.title}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text numberOfLines={2} style={styles.subtitle}>
              {item.subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.rightArea}>
          {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
          {!rightElement && (value || item.value) ? (
            <View style={styles.valuePill}>
              <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.value}>
                {value || item.value}
              </Text>
            </View>
          ) : null}
          {showChevron ? <Ionicons name="chevron-forward" size={20} color={colors.muted} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(7,94,71,0.07)"
  },
  rowContent: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12
  },
  lastRow: {
    borderBottomWidth: 0
  },
  pressed: {
    opacity: 0.72
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldSoft,
    borderWidth: 1,
    borderColor: "rgba(7,94,71,0.08)"
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4
  },
  title: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 15,
    lineHeight: 20
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3
  },
  valuePill: {
    minWidth: 82,
    maxWidth: 118,
    minHeight: 36,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  rightArea: {
    minWidth: 40,
    maxWidth: 126,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6,
    flexShrink: 0
  },
  rightElement: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  value: {
    color: colors.emerald,
    fontWeight: "800",
    fontSize: 12
  }
});
