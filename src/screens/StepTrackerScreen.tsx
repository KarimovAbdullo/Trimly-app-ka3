import BackIcon2 from "@/assets/icons/BackIcon2";
import { AppText } from "@/components/AppText";
import { ProgressBar } from "@/components/ProgressBar";
import { Image } from "expo-image";
import { calculateDistance, formatDistanceMetersLive } from "@/utils/distance";
import {
  checkPedometerCapability,
  getStepsBetweenDates,
  startPedometer,
  stopPedometer,
} from "@/utils/pedometer";
import { tryShowInterstitial } from "@/lib/ads";
import { recordStepsForDate } from "@/store/slices/dailyResultsSlice";
import {
  clearSession,
  startSession,
  updateSessionSteps,
} from "@/store/slices/stepSessionSlice";
import moment from "moment";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Animated,
  AppState,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type AppStateStatus,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const GOAL_METERS = 3000;

export default function StepTrackerScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.profile);
  const stepSession = useAppSelector((s) => s.stepSession);
  const pedometerSubRef = useRef<{ remove: () => void } | null>(null);
  const sessionBaseStepsRef = useRef(0);
  const totalStepsRef = useRef(0);
  const isRunningRef = useRef(false);
  const startTimeRef = useRef<Date | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim1 = useRef(new Animated.Value(0)).current;

  const [heightCm, setHeightCm] = useState<number | undefined>(undefined);
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [deviceSupported, setDeviceSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [totalSteps, setTotalSteps] = useState(0);
  const [errorText, setErrorText] = useState("");

  const distanceMeters = useMemo(
    () => calculateDistance(totalSteps, heightCm),
    [totalSteps, heightCm],
  );
  const progress = useMemo(
    () => Math.max(0, Math.min(1, distanceMeters / GOAL_METERS)),
    [distanceMeters],
  );
  const percent = Math.round(progress * 100);

  useEffect(() => {
    totalStepsRef.current = totalSteps;
  }, [totalSteps]);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);
  useEffect(() => {
    startTimeRef.current = startTime;
  }, [startTime]);

  useEffect(() => {
    if (!isRunning || !startTime) return;
    const id = setTimeout(() => {
      dispatch(updateSessionSteps(totalSteps));
      const date = moment().format("YYYY-MM-DD");
      dispatch(recordStepsForDate({ date, steps: totalSteps }));
    }, 400);
    return () => clearTimeout(id);
  }, [dispatch, isRunning, startTime, totalSteps]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 90,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  useEffect(() => {
    if (!isRunning) {
      pulseAnim1.setValue(0);
      return;
    }

    const pulse1 = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim1, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim1, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse1.start();

    return () => {
      pulse1.stop();
    };
  }, [isRunning, pulseAnim1]);

  const attachLiveWatcher = useCallback(async (baseSteps: number) => {
    const base = Math.max(0, Math.floor(baseSteps));
    sessionBaseStepsRef.current = base;
    stopPedometer(pedometerSubRef.current);
    pedometerSubRef.current = await startPedometer((liveSteps) => {
      const merged = Math.max(0, sessionBaseStepsRef.current + liveSteps);
      setTotalSteps((prev) => (merged < prev ? prev : merged));
    });
  }, []);

  const restoreSession = useCallback(async () => {
    setHeightCm(profile?.heightCm);

    const capability = await checkPedometerCapability();
    setDeviceSupported(capability.available);
    setPermissionGranted(capability.granted);

    if (!capability.available || !capability.granted) {
      setIsReady(true);
      return;
    }

    if (!stepSession) {
      setIsRunning(false);
      setStartTime(null);
      setTotalSteps(0);
      setIsReady(true);
      return;
    }

    const savedStart = new Date(stepSession.startTimeISO);
    const steps =
      Platform.OS === "android"
        ? (stepSession.lastTotalSteps ?? 0)
        : await getStepsBetweenDates(savedStart, new Date());
    setStartTime(savedStart);
    setTotalSteps(steps);
    setIsRunning(true);
    await attachLiveWatcher(steps);
    setIsReady(true);
  }, [attachLiveWatcher, profile?.heightCm, stepSession]);

  useEffect(() => {
    void restoreSession();
    return () => {
      stopPedometer(pedometerSubRef.current);
      pedometerSubRef.current = null;
    };
  }, [restoreSession]);

  useEffect(() => {
    const sub = AppState.addEventListener(
      "change",
      async (next: AppStateStatus) => {
        if (next === "background" || next === "inactive") {
          if (isRunningRef.current && startTimeRef.current) {
            dispatch(updateSessionSteps(totalStepsRef.current));
          }
          return;
        }
        if (next !== "active") {
          return;
        }

        // When user returns from Settings, re-check permission/device capability.
        const capability = await checkPedometerCapability();
        setDeviceSupported(capability.available);
        setPermissionGranted(capability.granted);

        if (!capability.available || !capability.granted) {
          return;
        }

        if (!isRunningRef.current || !startTimeRef.current) {
          return;
        }

        const st = startTimeRef.current;
        const latest =
          Platform.OS === "android"
            ? totalStepsRef.current
            : await getStepsBetweenDates(st, new Date());
        setTotalSteps(latest);
        await attachLiveWatcher(latest);
      },
    );
    return () => sub.remove();
  }, [attachLiveWatcher]);

  const beginTracking = useCallback(async () => {
    const start = new Date();
    dispatch(startSession({ startTimeISO: start.toISOString() }));
    setStartTime(start);
    setTotalSteps(0);
    setIsRunning(true);
    await attachLiveWatcher(0);
  }, [attachLiveWatcher, dispatch]);

  const handleStart = useCallback(async () => {
    setErrorText("");
    setHeightCm(profile?.heightCm);

    // Skip redundant native permission re-check when mount already verified it.
    // Re-checking adds bridge latency and makes the Start tap feel laggy.
    if (!isReady || !deviceSupported || !permissionGranted) {
      const capability = await checkPedometerCapability();
      setDeviceSupported(capability.available);
      setPermissionGranted(capability.granted);

      if (!capability.available) {
        setErrorText(t("stepTraining.pedometerUnavailable"));
        return;
      }
      if (!capability.granted) {
        setErrorText(t("stepTraining.pedometerPermissionRequired"));
        return;
      }
    }

    Alert.alert(
      t("stepTraining.keepOpenTitle"),
      t("stepTraining.keepOpenMessage"),
      [
        { text: t("stepTraining.cancel"), style: "cancel" },
        {
          text: t("stepTraining.continue"),
          onPress: () => void beginTracking(),
        },
      ],
      { cancelable: true },
    );
  }, [
    beginTracking,
    deviceSupported,
    isReady,
    permissionGranted,
    profile?.heightCm,
    t,
  ]);

  const handleStop = async () => {
    const stepsAtStop = totalStepsRef.current;
    stopPedometer(pedometerSubRef.current);
    pedometerSubRef.current = null;
    dispatch(clearSession(undefined as any));
    setStartTime(null);
    setTotalSteps(0);
    setIsRunning(false);
    setErrorText("");

    if (stepsAtStop >= 100) {
      setTimeout(() => {
        void tryShowInterstitial();
      }, 800);
    }
  };

  const handleOpenSettings = useCallback(async () => {
    setErrorText("");
    try {
      await Linking.openSettings();
    } catch {
      setErrorText(t("stepTraining.unableOpenSettings"));
    }
  }, [t]);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#0B1022", "#121A33", "#1B2550"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <BackIcon2 />
          </TouchableOpacity>
          <AppText
            size={22}
            weight="bold"
            color="#F9FAFB"
            style={styles.headerTitle}
          >
            {t("tracker.stepTracker")}
          </AppText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.heroCenter}>
          <View style={styles.pulseWrap}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [
                    {
                      scale: pulseAnim1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.8],
                      }),
                    },
                  ],
                  opacity: pulseAnim1.interpolate({
                    inputRange: [0, 0.8, 1],
                    outputRange: [0.75, 0.18, 0],
                  }),
                },
              ]}
            />

            <View style={styles.circleInner}>
              <Image
                source={require("@/assets/images/kro.png")}
                style={styles.shoe}
                contentFit="contain"
              />
            </View>
          </View>
        </View>

        <AppText
          size={25}
          weight="bold"
          color="#F9FAFB"
          style={styles.goalText}
        >
          {t("stepTraining.goal")}:{" "}
          <AppText size={25} weight="bold" color="#FACC15">
            {GOAL_METERS.toLocaleString()} m
          </AppText>
        </AppText>

        <View style={styles.content}>
          <ProgressBar
            progressAnim={progressAnim}
            currentMeters={distanceMeters}
            goalMeters={GOAL_METERS}
            percent={percent}
            liveSteps={isRunning ? totalSteps : undefined}
            formatCurrentMeters={formatDistanceMetersLive}
          />
          {!isReady ? (
            <AppText size={14} color="#CBD5E1" style={styles.note}>
              {t("stepTraining.loading")}
            </AppText>
          ) : !deviceSupported ? (
            <AppText size={14} color="#FCA5A5" style={styles.note}>
              {t("stepTraining.deviceUnsupported")}
            </AppText>
          ) : !permissionGranted ? (
            <AppText size={14} color="#FCA5A5" style={styles.note}>
              {t("stepTraining.allowMotionPermission")}
            </AppText>
          ) : errorText ? (
            <AppText size={14} color="#FCA5A5" style={styles.note}>
              {errorText}
            </AppText>
          ) : (
            <AppText size={13} color="#CBD5E1" style={styles.note}>
              {isRunning
                ? t("stepTraining.distanceHint")
                : t("stepTraining.pressStart")}
            </AppText>
          )}

          <TouchableOpacity
            style={[
              styles.startBtn,
              isRunning ? styles.stopBtn : null,
              !isReady ? styles.disabledBtn : null,
            ]}
            activeOpacity={0.85}
            onPress={
              isRunning
                ? handleStop
                : !permissionGranted
                  ? () => void handleOpenSettings()
                  : () => void handleStart()
            }
            disabled={!isReady}
          >
            <AppText size={26} color="#111827">
              {isRunning
                ? t("stepTraining.stop")
                : !permissionGranted
                  ? t("stepTraining.allowPermission")
                  : t("stepTraining.start")}
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "transparent" },
  bg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    letterSpacing: 0.3,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  content: {
    marginTop: 12,
  },
  heroCenter: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseWrap: {
    width: 170,
    height: 170,
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 2,
    borderColor: "rgba(250,204,21,0.9)",
    shadowColor: "#FACC15",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  circleInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  shoe: {
    width: 300,
    height: 300,
  },
  goalText: {
    marginTop: 18,
    textAlign: "center",
  },
  startBtn: {
    marginTop: 18,
    width: "100%",
    borderRadius: 999,
    backgroundColor: "#FACC15",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFF700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 15,
    paddingVertical: 10,
  },
  stopBtn: {
    backgroundColor: "#F59E0B",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  note: {
    marginTop: 10,
    lineHeight: 20,
    textAlign: "center",
  },
});
