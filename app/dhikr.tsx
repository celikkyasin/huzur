import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { DhikrCounter } from "@/components/DhikrCounter";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { dhikrOptions, useDhikrStore } from "@/store/dhikrStore";
import { colors, radii, typography } from "@/theme";

export default function DhikrScreen() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const { reset, selectedDhikrId, selectDhikr, soundEnabled, vibrationEnabled, toggleSound, toggleVibration } = useDhikrStore();
  const selectedDhikr = dhikrOptions.find((item) => item.id === selectedDhikrId) ?? dhikrOptions[0];

  const handleSelectDhikr = (id: string) => {
    selectDhikr(id);
    setIsPickerOpen(false);
  };

  return (
    <ScreenContainer contentStyle={styles.content}>
      <AppHeader title="Zikirmatik" />
      <Text style={styles.title}>Tesbih</Text>
      <Text style={styles.subtitle}>Günlük zikir ve tefekkür</Text>

      <View style={styles.pickerWrap}>
        <Pressable onPress={() => setIsPickerOpen((value) => !value)} style={styles.dhikrPill} accessibilityRole="button">
          <Text style={styles.dhikrText}>{selectedDhikr.label}</Text>
          <Ionicons name={isPickerOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.emerald} />
        </Pressable>

        {isPickerOpen ? (
          <Card style={styles.dropdown}>
            {dhikrOptions.map((item) => {
              const isSelected = item.id === selectedDhikrId;
              return (
                <Pressable key={item.id} onPress={() => handleSelectDhikr(item.id)} style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}>
                  <View style={styles.dropdownCopy}>
                    <Text style={[styles.dropdownText, isSelected && styles.dropdownTextSelected]}>{item.label}</Text>
                    <Text style={styles.dropdownHint}>{item.reciter}</Text>
                  </View>
                  {isSelected ? <Ionicons name="checkmark-circle" size={20} color={colors.emerald} /> : null}
                </Pressable>
              );
            })}
          </Card>
        ) : null}
      </View>

      <DhikrCounter />

      <View style={styles.actions}>
        <IconButton icon="refresh" label="Sıfırla" onPress={reset} />
        <IconButton icon={soundEnabled ? "volume-high" : "volume-mute"} label="Ses" onPress={toggleSound} selected={soundEnabled} />
        <IconButton icon={vibrationEnabled ? "phone-portrait" : "remove-circle"} label="Titreşim" onPress={toggleVibration} selected={vibrationEnabled} />
      </View>

      <Card style={styles.settings}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingText}>Sesli okuma</Text>
            <Text style={styles.settingHint}>Sayaç basıldığında seçili hoca kaydı çalar</Text>
          </View>
          <Switch value={soundEnabled} onValueChange={toggleSound} thumbColor={colors.emerald} />
        </View>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingText}>Titreşim</Text>
            <Text style={styles.settingHint}>Her zikirde hafif geri bildirim verir</Text>
          </View>
          <Switch value={vibrationEnabled} onValueChange={toggleVibration} thumbColor={colors.emerald} />
        </View>
      </Card>
      <PrimaryButton label="Hedefi Sıfırla" icon="refresh" tone="light" onPress={reset} style={styles.resetButton} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: "center"
  },
  title: {
    fontFamily: typography.title,
    color: colors.emerald,
    fontSize: 42,
    fontWeight: "900",
    marginTop: 22
  },
  subtitle: {
    color: colors.muted,
    marginTop: 4
  },
  pickerWrap: {
    width: "100%",
    alignItems: "center",
    marginTop: 18,
    zIndex: 10
  },
  dhikrPill: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    borderRadius: radii.round,
    backgroundColor: colors.emeraldSoft,
    paddingHorizontal: 16,
    paddingVertical: 9
  },
  dhikrText: {
    color: colors.emerald,
    fontWeight: "900"
  },
  dropdown: {
    width: "100%",
    marginTop: 10,
    padding: 8
  },
  dropdownItem: {
    minHeight: 58,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  dropdownCopy: {
    flex: 1,
    paddingRight: 10
  },
  dropdownItemSelected: {
    backgroundColor: colors.emeraldSoft
  },
  dropdownText: {
    color: colors.ink,
    fontWeight: "800"
  },
  dropdownTextSelected: {
    color: colors.emerald,
    fontWeight: "900"
  },
  dropdownHint: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 3,
    fontWeight: "700"
  },
  actions: {
    flexDirection: "row",
    gap: 14,
    marginTop: 24
  },
  settings: {
    width: "100%",
    marginTop: 24
  },
  settingRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14
  },
  settingText: {
    color: colors.ink,
    fontWeight: "900"
  },
  settingHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  resetButton: {
    width: "100%",
    marginTop: 14
  }
});
