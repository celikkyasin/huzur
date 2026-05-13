import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from "react-native-reanimated";
import { dhikrOptions, useDhikrStore } from "@/store/dhikrStore";
import { useRewardStore } from "@/store/rewardStore";
import { colors, radii, shadows, typography } from "@/theme";

export function DhikrCounter() {
  const { count, target, increment, selectedDhikrId, soundEnabled, vibrationEnabled } = useDhikrStore();
  const awardReward = useRewardStore((state) => state.awardReward);
  const selectedDhikr = dhikrOptions.find((item) => item.id === selectedDhikrId) ?? dhikrOptions[0];
  const player = useAudioPlayer(null, { keepAudioSessionActive: false, updateInterval: 250 });
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const playRecordedDhikr = () => {
    if (!selectedDhikr.audioAsset) {
      Alert.alert("Ses kaydı hazırlanıyor", "Bu zikir için lisanslı hoca kaydı eklendiğinde burada çalacak.");
      return;
    }

    player.pause();
    player.replace({ assetId: selectedDhikr.audioAsset, name: selectedDhikr.label });
    player.play();
  };

  const handlePress = () => {
    scale.value = withSequence(withSpring(0.94), withSpring(1));
    const nextCount = Math.min(count + 1, target);
    increment();

    if (vibrationEnabled) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (soundEnabled) {
      playRecordedDhikr();
    }

    if (target === 99 && (nextCount === 33 || nextCount === 66)) {
      void awardReward({
        action: "dhikr33",
        title: `${nextCount} zikir tamamlandı`,
        description: `${selectedDhikr.label} zikri`,
        points: 3
      });
    }

    if (target === 99 && nextCount === 99) {
      void awardReward({
        action: "dhikr99",
        title: "99 zikir tamamlandı",
        description: `${selectedDhikr.label} zikri`,
        points: 4
      });
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.number}>{count}</Text>
      <Text style={styles.target}>/ {target}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progress, { width: `${Math.min((count / target) * 100, 100)}%` }]} />
      </View>
      <Animated.View style={animatedStyle}>
        <Pressable onPress={handlePress} style={styles.button} accessibilityRole="button" accessibilityLabel="Zikri say">
          <Ionicons name="finger-print" size={58} color="rgba(255,255,255,0.46)" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    marginTop: 18
  },
  number: {
    fontFamily: typography.title,
    color: colors.emerald,
    fontSize: 72,
    fontWeight: "900"
  },
  target: {
    color: colors.muted,
    fontSize: 18,
    fontWeight: "800",
    marginTop: -8
  },
  progressTrack: {
    width: "58%",
    height: 6,
    borderRadius: radii.round,
    backgroundColor: colors.sage,
    marginTop: 18,
    overflow: "hidden"
  },
  progress: {
    height: 6,
    borderRadius: radii.round,
    backgroundColor: colors.gold
  },
  button: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.emerald,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 34,
    borderWidth: 10,
    borderColor: colors.emeraldDark,
    ...shadows.soft
  }
});
