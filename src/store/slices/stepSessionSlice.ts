import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StepSession } from "@/utils/storage";

export type StepSessionState = StepSession | null;

const initialState: StepSessionState = null;

const stepSessionSlice = createSlice({
  name: "stepSession",
  initialState: initialState as StepSessionState,
  reducers: {
    hydrateStepSessionFromLegacy(
      _state,
      action: PayloadAction<StepSession>,
    ): StepSessionState {
      return action.payload;
    },
    startSession(
      _state,
      action: PayloadAction<{ startTimeISO: string }>,
    ): StepSessionState {
      return { startTimeISO: action.payload.startTimeISO, lastTotalSteps: 0 };
    },
    updateSessionSteps(
      state,
      action: PayloadAction<number>,
    ): StepSessionState {
      if (!state) return state;
      const next = Math.max(0, Math.floor(action.payload));
      return { ...state, lastTotalSteps: next };
    },
    clearSession(_state, _action: PayloadAction<void>): StepSessionState {
      return null;
    },
  },
});

export const {
  hydrateStepSessionFromLegacy,
  startSession,
  updateSessionSteps,
  clearSession,
} = stepSessionSlice.actions;

export default stepSessionSlice.reducer;

