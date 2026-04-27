import mobileAds, {
  AdsConsent,
  MaxAdContentRating,
} from "react-native-google-mobile-ads";

let initialized = false;
let nonPersonalizedAdsOnly = true;

export function shouldRequestNonPersonalizedAdsOnly(): boolean {
  return nonPersonalizedAdsOnly;
}

export async function initAdMob(): Promise<void> {
  if (initialized) return;
  initialized = true;
  try {
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });
    try {
      await AdsConsent.gatherConsent();
      const consentInfo = await AdsConsent.getConsentInfo();
      if (consentInfo.canRequestAds) {
        const choices = await AdsConsent.getUserChoices();
        nonPersonalizedAdsOnly = !choices.selectPersonalisedAds;
      } else {
        nonPersonalizedAdsOnly = true;
      }
    } catch {
      nonPersonalizedAdsOnly = true;
    }
    await mobileAds().initialize();
  } catch {
    initialized = false;
  }
}
