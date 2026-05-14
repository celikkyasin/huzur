import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { FridayMessage } from "@/types";
import { colors, radii, shadows, typography } from "@/theme";

type MessageCardProps = {
  message: FridayMessage;
  featured?: boolean;
  onShare?: () => void;
  onDownload?: () => void;
  onPreview?: () => void;
};

export function MessageCard({ message, featured, onShare, onDownload, onPreview }: MessageCardProps) {
  const imageSource = message.imageUrl ? { uri: message.imageUrl } : message.image;
  const resolvedImage = message.image ? Image.resolveAssetSource(message.image) : null;
  const imageAspectRatio = message.aspectRatio || (resolvedImage?.width && resolvedImage?.height ? resolvedImage.width / resolvedImage.height : 9 / 16);
  const actionButtons = (
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" accessibilityLabel="Paylaş" onPress={onShare} hitSlop={10} style={styles.actionButton}>
        <Ionicons name="share-social" size={22} color={colors.emerald} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="İndir" onPress={onDownload} hitSlop={10} style={styles.actionButton}>
        <Ionicons name="download" size={22} color={colors.emerald} />
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.wrap, featured && styles.featuredWrap]}>
      {imageSource ? (
        <Pressable accessibilityRole="imagebutton" accessibilityLabel="Görseli tam ekran aç" onPress={onPreview} style={[styles.imageCard, { aspectRatio: imageAspectRatio }]}>
          <Image source={imageSource} style={styles.media} resizeMode="contain" />
          {actionButtons}
        </Pressable>
      ) : (
        <Pressable accessibilityRole="button" accessibilityLabel="Kartı tam ekran aç" onPress={onPreview}>
          <LinearGradient colors={[message.background, "#0C1714"]} style={styles.card}>
            <LinearGradient colors={["rgba(3,31,25,0.05)", "rgba(3,31,25,0.22)", "rgba(3,31,25,0.62)"]} style={StyleSheet.absoluteFill} />
            <View style={[styles.motif, { borderColor: message.accent }]} />
            <View style={styles.badge}>
              <Ionicons name={message.mediaType === "video" ? "videocam" : "image"} size={13} color={colors.emerald} />
              <Text style={styles.badgeText}>{message.mediaType === "video" ? "Video" : message.category}</Text>
            </View>
            <Text style={[styles.message, featured && styles.featuredText]}>{message.message}</Text>
            {actionButtons}
          </LinearGradient>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 18
  },
  featuredWrap: {
    marginBottom: 20
  },
  card: {
    aspectRatio: 9 / 16,
    borderRadius: radii.lg,
    padding: 16,
    justifyContent: "space-between",
    overflow: "hidden",
    backgroundColor: colors.emeraldDark,
    ...shadows.soft
  },
  imageCard: {
    width: "100%",
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.soft
  },
  media: {
    width: "100%",
    height: "100%"
  },
  actions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 10
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: radii.round,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,253,248,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)"
  },
  badge: {
    alignSelf: "flex-start",
    minHeight: 30,
    borderRadius: radii.round,
    backgroundColor: "rgba(255,253,248,0.86)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10
  },
  badgeText: {
    color: colors.emerald,
    fontSize: 11,
    fontWeight: "900"
  },
  motif: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1,
    opacity: 0.22,
    top: -44,
    right: -34
  },
  message: {
    color: colors.white,
    fontFamily: typography.title,
    fontSize: 23,
    lineHeight: 30,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8
  },
  featuredText: {
    fontSize: 27,
    lineHeight: 35
  }
});
