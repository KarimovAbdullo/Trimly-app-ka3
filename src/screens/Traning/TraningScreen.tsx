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
import {
  getTodayUnlockedExercises,
  unlockExerciseForToday,
} from "@/utils/trainingUnlockStorage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { showRewarded } from "@/lib/ads";

export default function TraningScreen() {
  const { t } = useTranslation();
  const profile = useAppSelector((s) => s.profile);
  const trainingProgress = useAppSelector((s) => s.trainingProgress);
  const [activeExercise, setActiveExercise] =
    useState<TrainingExerciseDef | null>(null);
  const [pendingUnlockExercise, setPendingUnlockExercise] =
    useState<TrainingExerciseDef | null>(null);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [unlockedByAd, setUnlockedByAd] = useState<
    Partial<Record<TrainingExerciseId, boolean>>
  >({
    squat: true,
    press: false,
    pushup: false,
  });

  useEffect(() => {
    let mounted = true;
    void getTodayUnlockedExercises().then((state) => {
      if (!mounted) return;
      setUnlockedByAd(state);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectExercise = useCallback(
    (exercise: TrainingExerciseDef) => {
      if (exercise.id === "squat" || unlockedByAd[exercise.id]) {
        setActiveExercise(exercise);
        return;
      }
      setPendingUnlockExercise(exercise);
      setUnlockModalVisible(true);
    },
    [unlockedByAd],
  );

  const closeUnlockModal = useCallback(() => {
    setUnlockModalVisible(false);
    setPendingUnlockExercise(null);
  }, []);

  const handleWatchAdToUnlock = useCallback(() => {
    if (!pendingUnlockExercise) return;
    void showRewarded(() => {
      const exerciseId = pendingUnlockExercise.id;
      void unlockExerciseForToday(exerciseId);
      setUnlockedByAd((prev) => ({
        ...prev,
        [exerciseId]: true,
      }));
      setActiveExercise(pendingUnlockExercise);
      setUnlockModalVisible(false);
      setPendingUnlockExercise(null);
    });
  }, [pendingUnlockExercise]);

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
        <TrainingExercisePicker
          exercises={exercises}
          onSelect={handleSelectExercise}
          unlockedByAd={unlockedByAd}
        />
      )}

      <Modal
        visible={unlockModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeUnlockModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t("training.unlock.title")}</Text>
            <Text style={styles.modalText}>{t("training.unlock.message")}</Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.watchAdButton}
                onPress={handleWatchAdToUnlock}
              >
                <Text style={styles.watchAdButtonText}>
                  {t("training.unlock.watchAd")}
                </Text>
              </Pressable>
              <Pressable style={styles.cancelButton} onPress={closeUnlockModal}>
                <Text style={styles.cancelButtonText}>
                  {t("common.cancel")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0a0618" },
  safe: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.8)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalBox: {
    width: "100%",
    borderRadius: 18,
    backgroundColor: "rgba(30,41,59,0.98)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.35)",
    padding: 16,
  },
  modalTitle: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
  },
  modalText: {
    marginTop: 10,
    color: "#CBD5E1",
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    marginTop: 16,
    gap: 10,
  },
  watchAdButton: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
  },
  watchAdButtonText: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelButton: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.45)",
    backgroundColor: "rgba(15,23,42,0.6)",
  },
  cancelButtonText: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "700",
  },
});
