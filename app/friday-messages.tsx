import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/AppHeader";
import { MessageCard } from "@/components/MessageCard";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { fridayCategories, fridayMessages } from "@/data/fridayMessages";
import { fetchRemoteFridayMessages } from "@/services/fridayMessagesApi";
import { useRewardStore } from "@/store/rewardStore";
import type { FridayMessage } from "@/types";
import { colors, radii, typography } from "@/theme";

function getImageSource(message: FridayMessage) {
  return message.imageUrl ? { uri: message.imageUrl } : message.image;
}

function getImageAspectRatio(message: FridayMessage) {
  if (message.aspectRatio) {
    return message.aspectRatio;
  }

  if (message.image) {
    const source = Image.resolveAssetSource(message.image);
    if (source?.width && source?.height) {
      return source.width / source.height;
    }
  }

  return 9 / 16;
}

async function getMessageImageUri(message: FridayMessage) {
  if (!FileSystem.cacheDirectory) {
    return null;
  }

  if (message.imageUrl) {
    const extension = message.imageUrl.toLowerCase().includes(".jpg") || message.imageUrl.toLowerCase().includes(".jpeg") ? "jpg" : "png";
    const targetUri = `${FileSystem.cacheDirectory}huzur-${message.id}.${extension}`;
    const existing = await FileSystem.getInfoAsync(targetUri);

    if (!existing.exists) {
      await FileSystem.downloadAsync(message.imageUrl, targetUri);
    }

    return targetUri;
  }

  if (!message.image) {
    return null;
  }

  const asset = Asset.fromModule(message.image as number | string);
  await asset.downloadAsync();

  const sourceUri = asset.localUri ?? asset.uri;
  if (!sourceUri) {
    return null;
  }

  const targetUri = `${FileSystem.cacheDirectory}huzur-${message.id}.png`;
  const existing = await FileSystem.getInfoAsync(targetUri);

  if (!existing.exists) {
    await FileSystem.copyAsync({ from: sourceUri, to: targetUri });
  }

  return targetUri;
}

