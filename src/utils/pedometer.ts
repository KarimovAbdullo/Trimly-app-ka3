import { Pedometer } from "expo-sensors";
import { Platform } from "react-native";

export type PedometerCapability = {
  available: boolean;
  granted: boolean;
};

export async function checkPedometerCapability(): Promise<PedometerCapability> {
  const available = await Pedometer.isAvailableAsync();
  if (!available) return { available: false, granted: false };

  const existing = await Pedometer.getPermissionsAsync();
  if (existing.status === "granted") return { available: true, granted: true };
  if (!existing.canAskAgain) return { available: true, granted: false };

  const perm = await Pedometer.requestPermissionsAsync();
  return { available: true, granted: perm.status === "granted" };
}

export async function startPedometer(
  onStepCount: (stepsSinceSubscribe: number) => void,
) {
  return Pedometer.watchStepCount((result) => {
    const safeSteps = Math.max(0, Math.floor(result.steps || 0));
    onStepCount(safeSteps);
  });
}

export function stopPedometer(subscription: { remove: () => void } | null) {
  subscription?.remove();
}

export async function getStepsBetweenDates(start: Date, end: Date): Promise<number> {
  if (end.getTime() <= start.getTime()) return 0;
  // expo-sensors: date-range step count is not implemented on Android (native rejection).
  if (Platform.OS === "android") {
    return 0;
  }
  try {
    const result = await Pedometer.getStepCountAsync(start, end);
    return Math.max(0, Math.floor(result.steps || 0));
  } catch {
    return 0;
  }
}
