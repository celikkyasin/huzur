import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, type ScrollViewProps, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme";

type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  scrollProps?: Omit<ScrollViewProps, "contentContainerStyle" | "showsVerticalScrollIndicator">;
}>;

export function ScreenContainer({ children, scroll = true, contentStyle, scrollProps }: ScreenContainerProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, contentStyle]} {...scrollProps}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120
  }
});
