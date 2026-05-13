import { useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
import { useRewardStore } from "@/store/rewardStore";
import type { FridayMessage } from "@/types";
import { colors, radii, typography } from "@/theme";

async function getMessageImageUri(message: FridayMessage) {
  if (!message.image || !FileSystem.cacheDirectory) {
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
  const [previewMessage, setPreviewMessage] = useState<FridayMessage | null>(null);
  const awardReward = useRewardStore((state) => state.awardReward);

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
        mimeType: "image/png"
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
      Alert.alert("Galeriye kaydedildi", "Görsel artık telefonunuzun galerisinde.");
    } catch {
      Alert.alert("Görsel kaydedilemedi", "Görsel galeriye kaydedilirken bir sorun oluştu.");
    }
  };

  return (
    <ScreenContainer>
      <AppHeader title="Cuma Mesajları" />
      <View style={styles.heroText}>
        <Text style={styles.title}>Paylaşıma Hazır Mesajlar</Text>
        <Text style={styles.subtitle}>Dikey hikaye görsellerini seçin, paylaşın veya resim galerinize kaydedin.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
        {fridayCategories.map((category, index) => (
          <View key={category} style={[styles.category, index === 0 && styles.activeCategory]}>
            <Text style={[styles.categoryText, index === 0 && styles.activeCategoryText]}>{category}</Text>
          </View>
        ))}
      </ScrollView>

      <SectionTitle title="Öne Çıkan" />
      <MessageCard message={fridayMessages[0]} featured onShare={() => shareMessage(fridayMessages[0])} onDownload={() => downloadMessage(fridayMessages[0])} onPreview={() => setPreviewMessage(fridayMessages[0])} />

      <SectionTitle title="Hazır Kartlar" />
      {fridayMessages.slice(1).map((message) => (
        <MessageCard key={message.id} message={message} onShare={() => shareMessage(message)} onDownload={() => downloadMessage(message)} onPreview={() => setPreviewMessage(message)} />
      ))}

      <Modal visible={!!previewMessage} transparent animationType="fade" onRequestClose={() => setPreviewMessage(null)}>
        <View style={styles.previewBackdrop}>
          <Pressable accessibilityRole="button" accessibilityLabel="Tam ekranı kapat" onPress={() => setPreviewMessage(null)} style={styles.closeButton}>
            <Ionicons name="close" size={26} color={colors.white} />
          </Pressable>
          {previewMessage?.image ? <Image source={previewMessage.image} style={styles.previewImage} resizeMode="contain" /> : null}
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
    backgroundColor: "rgba(0,0,0,0.94)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18
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
    width: "100%",
    height: "78%"
  },
  previewActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18
  },
  previewActionButton: {
    minWidth: 132,
    height: 52,
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
