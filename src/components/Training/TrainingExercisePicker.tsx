import {
  TRAINING_EXERCISES,
  type TrainingExerciseDef,
} from "@/constants/trainingExercises";
import { useAppSelector } from "@/store/hooks";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { TrainingExerciseCard } from "./TrainingExerciseCard";
import { useMemo } from "react";

type Props = {
  onSelect: (exercise: TrainingExerciseDef) => void;
  exercises?: TrainingExerciseDef[];
};

export function TrainingExercisePicker({
  onSelect,
  exercises = TRAINING_EXERCISES,
}: Props) {
  const { t } = useTranslation();
  const usageStartDate = useAppSelector((s) => s.dailyResults.usageStartDate);
  const fitnessByExercise = useAppSelector(
    (s) => s.dailyResults.fitnessRepsByDateByExercise ?? {},
  );

  const today = moment().format("YYYY-MM-DD");

  const dates = useMemo(() => {
    const start = usageStartDate ?? today;
    const out: string[] = [];
    const cursor = moment(start, "YYYY-MM-DD");
    const endM = moment(today, "YYYY-MM-DD");
    while (cursor.isSameOrBefore(endM, "day")) {
      out.push(cursor.format("YYYY-MM-DD"));
      cursor.add(1, "day");
    }
    return out;
  }, [usageStartDate, today]);

  return (
    <LinearGradient
      colors={["#0f0720", "#1a0a2e", "#12082a"]}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{t("training.dailyExercises")}</Text>
        <Text style={styles.subheading}>
          {t("training.dailyExercisesDesc")}
        </Text>
        {exercises.map((ex) => {
          const todayReps = fitnessByExercise[today]?.[ex.id] ?? 0;
          const completedDays = dates.reduce((acc, d) => {
            const v = fitnessByExercise[d]?.[ex.id] ?? 0;
            return v > 0 ? acc + 1 : acc;
          }, 0);

          return (
            <TrainingExerciseCard
              key={ex.id}
              exercise={ex}
              todayReps={todayReps}
              completedDays={completedDays}
              onPlay={() => onSelect(ex)}
            />
          );
        })}
        <View style={{ height: 24 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: {
    paddingTop: 0,
    paddingBottom: 32,
  },
  heading: {
    marginHorizontal: 22,
    paddingTop: 30,
    marginTop: 0,
    fontSize: 32,
    fontWeight: "900",
    color: "#f8fafc",
    letterSpacing: -0.5,
  },
  subheading: {
    marginHorizontal: 22,
    marginTop: 8,
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(203, 213, 225, 0.88)",
    fontWeight: "500",
  },
});
