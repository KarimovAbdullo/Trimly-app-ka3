import { AppText } from "@/components/AppText";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { refreshDailyFood, setTodayFoodItems } from "@/store/slices/foodSlice";
import type { FoodHistoryItem, FoodItemLog } from "@/utils/foodStorage";
import { FoodBottomBar } from "./components/FoodBottomBar";
import { FoodHeader } from "./components/FoodHeader";
import { FoodManualForm } from "./components/FoodManualForm";
import { FoodNoResults } from "./components/FoodNoResults";
import { FoodSearchBar } from "./components/FoodSearchBar";
import { FoodSearchResultsList } from "./components/FoodSearchResultsList";
import { FoodSelectedFoodsList } from "./components/FoodSelectedFoodsList";
import { styles } from "./FoodScreen.styles";
import type { FilteredFood, FoodEntry, SelectedFood } from "./FoodScreenTypes";

type FoodEntry3Lang = {
  unit: string;
  calories: number;
  category?: string;
  name_uz: string;
  name_en: string;
  name_ru: string;
};

const foodData3Lang: FoodEntry3Lang[] = require("../../app/foods_3lang.json");

export default function FoodScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchInputRef = useRef<TextInput>(null);

  const [query, setQuery] = useState("");
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualCalories, setManualCalories] = useState("");
  const [selectedById, setSelectedById] = useState<
    Record<string, SelectedFood>
  >({});
  const dispatch = useAppDispatch();
  const history = useAppSelector((s) => s.food.history) as FoodHistoryItem[];
  const currentItems = useAppSelector(
    (s) => s.food.currentItems,
  ) as FoodItemLog[];

  const foodNameKey: "name_uz" | "name_en" | "name_ru" = useMemo(() => {
    if (i18n.language.startsWith("ru")) return "name_ru";
    if (i18n.language.startsWith("en")) return "name_en";
    return "name_uz";
  }, [i18n.language]);

  const safeFoodData: FoodEntry[] = useMemo(
    () =>
      Array.isArray(foodData3Lang)
        ? foodData3Lang
            .filter(
              (it): it is FoodEntry3Lang =>
                !!it &&
                typeof (it as any).unit === "string" &&
                typeof (it as any).calories === "number" &&
                typeof (it as any).name_uz === "string",
            )
            .map((it) => ({
              name: String(it[foodNameKey] || it.name_uz).trim(),
              unit: it.unit,
              calories: it.calories,
              category: it.category,
            }))
        : [],
    [foodNameKey],
  );

  const searchResults = useMemo<FilteredFood[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return safeFoodData
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => item.name.toLowerCase().startsWith(q))
      .slice(0, 12);
  }, [query, safeFoodData]);

  const selectedFoods = useMemo<SelectedFood[]>(
    () =>
      Object.values(selectedById)
        .filter((x) => x.qty > 0)
        .sort((a, b) => a.item.name.localeCompare(b.item.name)),
    [selectedById],
  );

  const totalKcal = useMemo(
    () => selectedFoods.reduce((sum, x) => sum + x.item.calories * x.qty, 0),
    [selectedFoods],
  );

  const didRestoreRef = useRef(false);
  useEffect(() => {
    if (didRestoreRef.current) return;
    didRestoreRef.current = true;

    const restored: Record<string, SelectedFood> = {};
    for (const item of currentItems) {
      restored[item.id] = {
        id: item.id,
        item: {
          name: item.name,
          unit: item.unit,
          calories: item.calories,
          category: "saved",
        },
        qty: item.qty,
      };
    }
    setSelectedById(restored);
    dispatch(refreshDailyFood());
  }, [currentItems, dispatch]);

  useEffect(() => {
    const items: FoodItemLog[] = Object.values(selectedById).map((x) => ({
      id: x.id,
      name: x.item.name,
      unit: x.item.unit,
      calories: x.item.calories,
      qty: x.qty,
    }));
    dispatch(setTodayFoodItems(items));
  }, [selectedById, dispatch]);

  const setQty = (id: string, delta: number) => {
    Keyboard.dismiss();
    setSelectedById((prev) => {
      const existing = prev[id];
      if (!existing) return prev;
      const nextQty = Math.max(0, existing.qty + delta);
      if (nextQty === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: { ...existing, qty: nextQty } };
    });
  };

  const removeFoodItem = (id: string) => {
    Keyboard.dismiss();
    setSelectedById((prev) => {
      if (!prev[id]) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const addFromSearch = (originalIndex: number) => {
    const item = safeFoodData[originalIndex];
    if (!item) return;
    const id = `db-${originalIndex}`;
    setSelectedById((prev) => {
      const existing = prev[id];
      return {
        ...prev,
        [id]: existing
          ? { ...existing, qty: existing.qty + 1 }
          : { id, item, originalIndex, qty: 1 },
      };
    });
    setQuery("");
    setShowManualForm(false);
  };

  const addManualFood = () => {
    const name = manualName.trim();
    const calories = Number(manualCalories);
    if (!name || !Number.isFinite(calories) || calories <= 0) return;

    const id = `manual-${Date.now()}`;
    const item: FoodEntry = {
      name,
      unit: "1 serving",
      calories: Math.round(calories),
      category: "manual",
    };

    setSelectedById((prev) => ({
      ...prev,
      [id]: { id, item, qty: 1 },
    }));

    setManualName("");
    setManualCalories("");
    setShowManualForm(false);
    setQuery("");
    Keyboard.dismiss();
  };

  const hasSearch = query.trim().length > 0;
  const showNoResults =
    hasSearch && searchResults.length === 0 && !showManualForm;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <LinearGradient
        colors={["#2A1569", "#4B1FA8", "#5B21B6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bg}
      />

      <View style={styles.container}>
        <FoodHeader
          onBackPress={() => router.back()}
          onHistoryPress={() => setIsHistoryVisible(true)}
        >
          <FoodSearchBar
            query={query}
            setQuery={(v) => {
              setQuery(v);
              if (showManualForm) setShowManualForm(false);
            }}
            searchInputRef={searchInputRef}
          />
        </FoodHeader>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.screenContent}
        >
          {hasSearch && searchResults.length > 0 && (
            <FoodSearchResultsList
              results={searchResults}
              onAdd={addFromSearch}
            />
          )}

          {showNoResults && (
            <FoodNoResults onAddManually={() => setShowManualForm(true)} />
          )}

          {showManualForm && (
            <FoodManualForm
              name={manualName}
              calories={manualCalories}
              onChangeName={setManualName}
              onChangeCalories={setManualCalories}
              onAdd={addManualFood}
            />
          )}

          <AppText
            size={22}
            weight="semibold"
            color="#F9FAFB"
            style={styles.todayTitle}
          >
            {t("food.todayFoods", "Today's Foods")}
          </AppText>

          {selectedFoods.length === 0 ? (
            <AppText
              size={14}
              color="rgba(229,231,235,0.8)"
              style={styles.placeholderText}
            >
              {t("food.noFoodsYet", "No foods added yet. Search and tap Add.")}
            </AppText>
          ) : (
            <FoodSelectedFoodsList
              selectedFoods={selectedFoods}
              onInc={(id) => setQty(id, 1)}
              onDec={(id) => setQty(id, -1)}
              onDelete={removeFoodItem}
            />
          )}
        </ScrollView>

        <FoodBottomBar
          totalKcal={totalKcal}
          onAddFoodPress={() => {
            setQuery("");
            setShowManualForm(false);
            searchInputRef.current?.focus();
          }}
        />
      </View>

      <Modal
        visible={isHistoryVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsHistoryVisible(false)}
      >
        <View style={styles.historyModalOverlay}>
          <View style={styles.historyModalCard}>
            <AppText size={22} weight="bold" color="#F9FAFB">
              {t("food.historyTitle", "Food History")}
            </AppText>
            <ScrollView
              style={styles.historyModalScroll}
              contentContainerStyle={styles.historyModalContent}
              showsVerticalScrollIndicator={false}
            >
              {history.length === 0 ? (
                <AppText size={14} color="#CBD5E1">
                  {t("food.noHistory", "No previous food history yet.")}
                </AppText>
              ) : (
                history
                  .slice()
                  .reverse()
                  .map((day) => (
                    <View key={day.date} style={styles.historyCard}>
                      <AppText size={14} weight="semibold" color="#E5E7EB">
                        {moment(day.date, "YYYY-MM-DD").format("DD/MM/YYYY")}
                      </AppText>
                      <AppText
                        size={12}
                        color="#CBD5E1"
                        style={{ marginTop: 2 }}
                      >
                        {t("food.totalLabel", "Total")}: {Math.round(day.totalCalories)} kcal
                      </AppText>
                      <AppText
                        size={12}
                        color="#9CA3AF"
                        style={{ marginTop: 8 }}
                      >
                        {t("food.foodsLabel", "Foods")}:
                      </AppText>
                      {day.items.map((item) => (
                        <AppText
                          key={`${day.date}-${item.id}`}
                          size={12}
                          color="#E2E8F0"
                        >
                          - {item.name} ({item.qty}x {item.unit})
                        </AppText>
                      ))}
                    </View>
                  ))
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsHistoryVisible(false)}
              activeOpacity={0.85}
            >
              <AppText size={16} weight="bold" color="#F9FAFB">
                {t("common.close")}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
