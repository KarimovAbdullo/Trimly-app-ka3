import { TrainingCameraSession } from "@/components/Training/TrainingCameraSession";
import { TrainingExercisePicker } from "@/components/Training/TrainingExercisePicker";
import {
  TRAINING_EXERCISES,
  type TrainingExerciseDef,
  type TrainingExerciseId,
} from "@/constants/trainingExercises";
import { useAppSelector } from "@/store/hooks";
import {
  sessionsUntilNextBonus,
  startingReps,
  todayTargetReps,
} from "@/utils/trainingProgression";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";

export default function TraningScreen() {
  const { t } = useTranslation();
  const profile = useAppSelector((s) => s.profile);
  const trainingProgress = useAppSelector((s) => s.trainingProgress);
  const [activeExercise, setActiveExercise] =
    useState<TrainingExerciseDef | null>(null);

  const progressionInputs = useMemo(
    () => ({
      age: profile?.age,
      gender: profile?.gender,
      heightCm: profile?.heightCm,
      weightKg: profile?.weightKg,
    }),
    [profile?.age, profile?.gender, profile?.heightCm, profile?.weightKg],
  );

  const exercises = useMemo(() => {
    return TRAINING_EXERCISES.map((ex) => {
      const id = ex.id as TrainingExerciseId;
      const streak = trainingProgress[id]?.streak ?? 0;
      const reps = todayTargetReps(id, progressionInputs, streak);
      const base = startingReps(id, progressionInputs);
      const sessionsLeft = sessionsUntilNextBonus(streak);

      const localizedTitle =
        ex.id === "squat"
          ? t("training.exercises.squat")
          : ex.id === "press"
            ? t("training.exercises.crunch")
            : t("training.exercises.pushup");
      const localizedBadge =
        ex.id === "squat"
          ? t("training.exercises.set1")
          : ex.id === "press"
            ? t("training.exercises.set2")
            : t("training.exercises.set3");
      const localizedHint =
        ex.id === "squat"
          ? t("training.exercises.hintSquat")
          : ex.id === "press"
            ? t("training.exercises.hintPress")
            : t("training.exercises.hintPushup");

      return {
        ...ex,
        title: localizedTitle,
        badge: localizedBadge,
        hint: localizedHint,
        targetReps: reps,
        subtitle: `${reps} ${t("training.reps")}`,
        // extra fields for UI (read in picker)
        streak,
        sessionsUntilNext: sessionsLeft,
        baseReps: base,
      };
    });
  }, [progressionInputs, t, trainingProgress]);

  const handleCloseSession = useCallback(() => {
    setActiveExercise(null);
  }, []);

  return (
    <View style={styles.root}>
      {activeExercise ? (
        <TrainingCameraSession
          key={activeExercise.id}
          exercise={activeExercise}
          onClose={handleCloseSession}
        />
      ) : (
        <TrainingExercisePicker exercises={exercises} onSelect={setActiveExercise} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0618" },
  safe: { flex: 1 },
});
