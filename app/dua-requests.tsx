import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { fetchDuaRequests, isDuaRequestsApiConfigured, sendDuaPrayer, submitDuaRequest, type RemoteDuaRequest } from "@/services/duaRequestsApi";
import { colors, radii, typography } from "@/theme";

const PRAYED_IDS_STORAGE_KEY = "huzur.dua.prayed-ids.v1";

function deduplicateRequests(items: RemoteDuaRequest[], localFloorCounts: Record<string, number>) {
  const seenIds = new Set<string>();
  const seenFingerprints = new Set<string>();
  const result: RemoteDuaRequest[] = [];

  for (const item of items) {
    if (!item || !item.id || seenIds.has(item.id)) {
      continue;
    }

    const fingerprint = `${(item.name || "").trim().toLocaleLowerCase("tr-TR")}|${(item.text || "").trim().toLocaleLowerCase("tr-TR")}`;
    if (seenFingerprints.has(fingerprint)) {
      continue;
    }

    seenIds.add(item.id);
    seenFingerprints.add(fingerprint);

    const floorCount = localFloorCounts[item.id] ?? 0;
    result.push({
      ...item,
      prayerCount: Math.max(Number(item.prayerCount) || 0, floorCount)
    });
  }

  return result;
}

export default function DuaRequestsScreen() {
  const [requests, setRequests] = useState<RemoteDuaRequest[]>([]);
  const [prayedIds, setPrayedIds] = useState<Record<string, boolean>>({});
  const [prayingIds, setPrayingIds] = useState<Record<string, boolean>>({});
  const localFloorCountsRef = useRef<Record<string, number>>({});
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(PRAYED_IDS_STORAGE_KEY)
      .then((stored) => {
        if (stored) {
          setPrayedIds(JSON.parse(stored) as Record<string, boolean>);
        }
      })
      .catch(() => {});
  }, []);

  const loadRequests = useCallback(async () => {
    const items = await fetchDuaRequests();
    if (items) {
      setRequests(deduplicateRequests(items, localFloorCountsRef.current));
      setMessage("");
    } else if (!isDuaRequestsApiConfigured()) {
      setMessage("Dua alanı için backend adresi tanımlı değil.");
    } else {
      setMessage("Dua listesi şu anda yenilenemedi.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadRequests();
    const intervalId = setInterval(() => {
      void loadRequests();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [loadRequests]);

  const handleSubmit = async () => {
    const cleanText = text.trim();
    if (!cleanText || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    const result = await submitDuaRequest({ name: name.trim(), text: cleanText });
    setIsSubmitting(false);

    if (result?.ok && result.request) {
      const created = result.request as RemoteDuaRequest;
      setName("");
      setText("");
      setRequests((current) => deduplicateRequests([created, ...current], localFloorCountsRef.current).slice(0, 50));
      setMessage("Dua talebin yayınlandı.");
      return;
    }

    setMessage(result?.error || "Dua talebi gönderilemedi.");
  };

  const prayFor = async (id: string) => {
    if (prayedIds[id] || prayingIds[id]) {
      return;
    }

    setPrayingIds((prev) => ({ ...prev, [id]: true }));
    setPrayedIds((prev) => {
      const next = { ...prev, [id]: true };
      void AsyncStorage.setItem(PRAYED_IDS_STORAGE_KEY, JSON.stringify(next));
      return next;
    });

    setRequests((current) =>
      current.map((request) => {
        if (request.id !== id) {
          return request;
        }
        const nextCount = (Number(request.prayerCount) || 0) + 1;
        localFloorCountsRef.current[id] = Math.max(localFloorCountsRef.current[id] ?? 0, nextCount);
        return { ...request, prayerCount: nextCount };
      })
    );

    try {
      const result = await sendDuaPrayer(id);
      if (result?.request) {
        const remoteReq = result.request as RemoteDuaRequest;
        const safeCount = Math.max(Number(remoteReq.prayerCount) || 0, localFloorCountsRef.current[id] ?? 0);
        localFloorCountsRef.current[id] = safeCount;
        setRequests((current) => current.map((request) => (request.id === id ? { ...remoteReq, prayerCount: safeCount } : request)));
      }
    } finally {
      setPrayingIds((prev) => ({ ...prev, [id]: false }));
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

      {requests.map((request) => {
        const hasPrayed = Boolean(prayedIds[request.id]);

        return (
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
            <Pressable
              accessibilityRole="button"
              disabled={hasPrayed}
              onPress={() => void prayFor(request.id)}
              style={[styles.prayButton, hasPrayed && styles.prayButtonDone]}
            >
              <Ionicons name={hasPrayed ? "checkmark-circle" : "sparkles"} size={18} color={hasPrayed ? colors.white : colors.gold} />
              <Text style={[styles.prayText, hasPrayed && styles.prayTextDone]}>{hasPrayed ? "Dua edildi" : "Dua ettim"}</Text>
              <Text style={[styles.prayCount, hasPrayed && styles.prayCountDone]}>{request.prayerCount}</Text>
            </Pressable>
          </Card>
        );
      })}
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
  prayButtonDone: { backgroundColor: colors.emerald },
  prayText: { color: colors.emerald, fontWeight: "900" },
  prayTextDone: { color: colors.white },
  prayCount: { minWidth: 28, textAlign: "center", color: colors.emerald, fontWeight: "900" },
  prayCountDone: { color: colors.goldSoft }
});
