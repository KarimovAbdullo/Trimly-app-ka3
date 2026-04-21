import { AppText } from "@/components/AppText";
import type { Lang, MealPlan } from "@/data/mealPlans";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type Props = {
  meal: MealPlan;
  lang: Lang;
  onRegenerate: () => void;
};

export function MealResultCard({ meal, lang, onRegenerate }: Props) {
  const { t } = useTranslation();

  const macroTotal = meal.protein + meal.carbs + meal.fats;
  const proteinPct = Math.round((meal.protein / macroTotal) * 100);
  const carbsPct = Math.round((meal.carbs / macroTotal) * 100);
  const fatsPct = Math.max(0, 100 - proteinPct - carbsPct);

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={["rgba(124,58,237,0.22)", "rgba(192,38,211,0.12)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <AppText size={11} weight="semibold" color="#A78BFA" style={styles.eyebrow}>
          {t("mealPlan.resultTitle").toUpperCase()}
        </AppText>

        <View style={styles.titleRow}>
          <AppText size={40} style={styles.emoji}>
            {meal.emoji}
          </AppText>
          <AppText
            size={20}
            weight="bold"
            color="#F9FAFB"
            style={{ flex: 1 }}
          >
            {meal.name[lang]}
          </AppText>
        </View>

        <View style={styles.caloriesBadge}>
          <AppText size={12} color="#CBD5E1">
            {t("mealPlan.caloriesLabel")}
          </AppText>
          <AppText size={26} weight="bold" color="#FACC15">
            {meal.calories}
          </AppText>
          <AppText size={11} color="#94A3B8">
            kcal
          </AppText>
        </View>

        <View style={styles.macrosRow}>
          <MacroItem
            label={t("mealPlan.proteinLabel")}
            value={`${meal.protein}g`}
            percent={proteinPct}
            color="#34D399"
          />
          <MacroItem
            label={t("mealPlan.carbsLabel")}
            value={`${meal.carbs}g`}
            percent={carbsPct}
            color="#60A5FA"
          />
          <MacroItem
            label={t("mealPlan.fatsLabel")}
            value={`${meal.fats}g`}
            percent={fatsPct}
            color="#F472B6"
          />
        </View>

        <Section title={`🧾  ${t("mealPlan.ingredientsLabel")}`}>
          {meal.ingredients.map((ing, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <AppText size={14} color="#A855F7" style={styles.bullet}>
                •
              </AppText>
              <AppText size={14} color="#E2E8F0" style={{ flex: 1 }}>
                {ing[lang]}
              </AppText>
            </View>
          ))}
        </Section>

        <Section title={`👨‍🍳  ${t("mealPlan.recipeLabel")}`}>
          <AppText size={14} color="#E2E8F0" style={styles.paragraph}>
            {meal.recipe[lang]}
          </AppText>
        </Section>

        <Section title={`💡  ${t("mealPlan.tipsLabel")}`}>
          <AppText size={14} color="#FDE68A" style={styles.paragraph}>
            {meal.tips[lang]}
          </AppText>
        </Section>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onRegenerate}
          style={styles.regenBtn}
        >
          <AppText size={14} weight="semibold" color="#A855F7">
            🔄  {t("mealPlan.tryAgain")}
          </AppText>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

function MacroItem({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: string;
  percent: number;
  color: string;
}) {
  return (
    <View style={styles.macroItem}>
      <AppText size={12} color="#CBD5E1">
        {label}
      </AppText>
      <AppText size={16} weight="bold" color="#F9FAFB">
        {value}
      </AppText>
      <View style={styles.macroTrack}>
        <View
          style={[
            styles.macroFill,
            { width: `${Math.max(4, percent)}%`, backgroundColor: color },
          ]}
        />
      </View>
      <AppText size={11} color="#94A3B8">
        {percent}%
      </AppText>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <AppText size={13} weight="bold" color="#CBD5E1" style={styles.sectionTitle}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 20,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.4)",
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  card: {
    padding: 18,
  },
  eyebrow: {
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  emoji: {
    marginRight: 12,
  },
  caloriesBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(250,204,21,0.12)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.38)",
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  macrosRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 10,
  },
  macroItem: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(15,23,42,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  macroTrack: {
    marginTop: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(148,163,184,0.25)",
    overflow: "hidden",
    marginBottom: 4,
  },
  macroFill: {
    height: "100%",
    borderRadius: 2,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 3,
  },
  bullet: {
    width: 14,
    marginTop: 1,
  },
  paragraph: {
    lineHeight: 20,
  },
  regenBtn: {
    marginTop: 18,
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.55)",
    backgroundColor: "rgba(168,85,247,0.1)",
  },
});
