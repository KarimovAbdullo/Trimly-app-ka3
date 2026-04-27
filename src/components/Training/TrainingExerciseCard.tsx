import type { TrainingExerciseDef } from "@/constants/trainingExercises";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  exercise: TrainingExerciseDef;
  onPlay: () => void;
  todayReps: number;
  completedDays: number;
  isLocked?: boolean;
};

function nth(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function TrainingExerciseCard({
  exercise,
  onPlay,
  todayReps,
  completedDays,
  isLocked = false,
}: Props) {
  const { t } = useTranslation();
  const target = Math.max(0, Math.floor(exercise.targetReps));
  const safeTarget = target > 0 ? target : 1;
  const progress = Math.max(0, Math.min(1, todayReps / safeTarget));
  const percent = Math.round(progress * 100);
  const remaining = Math.max(0, target - todayReps);

  return (
    <Pressable
      onPress={onPlay}
      style={({ pressed }) => [styles.wrap, pressed && styles.wrapPressed]}
    >
      <LinearGradient
        colors={["rgba(167, 139, 250, 0.95)", "rgba(139, 92, 246, 0.75)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderGlow}
      >
        <View style={styles.card}>
          <View style={styles.leftCol}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{exercise.badge}</Text>
            </View>
            {/* <LinearGradient
              colors={["rgba(76, 29, 149, 0.9)", "rgba(49, 46, 129, 0.95)"]}
              style={styles.iconBox}
            > */}
            {/* <MaterialCommunityIcons
                name={exercise.iconName}
                size={52}
                color="#e9d5ff"
              /> */}
            <Image source={exercise.image} style={styles.icon} />
            {/* </LinearGradient> */}
          </View>

          <View style={styles.midCol}>
            <Text style={styles.title}>{exercise.title}</Text>

            <View style={styles.stats}>
              <Text style={styles.infoLine}>
                {t("training.target")}: {target} {t("training.reps")}
              </Text>
              <Text style={styles.infoLine}>
                {t("training.today")}: {todayReps} {t("training.reps")} -{" "}
                {t("training.lastRep")}: {todayReps > 0 ? nth(todayReps) : "—"}
              </Text>
              <Text style={styles.infoLine}>
                {t("training.completedDays")}: {completedDays}
              </Text>
              {typeof exercise.streak === "number" ? (
                <Text style={styles.streakLine}>
                  🔥 {t("training.streak")}: {exercise.streak}
                  {typeof exercise.sessionsUntilNext === "number" &&
                  exercise.streak > 0
                    ? ` • ${exercise.sessionsUntilNext} ${t("training.untilNextBonus")}`
                    : ""}
                </Text>
              ) : null}

              <View
                style={styles.progressTrack}
                accessibilityLabel={`progress ${percent}%`}
              >
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>

              <Text style={styles.progressText}>
                {percent}% {t("training.doneLeft")} - {remaining}{" "}
                {t("training.left")}
              </Text>
            </View>
          </View>

          <View style={styles.rightCol}>
            {isLocked ? (
              <View style={styles.unlockBadge}>
                <Text style={styles.unlockBadgeText}>
                  {t("training.unlock.badge")}
                </Text>
              </View>
            ) : null}
            <View style={styles.playOuter}>
              <LinearGradient
                colors={["#c4b5fd", "#8b5cf6"]}
                style={styles.playRing}
              >
                <View style={styles.playInner}>
                  <MaterialCommunityIcons
                    name={isLocked ? "lock" : "play"}
                    size={20}
                    color="#1e1b4b"
                  />
                </View>
              </LinearGradient>
            </View>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 22,
    shadowColor: "#a78bfa",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  wrapPressed: { opacity: 0.92 },
  borderGlow: {
    borderRadius: 22,
    padding: 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    borderRadius: 20,
    backgroundColor: "rgba(15, 10, 35, 0.92)",
    paddingVertical: 14,
    paddingHorizontal: 12,
    minHeight: 112,
  },
  leftCol: {
    width: 100,
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    left: 0,
    zIndex: 2,
    backgroundColor: "rgba(139, 92, 246, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: "#f5f3ff",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  iconBox: {
    width: 84,
    height: 84,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  midCol: {
    flex: 1,
    paddingHorizontal: 10,
    paddingRight: 52,
    justifyContent: "center",
  },
  title: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 6,
    color: "rgba(203, 213, 225, 0.9)",
    fontSize: 12,
    fontWeight: "600",
  },
  stats: {
    marginTop: 8,
    gap: 6,
  },
  infoLine: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(226,232,240,0.9)",
  },
  streakLine: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FDE68A",
  },
  progressTrack: {
    marginTop: 2,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.28)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#4ADE80",
  },
  progressText: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(203, 213, 225, 0.88)",
  },
  rightCol: {
    position: "absolute",
    top: 10,
    right: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockBadge: {
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.6)",
    backgroundColor: "rgba(250,204,21,0.2)",
  },
  unlockBadgeText: {
    color: "#FDE68A",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  timerBox: {
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(167, 139, 250, 0.35)",
  },
  timerText: {
    color: "#e9d5ff",
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  playOuter: {},
  playRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  playInner: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f5f3ff",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 2,
  },
  icon: {
    width: 98,
    height: 98,
  },
});
