import { AppText } from "@/components/AppText";
import { useLanguageModal } from "@/contexts/LanguageModalContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearDailyResults } from "@/store/slices/dailyResultsSlice";
import { clearFoodTracking } from "@/store/slices/foodSlice";
import { clearProfile } from "@/store/slices/profileSlice";
import { clearSession } from "@/store/slices/stepSessionSlice";
import { clearTrainingProgress } from "@/store/slices/trainingProgressSlice";
import { clearWaterTracking } from "@/store/slices/waterSlice";
import { persistor } from "@/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, Modal, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./ProfileScreen.styles";

const SUPPORT_EMAIL = "6510206@mail.ru";
const SUPPORT_WHATSAPP_PHONE = "998936510206";

export function ProfileScreen() {
  const { t } = useTranslation();
  const { openLanguageModal } = useLanguageModal();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.profile);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const openEmail = () => {
    setShowSupport(false);
    void Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  const openWhatsApp = () => {
    setShowSupport(false);
    void Linking.openURL(`https://wa.me/${SUPPORT_WHATSAPP_PHONE}`);
  };

  const clearAllData = async () => {
    dispatch(clearProfile());
    dispatch(clearDailyResults());
    dispatch(clearFoodTracking());
    dispatch(clearWaterTracking());
    dispatch(clearSession(undefined as any));
    dispatch(clearTrainingProgress());
    await persistor.purge();
    await AsyncStorage.multiRemove([
      "persist:root",
      "water-tracking",
      "food-tracking",
      "health_app_user_profile_v1",
      "step_tracker_active_session_v1",
    ]);
    setShowConfirm(false);
    router.replace("/confirm");
  };

  const Item = ({ title, subtitle, onPress, danger }: any) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <AppText style={[styles.itemText, danger && styles.itemDanger]}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText style={styles.itemSubtitle}>{subtitle}</AppText>
        ) : null}
      </View>
      <AppText color="#0F172A">›</AppText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView>
          <View style={styles.header}>
            <AppText style={styles.headerTitle}>
              {profile?.name || t("profile.user")}
            </AppText>
            <AppText style={styles.headerSubtitle}>
              {profile?.age} {t("profile.yearsShort")} • {profile?.weightKg} kg
            </AppText>
          </View>

          <View style={styles.content}>
            <AppText style={styles.sectionTitle}>{t("profile.profileInfo")}</AppText>

            <View style={styles.card}>
              <AppText color="black">{t("profile.name")}: {profile?.name}</AppText>
              <AppText color="black">{t("profile.height")}: {profile?.heightCm} cm</AppText>
              <AppText color="black">{t("profile.weight")}: {profile?.weightKg} kg</AppText>
              <AppText color="black">{t("profile.gender")}: {profile?.gender}</AppText>
            </View>

            <AppText style={[styles.sectionTitle, { marginTop: 24 }]}>
              {t("profile.settings")}
            </AppText>

            <Item title={`🌐 ${t("profile.changeLanguage")}`} onPress={openLanguageModal} />
            <Item
              title={`💬 ${t("profile.contactSupport")}`}
              subtitle={t("profile.supportSubtitle")}
              onPress={() => setShowSupport(true)}
            />

            <Item
              title={`🗑 ${t("profile.clearProfile")}`}
              danger
              onPress={() => setShowConfirm(true)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={showSupport} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <AppText style={styles.modalTitle}>
              {t("profile.supportModalTitle")}
            </AppText>

            <AppText style={styles.modalText}>
              {t("profile.supportModalMessage")}
            </AppText>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnEmail]}
                onPress={openEmail}
              >
                <AppText style={[styles.btnText, styles.btnTextWhite]}>
                  ✉️  Email
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnWhatsApp]}
                onPress={openWhatsApp}
              >
                <AppText style={[styles.btnText, styles.btnTextWhite]}>
                  💬  WhatsApp
                </AppText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btn, styles.btnOutline, { marginTop: 10 }]}
              onPress={() => setShowSupport(false)}
            >
              <AppText style={styles.btnText}>{t("common.cancel")}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <AppText style={styles.modalTitle}>{t("profile.confirm")}</AppText>

            <AppText style={styles.modalText}>
              {t("profile.deleteAllData")}
            </AppText>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnOutline]}
                onPress={() => setShowConfirm(false)}
              >
                <AppText style={styles.btnText}>{t("common.cancel")}</AppText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnDanger]}
                onPress={clearAllData}
              >
                <AppText style={[styles.btnText, styles.btnTextWhite]}>
                  {t("profile.delete")}
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
