import { TestIds } from "react-native-google-mobile-ads";

const PROD_INTERSTITIAL = "ca-app-pub-4216862763820451/4742227807";
const PROD_REWARDED = "ca-app-pub-4216862763820451/9391919254";

export const AD_UNIT_IDS = {
  interstitial: __DEV__ ? TestIds.INTERSTITIAL : PROD_INTERSTITIAL,
  rewarded: __DEV__ ? TestIds.REWARDED : PROD_REWARDED,
};

export const AD_FREQUENCY = {
  interstitialMinIntervalMs: 60_000,
  interstitialShowEveryN: 2,
};
