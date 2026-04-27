import AsyncStorage from "@react-native-async-storage/async-storage";

import type { TrainingExerciseId } from "@/constants/trainingExercises";

const TRAINING_UNLOCKS_KEY = "training_exercise_unlocks_v1";

type UnlockState = Partial<Record<TrainingExerciseId, string>>;

function getTodayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function readUnlockState(): Promise<UnlockState> {
  const raw = await AsyncStorage.getItem(TRAINING_UNLOCKS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as UnlockState;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export async function getTodayUnlockedExercises(): Promise<
  Partial<Record<TrainingExerciseId, boolean>>
> {
  const today = getTodayKey();
  const state = await readUnlockState();
  return {
    squat: true,
    press: state.press === today,
    pushup: state.pushup === today,
  };
}

export async function unlockExerciseForToday(
  exerciseId: TrainingExerciseId,
): Promise<void> {
  const today = getTodayKey();
  const state = await readUnlockState();
  const nextState: UnlockState = {
    ...state,
    [exerciseId]: today,
  };
  await AsyncStorage.setItem(TRAINING_UNLOCKS_KEY, JSON.stringify(nextState));
}
