import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [items, setItems] = useState<AllahName[]>(namesOfAllah);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewStartIndex, setPreviewStartIndex] = useState(0);
  const cardImageHeight = Math.min(620, Math.max(460, (screenWidth - 40) * 1.55));
  const previewImageHeight = Math.max(320, screenHeight - 140);
  const filteredNames = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("tr-TR");
    if (!term) {
      return items;
    }

    return items.filter((item) => `${item.transliteration} ${item.meaning} ${item.arabic}`.toLocaleLowerCase("tr-TR").includes(term));
  }, [items, query]);
  const previewItem = previewIndex === null ? null : filteredNames[previewIndex] ?? null;

  useEffect(() => {
    let isMounted = true;

    fetchRemoteNameImages(namesOfAllah).then((remoteItems) => {
      if (!isMounted) {
        return;
      }

      setItems(remoteItems);
      setLoadingImages(Object.fromEntries(remoteItems.filter((item) => item.imageUrl).map((item) => [item.id, true])));
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const openPreview = (item: AllahName) => {
    if (!item.imageUrl || failedImages[item.id]) {
      return;
    }

    const itemIndex = filteredNames.findIndex((name) => name.id === item.id);
    const nextIndex = itemIndex >= 0 ? itemIndex : 0;
    setPreviewStartIndex(nextIndex);
    setPreviewIndex(nextIndex);
  };

  const closePreview = () => setPreviewIndex(null);

  const handlePreviewScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pageHeight = event.nativeEvent.layoutMeasurement.height;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.y / pageHeight);

    if (nextIndex >= 0 && nextIndex < filteredNames.length) {
      setPreviewIndex(nextIndex);
    }
  };

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

  const renderNameCard = ({ item }: { item: AllahName }) => {
    const hasImage = Boolean(item.imageUrl);
    const imageFailed = failedImages[item.id];
    const imageLoading = loadingImages[item.id] ?? false;

    return (
      <View style={styles.nameCardWrap}>
        {hasImage && !imageFailed ? (
          <Pressable accessibilityRole="imagebutton" accessibilityLabel={`${item.transliteration} görselini tam ekran aç`} onPress={() => openPreview(item)} style={({ pressed }) => [styles.imageFrame, pressed && styles.pressed]}>
            <Image
              source={{ uri: item.imageUrl }}
              style={[styles.nameImage, { height: cardImageHeight }]}
              resizeMode="cover"
              onLoad={() => setLoadingImages((current) => ({ ...current, [item.id]: false }))}
              onLoadEnd={() => setLoadingImages((current) => ({ ...current, [item.id]: false }))}
              onError={() => {
                setLoadingImages((current) => ({ ...current, [item.id]: false }));
                setFailedImages((current) => ({ ...current, [item.id]: true }));
              }}
            />
            {imageLoading ? (
              <View style={styles.imageLoading}>
                <ActivityIndicator color={colors.emerald} />
                <Text style={styles.imageLoadingText}>Görsel hazırlanıyor</Text>
              </View>
            ) : null}
          </Pressable>
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
        <Pressable accessibilityRole="button" accessibilityLabel={`${item.transliteration} görselini paylaş`} disabled={sharingId === item.id || !hasImage} onPress={() => shareNameCard(item)} style={({ pressed }) => [styles.shareButton, pressed && styles.pressed, !hasImage && styles.disabledShareButton]}>
          <Ionicons name={sharingId === item.id ? "hourglass-outline" : "share-social"} size={20} color={hasImage ? colors.emerald : colors.muted} />
        </Pressable>
      </View>
    );
  };

  return (
    <ScreenContainer scroll={false} contentStyle={styles.screen}>
      <AppHeader title="Allah'ın 99 İsmi" />
      <FlatList
        data={filteredNames}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
        ListHeaderComponent={
          <>
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
            </View>

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={19} color={colors.muted} />
              <TextInput value={query} onChangeText={setQuery} placeholder="İsim veya anlam ara" placeholderTextColor={colors.muted} style={styles.searchInput} />
            </View>
          </>
        }
        renderItem={renderNameCard}
      />

      <Modal visible={previewIndex !== null} transparent animationType="fade" onRequestClose={closePreview}>
        <View style={styles.previewBackdrop}>
          <View style={styles.previewCounter}>
            <Text style={styles.previewCounterText}>
              {(previewIndex ?? 0) + 1} / {filteredNames.length}
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Tam ekranı kapat" onPress={closePreview} style={styles.closeButton}>
            <Ionicons name="close" size={26} color={colors.white} />
          </Pressable>
          <FlatList
            key={`names-preview-${previewStartIndex}-${screenHeight}-${filteredNames.length}`}
            data={filteredNames}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            initialScrollIndex={previewStartIndex}
            getItemLayout={(_, index) => ({ length: screenHeight, offset: screenHeight * index, index })}
            onMomentumScrollEnd={handlePreviewScrollEnd}
            renderItem={({ item }) => {
              const imageAspectRatio = item.aspectRatio || 9 / 16;
              const previewWidth = Math.min(screenWidth, previewImageHeight * imageAspectRatio);

              return (
                <View style={[styles.previewPage, { width: screenWidth, height: screenHeight }]}>
                  {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={[styles.previewImage, { width: previewWidth, height: previewImageHeight }]} resizeMode="contain" /> : null}
                </View>
              );
            }}
          />
          {previewItem ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Paylaş" onPress={() => shareNameCard(previewItem)} style={styles.previewShareButton}>
              <Ionicons name={sharingId === previewItem.id ? "hourglass-outline" : "share-social"} size={22} color={colors.emerald} />
              <Text style={styles.previewShareText}>Paylaş</Text>
            </Pressable>
          ) : null}
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingBottom: 0
  },
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
  listContainer: {
    flex: 1
  },
  list: {
    paddingBottom: 126,
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
  imageFrame: {
    position: "relative",
    backgroundColor: colors.paper
  },
  nameImage: {
    width: "100%",
    backgroundColor: colors.paper
  },
  imageLoading: {
    position: "absolute",
    inset: 0,
    width: "100%",
    backgroundColor: "rgba(255,253,248,0.94)",
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
    bottom: 14,
    width: 46,
    height: 46,
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
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2,18,14,0.96)"
  },
  previewCounter: {
    position: "absolute",
    zIndex: 3,
    top: 54,
    left: 18,
    minHeight: 36,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  previewCounterText: {
    color: colors.white,
    fontWeight: "900"
  },
  closeButton: {
    position: "absolute",
    zIndex: 3,
    top: 50,
    right: 18,
    width: 44,
    height: 44,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center"
  },
  previewPage: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10
  },
  previewImage: {
    borderRadius: 18
  },
  previewShareButton: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 26,
    minHeight: 52,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,255,255,0.96)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  previewShareText: {
    color: colors.emerald,
    fontSize: 15,
    fontWeight: "900"
  }
});
