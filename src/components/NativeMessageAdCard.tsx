import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import {
  NativeAd,
  NativeAdChoicesPlacement,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaAspectRatio,
  NativeMediaView
} from "react-native-google-mobile-ads";
import { adMobUnitIds } from "@/config/adMob";
import { colors, radii, shadows, typography } from "@/theme";

type NativeMessageAdCardProps = {
  style?: StyleProp<ViewStyle>;
};

export function NativeMessageAdCard({ style }: NativeMessageAdCardProps) {
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    let loadedAd: NativeAd | null = null;

    NativeAd.createForAdRequest(adMobUnitIds.native, {
      adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT,
      aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
      startVideoMuted: true
    })
      .then((ad) => {
        loadedAd = ad;
        if (mounted) {
          setNativeAd(ad);
        } else {
          ad.destroy();
        }
      })
      .catch(() => {
        if (mounted) {
          setFailed(true);
        }
      });

    return () => {
      mounted = false;
      loadedAd?.destroy();
    };
  }, []);

  if (failed) {
    return null;
  }

  if (!nativeAd) {
    return (
      <View style={[styles.loadingCard, style]}>
        <ActivityIndicator color={colors.emerald} />
        <Text style={styles.loadingText}>Test reklam hazırlanıyor</Text>
      </View>
    );
  }

  return (
    <NativeAdView nativeAd={nativeAd} style={[styles.card, style]}>
      <View style={styles.topRow}>
        {nativeAd.icon ? (
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image source={{ uri: nativeAd.icon.url }} style={styles.icon} />
          </NativeAsset>
        ) : (
          <View style={styles.iconFallback}>
            <Ionicons name="sparkles" size={18} color={colors.gold} />
          </View>
        )}

        <View style={styles.titleBlock}>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text numberOfLines={2} style={styles.headline}>
              {nativeAd.headline}
            </Text>
          </NativeAsset>
          {nativeAd.advertiser ? (
            <NativeAsset assetType={NativeAssetType.ADVERTISER}>
              <Text numberOfLines={1} style={styles.advertiser}>
                {nativeAd.advertiser}
              </Text>
            </NativeAsset>
          ) : null}
        </View>

        <Text style={styles.badge}>Reklam</Text>
      </View>

      <NativeMediaView resizeMode="cover" style={styles.media} />

      <View style={styles.bottomRow}>
        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text numberOfLines={2} style={styles.body}>
            {nativeAd.body}
          </Text>
        </NativeAsset>
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <Text style={styles.cta}>{nativeAd.callToAction || "Aç"}</Text>
        </NativeAsset>
      </View>
    </NativeAdView>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 18,
    borderRadius: radii.lg,
    padding: 14,
    overflow: "hidden",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.soft
  },
  loadingCard: {
    minHeight: 148,
    marginBottom: 18,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line
  },
  loadingText: {
    color: colors.muted,
    fontWeight: "800"
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12
  },
  iconFallback: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.emeraldSoft
  },
  titleBlock: {
    flex: 1,
    minWidth: 0
  },
  headline: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  advertiser: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  badge: {
    overflow: "hidden",
    borderRadius: radii.round,
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: colors.emerald,
    backgroundColor: colors.goldSoft,
    fontSize: 11,
    fontWeight: "900"
  },
  media: {
    width: "100%",
    aspectRatio: 1.75,
    marginTop: 12,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.emeraldSoft
  },
  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  body: {
    flex: 1,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700"
  },
  cta: {
    overflow: "hidden",
    borderRadius: radii.round,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.white,
    backgroundColor: colors.emerald,
    fontSize: 13,
    fontFamily: typography.body,
    fontWeight: "900"
  }
});