export default function FridayMessagesScreen() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewStartIndex, setPreviewStartIndex] = useState(0);
  const [remoteMessages, setRemoteMessages] = useState<FridayMessage[] | null>(null);
  const awardReward = useRewardStore((state) => state.awardReward);
  const messages = useMemo(() => (remoteMessages?.length ? remoteMessages : fridayMessages), [remoteMessages]);
  const previewMessage = previewIndex === null ? null : messages[previewIndex] ?? null;
  const previewImageHeight = Math.max(320, screenHeight - 190);

  useEffect(() => {
    let isMounted = true;

    fetchRemoteFridayMessages().then((items) => {
      if (isMounted && items?.length) {
        setRemoteMessages(items);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const openPreview = (message: FridayMessage) => {
    const messageIndex = messages.findIndex((item) => item.id === message.id);
    const nextIndex = messageIndex >= 0 ? messageIndex : 0;
    setPreviewStartIndex(nextIndex);
    setPreviewIndex(nextIndex);
  };

  const closePreview = () => setPreviewIndex(null);

  const handlePreviewScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const pageHeight = event.nativeEvent.layoutMeasurement.height;
    const nextIndex = Math.round(event.nativeEvent.contentOffset.y / pageHeight);

    if (nextIndex >= 0 && nextIndex < messages.length) {
      setPreviewIndex(nextIndex);
    }
  };

  const shareMessage = async (message: FridayMessage) => {
    try {
      const uri = await getMessageImageUri(message);
      const canShare = await Sharing.isAvailableAsync();

      if (!uri || !canShare) {
        Alert.alert("Paylaşım hazırlanamadı", "Bu cihazda görsel paylaşımı şu anda kullanılamıyor.");
        return;
      }

      await Sharing.shareAsync(uri, {
        dialogTitle: "Cuma Mesajı",
        mimeType: uri.endsWith(".jpg") ? "image/jpeg" : "image/png"
      });
      void awardReward({
        action: "fridayShare",
        title: "Cuma mesajı paylaşıldı",
        description: "Paylaşıma hazır kart",
        points: 2
      });
    } catch {
      Alert.alert("Paylaşım hazırlanamadı", "Görsel paylaşılırken bir sorun oluştu.");
    }
  };

  const downloadMessage = async (message: FridayMessage) => {
    try {
      const uri = await getMessageImageUri(message);

      if (!uri) {
        Alert.alert("Görsel kaydedilemedi", "Bu kart için kaydedilecek bir görsel bulunamadı.");
        return;
      }

      const permission = await MediaLibrary.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("İzin gerekiyor", "Görseli galeriye kaydetmek için fotoğraf izni vermeniz gerekiyor.");
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Galeriye kaydedildi", "Görsel telefonunuzun fotoğraf galerisine eklendi.");
    } catch {
      Alert.alert("Görsel kaydedilemedi", "Görsel galeriye kaydedilirken bir sorun oluştu.");
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Cuma Mesajları" />
      <View style={styles.heroText}>
        <Text style={styles.title}>Paylaşıma Hazır Mesajlar</Text>
        <Text style={styles.subtitle}>Dikey ve kare görselleri seçin, paylaşın veya resim galerinize kaydedin.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {fridayCategories.map((category, index) => (
          <View key={category} style={[styles.category, index === 0 && styles.activeCategory]}>
            <Text style={[styles.categoryText, index === 0 && styles.activeCategoryText]}>{category}</Text>
          </View>
        ))}
      </ScrollView>

      <SectionTitle title="Öne Çıkan" />
      <MessageCard message={messages[0]} featured onShare={() => shareMessage(messages[0])} onDownload={() => downloadMessage(messages[0])} onPreview={() => openPreview(messages[0])} />

      <SectionTitle title="Hazır Kartlar" />
      {messages.slice(1).map((message) => (
        <MessageCard key={message.id} message={message} onShare={() => shareMessage(message)} onDownload={() => downloadMessage(message)} onPreview={() => openPreview(message)} />
      ))}

      <Modal visible={previewIndex !== null} transparent animationType="fade" onRequestClose={closePreview}>
        <View style={styles.previewBackdrop}>
          <View style={styles.previewCounter}>
            <Text style={styles.previewCounterText}>
              {(previewIndex ?? 0) + 1} / {messages.length}
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Tam ekranı kapat" onPress={closePreview} style={styles.closeButton}>
            <Ionicons name="close" size={26} color={colors.white} />
          </Pressable>
          <FlatList
            key={`preview-${previewStartIndex}-${screenHeight}-${messages.length}`}
            data={messages}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            initialScrollIndex={previewStartIndex}
            getItemLayout={(_, index) => ({ length: screenHeight, offset: screenHeight * index, index })}
            onMomentumScrollEnd={handlePreviewScrollEnd}
            renderItem={({ item }) => {
              const imageSource = getImageSource(item);
              const imageAspectRatio = getImageAspectRatio(item);
              const previewWidth = Math.min(screenWidth, previewImageHeight * imageAspectRatio);

              return (
                <View style={[styles.previewPage, { width: screenWidth, height: screenHeight }]}>
                  {imageSource ? <Image source={imageSource} style={[styles.previewImage, { width: previewWidth, height: previewImageHeight }]} resizeMode="contain" /> : null}
                </View>
              );
            }}
          />
          {previewMessage ? (
            <View style={styles.previewActions}>
              <Pressable accessibilityRole="button" accessibilityLabel="Paylaş" onPress={() => shareMessage(previewMessage)} style={styles.previewActionButton}>
                <Ionicons name="share-social" size={22} color={colors.emerald} />
                <Text style={styles.previewActionText}>Paylaş</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="İndir" onPress={() => downloadMessage(previewMessage)} style={styles.previewActionButton}>
                <Ionicons name="download" size={22} color={colors.emerald} />
                <Text style={styles.previewActionText}>İndir</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroText: {
    marginTop: 20
  },
  title: {
    fontFamily: typography.title,
    color: colors.emerald,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    marginTop: 8,
    lineHeight: 22
  },
  categories: {
    gap: 8,
    paddingVertical: 20
  },
  category: {
    height: 42,
    borderRadius: radii.round,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line
  },
  activeCategory: {
    backgroundColor: colors.goldSoft,
    borderColor: colors.gold
  },
  categoryText: {
    color: colors.muted,
    fontWeight: "800"
  },
  activeCategoryText: {
    color: colors.emerald
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.94)"
  },
  previewPage: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 78,
    paddingBottom: 112
  },
  previewCounter: {
    position: "absolute",
    top: 52,
    left: 18,
    zIndex: 2,
    minWidth: 62,
    height: 38,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)"
  },
  previewCounterText: {
    color: colors.white,
    fontWeight: "900"
  },
  closeButton: {
    position: "absolute",
    top: 48,
    right: 18,
    zIndex: 2,
    width: 48,
    height: 48,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)"
  },
  previewImage: {
    maxWidth: "100%"
  },
  previewActions: {
    position: "absolute",
    bottom: 34,
    left: 18,
    right: 18,
    flexDirection: "row",
    gap: 12,
    zIndex: 2
  },
  previewActionButton: {
    flex: 1,
    height: 54,
    borderRadius: radii.round,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  previewActionText: {
    color: colors.emerald,
    fontSize: 14,
    fontWeight: "900"
  }
});
