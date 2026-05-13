import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { colors, radii, shadows } from "@/theme";
import type { IconName } from "@/types";

type QuickActionCardProps = {
  title: string;
  icon: IconName;
  onPress?: () => void;
};

export function QuickActionCard({ title, icon, onPress }: QuickActionCardProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.96);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={styles.card}
      >
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={24} color={colors.emerald} />
        </View>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.title}>
          {title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: "30%"
  },
  card: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.card
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldSoft
  },
  title: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 4
  }
});
