import { AdEventType, InterstitialAd } from "react-native-google-mobile-ads";

import { AD_FREQUENCY, AD_UNIT_IDS } from "./config";

let ad: InterstitialAd | null = null;
let isLoaded = false;
let lastShownAt = 0;
let unsubscribers: Array<() => void> = [];

function cleanupListeners() {
  unsubscribers.forEach((u) => {
    try {
      u();
    } catch {}
  });
  unsubscribers = [];
}

function createAndLoad() {
  cleanupListeners();
  ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
    requestNonPersonalizedAdsOnly: false,
  });
  isLoaded = false;

  unsubscribers.push(
    ad.addAdEventListener(AdEventType.LOADED, () => {
      isLoaded = true;
    }),
  );
  unsubscribers.push(
    ad.addAdEventListener(AdEventType.ERROR, () => {
      isLoaded = false;
      ad = null;
    }),
  );

  try {
    ad.load();
  } catch {
    isLoaded = false;
    ad = null;
  }
}

export function preloadInterstitial(): void {
  if (!ad) createAndLoad();
}

export function isInterstitialOnCooldown(): boolean {
  return Date.now() - lastShownAt < AD_FREQUENCY.interstitialMinIntervalMs;
}

export async function tryShowInterstitial(): Promise<boolean> {
  if (isInterstitialOnCooldown()) return false;
  if (!ad || !isLoaded) {
    preloadInterstitial();
    return false;
  }
  return new Promise<boolean>((resolve) => {
    let resolved = false;
    const finish = (shown: boolean) => {
      if (resolved) return;
      resolved = true;
      cleanupListeners();
      ad = null;
      isLoaded = false;
      preloadInterstitial();
      resolve(shown);
    };

    unsubscribers.push(
      ad!.addAdEventListener(AdEventType.CLOSED, () => {
        lastShownAt = Date.now();
        finish(true);
      }),
    );
    unsubscribers.push(
      ad!.addAdEventListener(AdEventType.ERROR, () => finish(false)),
    );

    try {
      void ad!.show();
    } catch {
      finish(false);
    }
  });
}
