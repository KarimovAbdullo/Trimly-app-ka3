import {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";

import { AD_UNIT_IDS } from "./config";

let ad: RewardedAd | null = null;
let isLoaded = false;
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
  ad = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
    requestNonPersonalizedAdsOnly: false,
  });
  isLoaded = false;

  unsubscribers.push(
    ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
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

export function preloadRewarded(): void {
  if (!ad) createAndLoad();
}

export function isRewardedReady(): boolean {
  return Boolean(ad) && isLoaded;
}

export async function showRewarded(
  onReward: () => void,
): Promise<boolean> {
  if (!ad || !isLoaded) {
    preloadRewarded();
    return false;
  }
  return new Promise<boolean>((resolve) => {
    let earned = false;
    let resolved = false;
    const finish = (success: boolean) => {
      if (resolved) return;
      resolved = true;
      if (earned) onReward();
      cleanupListeners();
      ad = null;
      isLoaded = false;
      preloadRewarded();
      resolve(success);
    };

    unsubscribers.push(
      ad!.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      }),
    );
    unsubscribers.push(
      ad!.addAdEventListener(AdEventType.CLOSED, () => finish(earned)),
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
