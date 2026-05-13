import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Mosque } from "@/types";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors, radii, typography } from "@/theme";

type MosqueCardProps = {
  mosque: Mosque;
  featured?: boolean;
  onDirections?: (mosque: Mosque) => void;
};

export function MosqueCard({ mosque, featured, onDirections }: MosqueCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.icon, featured && styles.featuredIcon]}>
          <Ionicons name="business" size={22} color={featured ? colors.white : colors.emerald} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{mosque.name}</Text>
          <Text style={styles.meta}>
            {mosque.walkingTime} • {mosque.address}
          </Text>
        </View>
        <Text style={styles.distance}>{mosque.distance}</Text>
      </View>
      <PrimaryButton label="Yol Tarifi" icon="navigate" tone={featured ? "gold" : "light"} style={styles.button} onPress={() => onDirections?.(mosque)} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 14
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  featuredIcon: {
    backgroundColor: colors.emerald
  },
  info: {
    flex: 1
  },
  name: {
    fontFamily: typography.title,
    fontSize: 20,
    color: colors.ink,
    fontWeight: "900"
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2
  },
  distance: {
    color: colors.emerald,
    fontWeight: "900",
    fontSize: 16
  },
  button: {
    marginTop: 14
  }
});
