import { PoseSkeletonOverlay } from "@/components/PoseSkeletonOverlay/PoseSkeletonOverlay";
import type { TrainingExerciseDef } from "@/constants/trainingExercises";
import {
  createAngleRepFsm,
  type AngleRepFsmState,
} from "@/utils/angleRepFsm";
import { buildPoseSkeletonLines } from "@/utils/buildPoseSkeletonLines";
import {
  isLikelyLyingPressPose,
  updatePressFsm,
} from "@/utils/pressCountFromPose";
import {
  averageElbowAngleDeg,
  isLikelyPushupPose,
  updatePushupFsm,
} from "@/utils/pushupCountFromPose";
import { averageKneeAngleDeg, updateSquatFsm } from "@/utils/squatCountFromPose";
import { useAppDispatch } from "@/store/hooks";
import { addFitnessRepsForExerciseDate } from "@/store/slices/dailyResultsSlice";
import { recordCompletion } from "@/store/slices/trainingProgressSlice";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Landmark } from "react-native-mediapipe";
import {
  ImageBackground,
  Linking,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Delegate,
  MediapipeCamera,
  RunningMode,
  usePoseDetection,
  type DetectionError,
  type PoseDetectionResultBundle,
  type ViewCoordinator,
} from "react-native-mediapipe";
import {
  useCameraPermission,
  useMicrophonePermission,
} from "react-native-vision-camera";
import { SafeAreaView } from "react-native-safe-area-context";

const POSE_MODEL = "pose_landmarker_lite.task";

type Props = {
  exercise: TrainingExerciseDef;
  onClose: () => void;
};

