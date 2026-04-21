import { AppText } from "@/components/AppText";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Animated, StyleSheet, View } from "react-native";

type ProgressBarProps = {
  progressAnim: Animated.Value;
  currentMeters: number;
  goalMeters: number;
  percent: number;
  /** When set (e.g. while tracking), show live step count under the distance readout. */
  liveSteps?: number;
  formatCurrentMeters?: (meters: number) => string;
};

export function ProgressBar({
  progressAnim,
  currentMeters,
  goalMeters,
  percent,
  liveSteps,
  formatCurrentMeters = (m) => `${Math.round(m)} m`,
}: ProgressBarProps) {
  const { t } = useTranslation();
  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const remainingMeters = Math.max(0, goalMeters - currentMeters);

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <AppText size={16} weight="semibold" color="#E5E7EB">
          {t("stepTraining.todayProgress")}
        </AppText>
        <AppText size={18} weight="bold" color="#FACC15">
          {percent}%
        </AppText>
      </View>

      <View style={styles.track}>
        <Animated.View style={[styles.fillWrap, { width: widthInterpolate }]}>
          <LinearGradient
            colors={["#FFF700", "#FFD600", "#FFEA00"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.fill}
          />
        </Animated.View>
        <Animated.View style={[styles.glow, { width: widthInterpolate }]} />
      </View>

      <View style={styles.valuesRow}>
        <AppText size={30} weight="bold" color="#FACC15">
          {formatCurrentMeters(currentMeters)}
        </AppText>
        <AppText size={30} weight="semibold" color="#94A3B8">
          {goalMeters.toLocaleString()} m
        </AppText>
      </View>

      <View style={styles.detailRow}>
        <AppText size={13} color="#94A3B8">
          {t("stepTraining.walked")}:{" "}
          <AppText size={13} weight="semibold" color="#E2E8F0">
            {formatCurrentMeters(currentMeters)}
          </AppText>
        </AppText>
        <AppText size={13} color="#94A3B8">
          {t("stepTraining.remaining")}:{" "}
          <AppText size={13} weight="semibold" color="#E2E8F0">
            {formatCurrentMeters(remainingMeters)}
          </AppText>
        </AppText>
      </View>

      {typeof liveSteps === "number" ? (
        <AppText size={14} color="#94A3B8" style={styles.stepsLine}>
          {t("stepTraining.currentSteps")}:{" "}
          <AppText size={14} weight="semibold" color="#E2E8F0">
            {liveSteps.toLocaleString()}
          </AppText>
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(15,23,42,0.55)",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  track: {
    marginTop: 10,
    width: "100%",
    height: 8,
    borderRadius: 999,
    backgroundColor: "black",
    overflow: "hidden",
    position: "relative",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
  fillWrap: {
    height: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: "#FFF700",
    opacity: 0.75,
    shadowColor: "#FFF700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 15,
  },
  valuesRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stepsLine: {
    marginTop: 8,
    lineHeight: 20,
  },
});
