import BackIcon2 from "@/assets/icons/BackIcon2";
import { AppText } from "@/components/AppText";
import { CustomSwitch } from "@/components/CustomSwitch";
import { SelectInput, type SelectOption } from "@/components/SelectInput";
import {
  pickRandomMeal,
  type AgeGroup,
  type Disease,
  type Goal,
  type Lang,
  type MealPlan,
  type MealTime,
} from "@/data/mealPlans";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { preloadRewarded, showRewarded } from "@/lib/ads";
import { MealResultCard } from "./MealResultCard";

export default function GenerateMealScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [disease, setDisease] = useState<Disease | null>(null);
  const [mealTime, setMealTime] = useState<MealTime | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [vegetarian, setVegetarian] = useState(false);
  const [result, setResult] = useState<MealPlan | null>(null);
  const [error, setError] = useState<string>("");

  const lang: Lang = useMemo(() => {
    const code = i18n.language;
    if (code.startsWith("ru")) return "ru";
    if (code.startsWith("en")) return "en";
    return "uz";
  }, [i18n.language]);

  const goalOptions: SelectOption[] = [
    { value: "lose", label: t("mealPlan.goalLose"), emoji: "📉" },
    { value: "gain", label: t("mealPlan.goalGain"), emoji: "📈" },
    { value: "maintain", label: t("mealPlan.goalMaintain"), emoji: "⚖️" },
  ];

  const diseaseOptions: SelectOption[] = [
    { value: "none", label: t("mealPlan.diseaseNone"), emoji: "✅" },
    { value: "diabetes", label: t("mealPlan.diseaseDiabetes"), emoji: "🩸" },
    {
      value: "hypertension",
      label: t("mealPlan.diseaseHypertension"),
      emoji: "❤️",
    },
    { value: "gastritis", label: t("mealPlan.diseaseGastritis"), emoji: "🫃" },
    { value: "heart", label: t("mealPlan.diseaseHeart"), emoji: "💓" },
    { value: "obesity", label: t("mealPlan.diseaseObesity"), emoji: "⚠️" },
    { value: "thyroid", label: t("mealPlan.diseaseThyroid"), emoji: "🦋" },
  ];

  const mealTimeOptions: SelectOption[] = [
    { value: "breakfast", label: t("mealPlan.mealTimeBreakfast"), emoji: "🌅" },
    { value: "lunch", label: t("mealPlan.mealTimeLunch"), emoji: "🌞" },
    { value: "dinner", label: t("mealPlan.mealTimeDinner"), emoji: "🌙" },
  ];

  const ageOptions: SelectOption[] = [
    { value: "teen", label: t("mealPlan.ageTeen"), emoji: "🧒" },
    { value: "young", label: t("mealPlan.ageYoung"), emoji: "🧑" },
    { value: "senior", label: t("mealPlan.ageSenior"), emoji: "🧓" },
  ];

  const generatePlan = useCallback(() => {
    setError("");
    if (!goal || !disease || !mealTime || !ageGroup) {
      setError(t("mealPlan.missingFields"));
      setResult(null);
      return;
    }
    const picked = pickRandomMeal({
      goal,
      disease,
      mealTime,
      ageGroup,
      vegetarian,
    });
    if (!picked) {
      setError(t("mealPlan.noMatch"));
      setResult(null);
      return;
    }
    setResult(picked);
  }, [goal, disease, mealTime, ageGroup, vegetarian, t]);

  const handleGenerateWithAd = useCallback(() => {
    setError("");
    void showRewarded(() => {
      generatePlan();
    }).then((shown) => {
      if (!shown) {
        setError(t("mealPlan.adRequired"));
      }
      preloadRewarded();
    });
  }, [generatePlan, t]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0B0620", "#1B1033", "#312E81"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <BackIcon2 />
          </TouchableOpacity>
          <AppText
            size={20}
            weight="bold"
            color="#F9FAFB"
            style={styles.headerTitle}
          >
            {t("mealPlan.screenTitle")}
          </AppText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AppText size={13} color="#CBD5E1" style={styles.intro}>
            {t("mealPlan.screenIntro")}
          </AppText>

          <View style={styles.formCard}>
            <SelectInput
              label={t("mealPlan.goalLabel")}
              placeholder={t("mealPlan.goalPlaceholder")}
              value={goal}
              options={goalOptions}
              onSelect={(v) => setGoal(v as Goal)}
            />
            <SelectInput
              label={t("mealPlan.diseaseLabel")}
              placeholder={t("mealPlan.diseasePlaceholder")}
              value={disease}
              options={diseaseOptions}
              onSelect={(v) => setDisease(v as Disease)}
            />
            <SelectInput
              label={t("mealPlan.mealTimeLabel")}
              placeholder={t("mealPlan.mealTimePlaceholder")}
              value={mealTime}
              options={mealTimeOptions}
              onSelect={(v) => setMealTime(v as MealTime)}
            />
            <SelectInput
              label={t("mealPlan.ageLabel")}
              placeholder={t("mealPlan.agePlaceholder")}
              value={ageGroup}
              options={ageOptions}
              onSelect={(v) => setAgeGroup(v as AgeGroup)}
            />

            <View style={styles.switchRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <AppText size={14} weight="semibold" color="#F9FAFB">
                  🌱 {t("mealPlan.vegetarianLabel")}
                </AppText>
                <AppText size={12} color="#94A3B8" style={{ marginTop: 2 }}>
                  {t("mealPlan.vegetarianHint")}
                </AppText>
              </View>
              <CustomSwitch value={vegetarian} onChange={setVegetarian} />
            </View>
          </View>

          {error ? (
            <AppText size={13} color="#FCA5A5" style={styles.errorText}>
              {error}
            </AppText>
          ) : null}

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleGenerateWithAd}
            style={styles.ctaWrap}
          >
            <LinearGradient
              colors={["#7C3AED", "#A855F7", "#C026D3"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.cta}
            >
              <AppText size={16} weight="bold" color="#FFFFFF">
                🎬 {t("mealPlan.generateWatchAd")}
              </AppText>
            </LinearGradient>
          </TouchableOpacity>

          {result ? (
            <>
              <MealResultCard
                meal={result}
                lang={lang}
                onRegenerate={handleGenerateWithAd}
              />
            </>
          ) : null}

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0B0620" },
  bg: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: { width: 44, height: 44 },
  headerTitle: { flex: 1, textAlign: "center" },
  scroll: {
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  intro: {
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
  },
  formCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(18,8,31,0.55)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.28)",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  errorText: {
    textAlign: "center",
    marginTop: 14,
  },
  ctaWrap: {
    marginTop: 18,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  cta: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
