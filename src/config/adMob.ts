import { TestIds } from "react-native-google-mobile-ads";

const LIVE_NATIVE_AD_UNIT_ID = "ca-app-pub-3879447346628162/6670346550";
const LIVE_REWARDED_AD_UNIT_ID = "ca-app-pub-3879447346628162/2160255900";

export const adMobUnitIds = {
  native: __DEV__ ? TestIds.NATIVE : LIVE_NATIVE_AD_UNIT_ID,
  rewarded: __DEV__ ? TestIds.REWARDED : LIVE_REWARDED_AD_UNIT_ID
};
