import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { fetchDuaRequests, isDuaRequestsApiConfigured, sendDuaPrayer, submitDuaRequest, type RemoteDuaRequest } from "@/services/duaRequestsApi";
import { colors, radii, typography } from "@/theme";

export default function DuaRequestsScreen() {
  const [requests, setRequests] = useState<RemoteDuaRequest[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    const items = await fetchDuaRequests();
    if (items) {
      setRequests(items);
      setMessage("");
    } else if (!isDuaRequestsApiConfigured()) {
      setMessage("Dua alanı için backend adresi tanımlı değil.");
    } else {
      setMessage("Dua listesi şu anda yenilenemedi.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    void loadRequests();
    const intervalId = setInterval(() => {
      void loadRequests();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = async () => {
    const cleanText = text.trim();
    if (!cleanText || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const result = await submitDuaRequest({ name: name.trim(), text: cleanText });
    setIsSubmitting(false);

    if (result?.ok && result.request) {
      setName("");
      setText("");
      setRequests((current) => [result.request as RemoteDuaRequest, ...current].slice(0, 50));
      setMessage("Dua talebin yayınlandı.");
      return;
    }

    setMessage(result?.error || "Dua talebi gönderilemedi.");
  };

  const prayFor = async (id: string) => {
    setRequests((current) => current.map((request) => (request.id === id ? { ...request, prayerCount: request.prayerCount + 1 } : request)));
    const result = await sendDuaPrayer(id);
    if (result?.request) {
      setRequests((current) => current.map((request) => (request.id === id ? result.request as RemoteDuaRequest : request)));
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Dua İste" />
      <Card variant="emerald" style={styles.hero}>
        <Text style={styles.heroLabel}>DUA HALKASI</Text>
        <Text style={styles.heroTitle}>Derdini yaz, herkes dua etsin.</Text>
        <Text style={styles.heroText}>Dua talepleri tüm kullanıcılarda görünür ve düzenli olarak yenilenir.</Text>
      </Card>

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Dua talebi oluştur</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Adın veya rumuzun" placeholderTextColor={colors.muted} style={styles.input} />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Dua isteğini yaz"
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
          style={[styles.input, styles.textArea]}
        />
        <Pressable accessibilityRole="button" onPress={handleSubmit} style={[styles.submitButton, isSubmitting && styles.disabledButton]}>
          {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Ionicons name="send" size={18} color={colors.white} />}
          <Text style={styles.submitText}>Yayınla</Text>
        </Pressable>
        {message ? <Text style={styles.messageText}>{message}</Text> : null}
      </Card>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Dua isteyenler</Text>
        {isLoading ? <ActivityIndicator color={colors.emerald} /> : null}
      </View>

      {requests.map((request) => (
        <Card key={request.id} style={styles.requestCard}>
          <View style={styles.requestHeader}>
            <View style={styles.avatar}>
              <Ionicons name="heart" size={20} color={colors.emerald} />
            </View>
            <View style={styles.requestMeta}>
              <Text style={styles.requestName}>{request.name}</Text>
              <Text style={styles.requestDate}>{new Date(request.createdAt).toLocaleDateString("tr-TR")}</Text>
            </View>
          </View>
          <Text style={styles.requestText}>{request.text}</Text>
          <Pressable accessibilityRole="button" onPress={() => prayFor(request.id)} style={styles.prayButton}>
            <Ionicons name="sparkles" size={18} color={colors.gold} />
            <Text style={styles.prayText}>Dua ettim</Text>
            <Text style={styles.prayCount}>{request.prayerCount}</Text>
          </Pressable>
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 16, marginBottom: 14 },
  heroLabel: { color: colors.gold, fontSize: 12, fontWeight: "900" },
  heroTitle: { color: colors.white, fontFamily: typography.title, fontSize: 26, lineHeight: 32, fontWeight: "900", marginTop: 8 },
  heroText: { color: "rgba(255,255,255,0.78)", marginTop: 10, lineHeight: 21, fontWeight: "700" },
  formCard: { gap: 10, marginBottom: 18 },
  formTitle: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  input: { minHeight: 48, borderRadius: radii.md, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, color: colors.ink, fontWeight: "800", backgroundColor: colors.white },
  textArea: { minHeight: 110, paddingTop: 12, lineHeight: 20 },
  submitButton: { minHeight: 48, borderRadius: radii.round, backgroundColor: colors.emerald, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  disabledButton: { opacity: 0.72 },
  submitText: { color: colors.white, fontWeight: "900" },
  messageText: { color: colors.muted, textAlign: "center", fontWeight: "800" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { color: colors.emerald, fontFamily: typography.title, fontSize: 28, fontWeight: "900" },
  requestCard: { marginBottom: 12 },
  requestHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: radii.round, backgroundColor: colors.emeraldSoft, alignItems: "center", justifyContent: "center" },
  requestMeta: { flex: 1 },
  requestName: { color: colors.ink, fontWeight: "900" },
  requestDate: { color: colors.muted, fontSize: 12, marginTop: 2, fontWeight: "700" },
  requestText: { color: colors.ink, marginTop: 12, lineHeight: 22, fontWeight: "700" },
  prayButton: { minHeight: 42, marginTop: 14, borderRadius: radii.round, backgroundColor: colors.emeraldSoft, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  prayText: { color: colors.emerald, fontWeight: "900" },
  prayCount: { minWidth: 28, textAlign: "center", color: colors.emerald, fontWeight: "900" }
});
