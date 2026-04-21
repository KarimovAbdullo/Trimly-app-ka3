import { ImageSourcePropType } from "react-native";

export type TrainingExerciseId = "squat" | "press" | "pushup";

export type TrainingExerciseDef = {
  id: TrainingExerciseId;
  title: string;
  subtitle: string;
  badge: string;
  targetReps: number;
  hint: string;
  iconName: "human-handsup" | "dumbbell" | "arm-flex";
  image: ImageSourcePropType;
  /** Runtime-only: current consecutive-sessions streak (0 if never completed). */
  streak?: number;
  /** Runtime-only: how many more sessions until the next +1 rep bonus. */
  sessionsUntilNext?: number;
  /** Runtime-only: personalized starting target (before progression). */
  baseReps?: number;
};

export const TRAINING_EXERCISES: TrainingExerciseDef[] = [
  {
    id: "squat",
    title: "Squat",
    subtitle: "5 reps",
    badge: "Set 1",
    targetReps: 5,
    hint: "Keep your full body visible. Go down deep, then stand up fully.",
    iconName: "human-handsup",
    image: require("@/assets/images/winxez.png"),
  },
  {
    id: "press",
    title: "Crunch",
    subtitle: `${10} reps`,
    badge: "Set 2",
    targetReps: 10,
    hint: "Lie on your side and lift your torso slightly up, then lower down.",
    iconName: "dumbbell",
    image: require("@/assets/images/press.png"),
  },
  {
    id: "pushup",
    title: "Push-up",
    subtitle: `${10} reps`,
    badge: "Set 3",
    targetReps: 10,
    hint: "Keep your body straight. Lower your chest, then push back up fully.",
    iconName: "arm-flex",
    image: require("@/assets/images/ajiman.png"),
  },
];
