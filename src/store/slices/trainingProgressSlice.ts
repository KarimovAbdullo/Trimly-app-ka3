import type { TrainingExerciseId } from "@/constants/trainingExercises";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ExerciseProgress = {
  /** Consecutive completed sessions (resets if user skips > 2 days). */
  streak: number;
  /** Best streak reached (kept for display; does not affect target). */
  bestStreak: number;
  /** Last completed session date (YYYY-MM-DD). */
  lastCompletedDate: string | null;
  /** Total sessions ever completed. */
  totalSessions: number;
};

export type TrainingProgressState = Record<
  TrainingExerciseId,
  ExerciseProgress
>;

const emptyExercise: ExerciseProgress = {
  streak: 0,
  bestStreak: 0,
  lastCompletedDate: null,
  totalSessions: 0,
};

const initialState: TrainingProgressState = {
  squat: { ...emptyExercise },
  press: { ...emptyExercise },
  pushup: { ...emptyExercise },
};

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  const diffMs = db.getTime() - da.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

const trainingProgressSlice = createSlice({
  name: "trainingProgress",
  initialState,
  reducers: {
    recordCompletion(
      state,
      action: PayloadAction<{
        exerciseId: TrainingExerciseId;
        date: string;
      }>,
    ) {
      const { exerciseId, date } = action.payload;
      const cur = state[exerciseId];
      if (!cur) return;

      // Same day → no double-count.
      if (cur.lastCompletedDate === date) return;

      // Consecutive (0-2 day gap keeps streak growing; >2 days resets).
      const gap =
        cur.lastCompletedDate != null
          ? daysBetween(cur.lastCompletedDate, date)
          : null;

      if (gap == null || gap > 2) {
        cur.streak = 1;
      } else {
        cur.streak += 1;
      }

      if (cur.streak > cur.bestStreak) cur.bestStreak = cur.streak;
      cur.lastCompletedDate = date;
      cur.totalSessions += 1;
    },
    resetExerciseProgress(
      state,
      action: PayloadAction<{ exerciseId: TrainingExerciseId }>,
    ) {
      state[action.payload.exerciseId] = { ...emptyExercise };
    },
    clearTrainingProgress() {
      return initialState;
    },
  },
});

export const {
  recordCompletion,
  resetExerciseProgress,
  clearTrainingProgress,
} = trainingProgressSlice.actions;

export default trainingProgressSlice.reducer;
