import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { namesOfAllah, type AllahName } from "@/data/namesOfAllah";
import { fetchRemoteNameImages } from "@/services/namesOfAllahImagesApi";
import { colors, radii, typography } from "@/theme";

async function getNameImageUri(item: AllahName) {
  if (!FileSystem.cacheDirectory || !item.imageUrl) {
    return null;
  }

  const extension = item.imageUrl.toLowerCase().includes(".jpg") || item.imageUrl.toLowerCase().includes(".jpeg") ? "jpg" : "png";
  const targetUri = `${FileSystem.cacheDirectory}huzur-name-${item.id}.${extension}`;
  const existing = await FileSystem.getInfoAsync(targetUri);

  if (!existing.exists) {
    await FileSystem.downloadAsync(item.imageUrl, targetUri);
  }

  return targetUri;
}

export default function NamesOfAllahScreen() {
  const [query, setQuery] = useState("");
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [items, setItems] = useState<AllahName[]>(namesOfAllah);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const filteredNames = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr-TR");
    if (!term) {
      return items;
    }

    return items.filter((item) => `${item.transliteration} ${item.meaning} ${item.arabic}`.toLocaleLowerCase("tr-TR").includes(term));
  }, [items, query]);

  useEffect(() => {
    let isMounted = true;

    fetchRemoteNameImages(namesOfAllah).then((remoteItems) => {
      if (!isMounted) {
        return;
      }

      setItems(remoteItems);
      const imageUrls = remoteItems.map((item) => item.imageUrl).filter((url): url is string => Boolean(url));
      const nextLoadingState = Object.fromEntries(remoteItems.filter((item) => item.imageUrl).map((item) => [item.id, true]));
      setLoadingImages(nextLoadingState);

      if (imageUrls.length > 0) {
        void Image.prefetch(imageUrls, "disk");
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const shareNameCard = async (item: AllahName) => {
    try {
      setSharingId(item.id);
      const canShare = await Sharing.isAvailableAsync();
      const uri = await getNameImageUri(item);

      if (!uri || !canShare) {
        Alert.alert("Görsel hazır değil", "Bu isim için premium görsel eklendiğinde paylaşım aktif olur.");
        return;
      }

      await Sharing.shareAsync(uri, {
        dialogTitle: item.transliteration,
        mimeType: uri.endsWith(".jpg") ? "image/jpeg" : "image/png"
      });
    } catch {
      Alert.alert("Paylaşım hazırlanamadı", "İsim görseli paylaşılırken bir sorun oluştu.");
    } finally {
      setSharingId(null);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Allah'ın 99 İsmi" />
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles" size={30} color={colors.gold} />
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>99 isim</Text>
          </View>
        </View>
        <Text style={styles.title}>Esmaül Hüsna</Text>
        <Text style={styles.subtitle}>Premium görseller admin panelden eklendikçe burada gerçek 1080x1920 kartlar olarak görünür.</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={19} color={colors.muted} />
        <TextInput value={query} onChangeText={setQuery} placeholder="İsim veya anlam ara" placeholderTextColor={colors.muted} style={styles.searchInput} />
      </View>

      <FlatList
        data={filteredNames}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const hasImage = Boolean(item.imageUrl);
          const imageFailed = failedImages[item.id];
          const imageLoading = loadingImages[item.id] ?? false;

          return (
            <View style={styles.nameCardWrap}>
              {hasImage && !imageFailed ? (
                <View>
                  {imageLoading ? (
                    <View style={[styles.imageLoading, { aspectRatio: item.aspectRatio || 9 / 16 }]}>
                      <Ionicons name="sparkles" size={28} color={colors.gold} />
                      <Text style={styles.imageLoadingText}>Görsel hazırlanıyor</Text>
                    </View>
                  ) : null}
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={[styles.nameImage, { aspectRatio: item.aspectRatio || 9 / 16 }, imageLoading && styles.hiddenImage]}
                    contentFit="cover"
                    cachePolicy="disk"
                    priority="high"
                    transition={180}
                    onLoadEnd={() => setLoadingImages((current) => ({ ...current, [item.id]: false }))}
                    onError={() => {
                      setLoadingImages((current) => ({ ...current, [item.id]: false }));
                      setFailedImages((current) => ({ ...current, [item.id]: true }));
                    }}
                  />
                </View>
              ) : (
                <Card style={styles.placeholderCard}>
                  <View style={styles.placeholderHeader}>
                    <View style={styles.number}>
                      <Text style={styles.numberText}>{item.order}</Text>
                    </View>
                    <Text style={styles.placeholderStatus}>{imageFailed ? "Görsel yüklenemedi" : "Premium görsel bekleniyor"}</Text>
                  </View>
                  <Text style={styles.arabic}>{item.arabic}</Text>
                  <Text style={styles.name}>{item.transliteration}</Text>
                  <Text style={styles.meaning}>{item.meaning}</Text>
                </Card>
              )}
              <Pressable accessibilityRole="button" accessibilityLabel={`${item.transliteration} görselini paylaş`} disabled={sharingId === item.id} onPress={() => shareNameCard(item)} style={({ pressed }) => [styles.shareButton, pressed && styles.pressed, !hasImage && styles.disabledShareButton]}>
                <Ionicons name={sharingId === item.id ? "hourglass-outline" : "share-social"} size={18} color={hasImage ? colors.emerald : colors.muted} />
              </Pressable>
            </View>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: 18,
    borderRadius: radii.lg,
    padding: 20,
    backgroundColor: colors.emerald,
    overflow: "hidden"
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)"
  },
  countBadge: {
    minHeight: 34,
    borderRadius: radii.round,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  countText: {
    color: colors.white,
    fontWeight: "900"
  },
  title: {
    marginTop: 14,
    fontFamily: typography.title,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
    color: colors.white
  },
  subtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 22,
    fontWeight: "700"
  },
  searchWrap: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: radii.md,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    fontWeight: "800"
  },
  list: {
    paddingTop: 16,
    paddingBottom: 18,
    gap: 16
  },
  nameCardWrap: {
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: colors.ink,
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 5
  },
  nameImage: {
    width: "100%",
    minHeight: 520,
    backgroundColor: colors.paper
  },
  hiddenImage: {
    position: "absolute",
    opacity: 0
  },
  imageLoading: {
    width: "100%",
    minHeight: 520,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  imageLoadingText: {
    color: colors.emerald,
    fontSize: 13,
    fontWeight: "900"
  },
  placeholderCard: {
    minHeight: 250,
    gap: 12,
    backgroundColor: colors.paper
  },
  placeholderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  number: {
    width: 38,
    height: 38,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldSoft
  },
  numberText: {
    color: colors.emerald,
    fontWeight: "900"
  },
  placeholderStatus: {
    flex: 1,
    color: colors.muted,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "900"
  },
  arabic: {
    color: colors.emerald,
    fontSize: 42,
    textAlign: "right",
    fontWeight: "800"
  },
  name: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "900"
  },
  meaning: {
    color: colors.emerald,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "900"
  },
  pressed: {
    opacity: 0.72
  },
  shareButton: {
    position: "absolute",
    right: 14,
    top: 14,
    width: 42,
    height: 42,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.5)"
  },
  disabledShareButton: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderColor: colors.line
  }
});
