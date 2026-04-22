import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";

let initialized = false;

export async function initAdMob(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    await mobileAds().initialize();
  } catch {
    initialized = false;
  }
}
