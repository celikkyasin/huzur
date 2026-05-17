import { useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { colors, radii, typography } from "@/theme";

const GOLD_NISAB_GRAMS = 80.18;
const FITRE_2026 = 240;

function parseAmount(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) + " TL";
}

export default function ZakatCalculatorScreen() {
  const [goldGramPrice, setGoldGramPrice] = useState("");
  const [cash, setCash] = useState("");
  const [goldValue, setGoldValue] = useState("");
  const [tradeGoods, setTradeGoods] = useState("");
  const [receivables, setReceivables] = useState("");
  const [debts, setDebts] = useState("");
  const [peopleCount, setPeopleCount] = useState("1");

  const result = useMemo(() => {
    const nisab = parseAmount(goldGramPrice) * GOLD_NISAB_GRAMS;
    const assets = parseAmount(cash) + parseAmount(goldValue) + parseAmount(tradeGoods) + parseAmount(receivables);
    const netAssets = Math.max(assets - parseAmount(debts), 0);
    const zakat = netAssets >= nisab && nisab > 0 ? netAssets * 0.025 : 0;
    const fitre = Math.max(Math.floor(parseAmount(peopleCount)), 0) * FITRE_2026;
    return { nisab, netAssets, zakat, fitre };
  }, [cash, debts, goldGramPrice, goldValue, peopleCount, receivables, tradeGoods]);

  return (
    <ScreenContainer>
      <AppHeader title="Zekat Hesapla" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Card variant="emerald" style={styles.hero}>
          <Text style={styles.heroLabel}>ZEKAT VE FITRE</Text>
          <Text style={styles.heroTitle}>Mal varlığını gir, yaklaşık zekat tutarını gör.</Text>
          <Text style={styles.heroText}>Zekat, nisap miktarına ulaşan malın kırkta biri olarak hesaplanır. Fitre kişi başı girilen tutara göre gösterilir.</Text>
        </Card>

        <Card style={styles.infoCard}>
          <InfoRow icon="information-circle" text="Nisap hesabında 80,18 gram altın değeri esas alınır." />
          <InfoRow icon="wallet" text="Borçlar düşüldükten sonra kalan tutar nisabı geçerse %2,5 zekat hesaplanır." />
          <InfoRow icon="people" text={`Fitre tutarı 2026 için kişi başı ${FITRE_2026} TL olarak varsayıldı.`} />
        </Card>

        <Card style={styles.formCard}>
          <MoneyInput label="Gram altın fiyatı" value={goldGramPrice} onChangeText={setGoldGramPrice} placeholder="Örn. 4250" />
          <MoneyInput label="Nakit / banka" value={cash} onChangeText={setCash} />
          <MoneyInput label="Altın değeri" value={goldValue} onChangeText={setGoldValue} />
          <MoneyInput label="Ticaret malı" value={tradeGoods} onChangeText={setTradeGoods} />
          <MoneyInput label="Alacaklar" value={receivables} onChangeText={setReceivables} />
          <MoneyInput label="Borçlar" value={debts} onChangeText={setDebts} />
          <MoneyInput label="Fitre kişi sayısı" value={peopleCount} onChangeText={setPeopleCount} keyboardType="number-pad" />
        </Card>

        <Card variant="emerald" style={styles.resultCard}>
          <ResultRow label="Nisap eşiği" value={formatMoney(result.nisab)} />
          <ResultRow label="Net mal varlığı" value={formatMoney(result.netAssets)} />
          <ResultRow label="Zekat" value={formatMoney(result.zakat)} highlight />
          <ResultRow label="Fitre" value={formatMoney(result.fitre)} />
        </Card>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function InfoRow({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.emerald} />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function MoneyInput({ label, value, onChangeText, placeholder = "0", keyboardType = "decimal-pad" }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "decimal-pad" | "number-pad";
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={[styles.resultValue, highlight && styles.highlightValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 16, marginBottom: 14 },
  heroLabel: { color: colors.gold, fontSize: 12, fontWeight: "900" },
  heroTitle: { color: colors.white, fontFamily: typography.title, fontSize: 26, lineHeight: 32, fontWeight: "900", marginTop: 8 },
  heroText: { color: "rgba(255,255,255,0.78)", marginTop: 10, lineHeight: 21, fontWeight: "700" },
  infoCard: { gap: 12, marginBottom: 14 },
  infoRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  infoText: { flex: 1, color: colors.muted, lineHeight: 20, fontWeight: "700" },
  formCard: { gap: 12, marginBottom: 14 },
  inputGroup: { gap: 6 },
  inputLabel: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  input: { minHeight: 48, borderRadius: radii.md, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, color: colors.ink, fontWeight: "800", backgroundColor: colors.white },
  resultCard: { gap: 12 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  resultLabel: { color: "rgba(255,255,255,0.74)", fontWeight: "800" },
  resultValue: { color: colors.white, fontWeight: "900" },
  highlightValue: { color: colors.gold, fontSize: 22 }
});