export function TrainingCameraSession({ exercise, onClose }: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicPermission,
    requestPermission: requestMicPermission,
  } = useMicrophonePermission();

  const [cameraFacing, setCameraFacing] = useState<"back" | "front">("front");
  const [overlaySize, setOverlaySize] = useState({ w: 0, h: 0 });
  const [skeleton, setSkeleton] = useState<ReturnType<
    typeof buildPoseSkeletonLines
  > | null>(null);

  const rafRef = useRef<number | null>(null);
  const pendingSkeletonRef = useRef<ReturnType<
    typeof buildPoseSkeletonLines
  > | null>(null);
  const pendingRawRef = useRef<Landmark[] | null>(null);

  const fsmRef = useRef<AngleRepFsmState>(createAngleRepFsm());
  const [repCount, setRepCount] = useState(0);
  const [repComplete, setRepComplete] = useState(false);
  const [didRequestPermission, setDidRequestPermission] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const autoClosedRef = useRef(false);

  const targetReps = exercise.targetReps;

  const resetSession = useCallback(() => {
    fsmRef.current = createAngleRepFsm();
    setRepCount(0);
    setRepComplete(false);
    autoClosedRef.current = false;
  }, []);

  const applyRepLogic = useCallback(
    (raw: Landmark[]) => {
      const fsm = fsmRef.current;
      const before = fsm.count;

      switch (exercise.id) {
        case "squat": {
          const a = averageKneeAngleDeg(raw);
          if (a != null) updateSquatFsm(fsm, a, targetReps);
          break;
        }
        case "pushup": {
          if (!isLikelyPushupPose(raw)) break;
          const a = averageElbowAngleDeg(raw);
          if (a != null) updatePushupFsm(fsm, a, targetReps);
          break;
        }
        case "press": {
          if (!isLikelyLyingPressPose(raw)) break;
          updatePressFsm(fsm, raw, targetReps);
          break;
        }
        default:
          break;
      }

      if (fsm.count !== before) {
        setRepCount(fsm.count);
        if (fsm.count >= targetReps) setRepComplete(true);
      }
    },
    [exercise.id, targetReps],
  );

  const onResults = useCallback(
    (bundle: PoseDetectionResultBundle, vc: ViewCoordinator) => {
      pendingSkeletonRef.current = buildPoseSkeletonLines(bundle, vc);
      const raw = bundle.results[0]?.landmarks?.[0];
      pendingRawRef.current = raw?.length ? raw : null;

      if (rafRef.current != null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setSkeleton(pendingSkeletonRef.current);
        const rawLandmarks = pendingRawRef.current;
        if (rawLandmarks?.length) applyRepLogic(rawLandmarks);
      });
    },
    [applyRepLogic],
  );

  const onCameraLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setOverlaySize({ w: width, h: height });
  }, []);

  useEffect(() => {
    setSkeleton(null);
    pendingSkeletonRef.current = null;
    resetSession();
  }, [cameraFacing, resetSession]);

  const onError = useCallback((err: DetectionError) => {
    console.warn("Pose detection:", err.message);
    setDetectionError(err.message ?? "unknown");
  }, []);

  const handleClose = useCallback(() => {
    if (autoClosedRef.current) return;
    autoClosedRef.current = true;
    const today = moment().format("YYYY-MM-DD");
    if (repCount > 0) {
      dispatch(
        addFitnessRepsForExerciseDate({
          date: today,
          exerciseId: exercise.id,
          reps: repCount,
        }),
      );
    }
    // Count a streak only for a full completion, not a partial stop.
    if (repCount >= targetReps) {
      dispatch(recordCompletion({ exerciseId: exercise.id, date: today }));
    }
    onClose();
  }, [dispatch, onClose, repCount, exercise.id, targetReps]);

  useEffect(() => {
    if (!repComplete) return;
    const id = setTimeout(() => {
      handleClose();
    }, 900);
    return () => clearTimeout(id);
  }, [handleClose, repComplete]);

  const solution = usePoseDetection(
    { onResults, onError },
    RunningMode.LIVE_STREAM,
    POSE_MODEL,
    {
      delegate: Delegate.CPU,
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      fpsMode: "none",
    },
  );

  const allMediaPermissionsGranted =
    hasCameraPermission && hasMicPermission;

  const requestAllMediaPermissions = useCallback(async () => {
    setDidRequestPermission(true);
    await requestCameraPermission();
    await requestMicPermission();
  }, [requestCameraPermission, requestMicPermission]);

  const handleOpenSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  useEffect(() => {
    if (allMediaPermissionsGranted || didRequestPermission) return;
    void requestAllMediaPermissions();
  }, [allMediaPermissionsGranted, didRequestPermission, requestAllMediaPermissions]);

  return (
    <ImageBackground
      source={require("@/assets/images/bb.png")}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        {!allMediaPermissionsGranted ? (
          <View style={styles.permsWrap}>
            <Text style={styles.permsTitle}>{t("trainingCamera.cameraPermissionRequired")}</Text>
            <Text style={styles.permsText}>
              {t("trainingCamera.cameraPermissionHelp")}
            </Text>
            <Pressable
              style={styles.permsBtn}
              onPress={
                didRequestPermission
                  ? () => void handleOpenSettings()
                  : () => void requestAllMediaPermissions()
              }
            >
              <Text style={styles.permsBtnText}>
                {didRequestPermission
                  ? t("trainingCamera.openSettings")
                  : t("trainingCamera.allowPermission")}
              </Text>
            </Pressable>
            <Pressable style={styles.backLink} onPress={handleClose}>
              <Text style={styles.backLinkText}>← {t("trainingCamera.exerciseList")}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cameraWrap} onLayout={onCameraLayout}>
            <Pressable style={styles.closeBtn} onPress={handleClose}>
              <Text style={styles.closeBtnText}>← {t("trainingCamera.back")}</Text>
            </Pressable>

            <MediapipeCamera
              style={styles.camera}
              solution={solution}
              activeCamera={cameraFacing}
            />
            <PoseSkeletonOverlay
              width={overlaySize.w}
              height={overlaySize.h}
              skeleton={skeleton}
            />

            <View style={styles.hud} pointerEvents="box-none">
              <View style={styles.hudCard}>
                <Text style={styles.hudLabel}>{exercise.title}</Text>
                <Text style={styles.hudCount}>
                  {Math.max(0, targetReps - repCount)}
                  <Text style={styles.hudSlash}> {t("trainingCamera.left")}</Text>
                </Text>
                {repComplete ? (
                  <Text style={styles.hudDone}>{t("trainingCamera.completed")}</Text>
                ) : (
                  <Text style={styles.hudHint}>{exercise.hint}</Text>
                )}
                {detectionError ? (
                  <Text style={styles.hudError}>⚠ {detectionError}</Text>
                ) : null}
                <Pressable
                  style={styles.resetBtn}
                  onPress={resetSession}
                  hitSlop={8}
                >
                  <Text style={styles.resetBtnText}>{t("trainingCamera.restart")}</Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              style={styles.flipBtn}
              onPress={() =>
                setCameraFacing((f) => (f === "back" ? "front" : "back"))
              }
            >
              <Text style={styles.flipBtnText}>
                {cameraFacing === "front"
                  ? t("trainingCamera.rearCamera")
                  : t("trainingCamera.frontCamera")}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  cameraWrap: { flex: 1 },
  camera: { flex: 1 },
  closeBtn: {
    position: "absolute",
    top: 8,
    left: 12,
    zIndex: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
  },
  closeBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  flipBtn: {
    position: "absolute",
    top: 8,
    right: 12,
    zIndex: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12,
  },
  flipBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  hud: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    paddingBottom: 24,
    paddingHorizontal: 16,
    pointerEvents: "box-none",
  },
  hudCard: {
    backgroundColor: "rgba(15,23,42,0.82)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.35)",
  },
  hudLabel: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  hudCount: {
    color: "#FACC15",
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -1,
  },
  hudSlash: {
    color: "#e2e8f0",
    fontSize: 28,
    fontWeight: "600",
  },
  hudDone: {
    marginTop: 8,
    color: "#4ade80",
    fontSize: 18,
    fontWeight: "700",
  },
  hudHint: {
    marginTop: 10,
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 18,
  },
  hudError: {
    marginTop: 8,
    color: "#f87171",
    fontSize: 12,
    lineHeight: 16,
  },
  resetBtn: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  resetBtnText: {
    color: "#FACC15",
    fontSize: 14,
    fontWeight: "700",
  },
  permsWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  permsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  permsText: { fontSize: 15, color: "#e2e8f0", marginBottom: 20 },
  permsBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#FACC15",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  permsBtnText: { color: "#111827", fontWeight: "700", fontSize: 16 },
  backLink: { marginTop: 24 },
  backLinkText: { color: "#c4b5fd", fontSize: 16, fontWeight: "600" },
});
