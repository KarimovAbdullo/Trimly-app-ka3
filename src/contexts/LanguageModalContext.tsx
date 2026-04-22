import { AppText } from "@/components/AppText";
import { setAppLanguage } from "@/i18n";
import { showRewarded } from "@/lib/ads";
import { useTranslation } from "react-i18next";
import React, { createContext, useContext, useMemo, useState } from "react";
import { Modal, TouchableOpacity, View } from "react-native";

type LanguageModalContextType = {
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
};

const LanguageModalContext = createContext<LanguageModalContextType | undefined>(
  undefined,
);

export function LanguageModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const { t, i18n } = useTranslation();

  const value = useMemo(
    () => ({
      openLanguageModal: () => setVisible(true),
      closeLanguageModal: () => setVisible(false),
    }),
    [],
  );

  const onSelect = async (lang: "en" | "ru" | "uz") => {
    if (lang === i18n.language) {
      setVisible(false);
      return;
    }
    setVisible(false);
    const apply = async () => {
      await setAppLanguage(lang);
    };
    const shown = await showRewarded(() => {
      void apply();
    });
    if (!shown) {
      await apply();
    }
  };

  const Option = ({
    lang,
    label,
  }: {
    lang: "en" | "ru" | "uz";
    label: string;
  }) => (
    <TouchableOpacity
      onPress={() => onSelect(lang)}
      activeOpacity={0.8}
      style={{
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor:
          i18n.language === lang ? "rgba(124,58,237,0.8)" : "rgba(148,163,184,0.45)",
        backgroundColor:
          i18n.language === lang ? "rgba(124,58,237,0.16)" : "rgba(255,255,255,0.04)",
        marginTop: 8,
      }}
    >
      <AppText size={15} weight="semibold" color="#F8FAFC">
        {label}
      </AppText>
    </TouchableOpacity>
  );

  return (
    <LanguageModalContext.Provider value={value}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(2,6,23,0.75)",
            justifyContent: "center",
            paddingHorizontal: 22,
          }}
        >
          <View
            style={{
              borderRadius: 18,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.2)",
              backgroundColor: "rgba(30,41,59,0.95)",
              padding: 16,
            }}
          >
            <AppText size={22} weight="bold" color="#F8FAFC">
              {t("common.selectLanguage")}
            </AppText>
            <AppText size={14} color="#CBD5E1" style={{ marginTop: 6 }}>
              {t("common.chooseLanguage")}
            </AppText>

            <Option lang="en" label={`EN - ${t("common.english")}`} />
            <Option lang="ru" label={`RU - ${t("common.russian")}`} />
            <Option lang="uz" label={`UZ - ${t("common.uzbek")}`} />

            <TouchableOpacity
              onPress={() => setVisible(false)}
              activeOpacity={0.85}
              style={{
                marginTop: 14,
                alignItems: "center",
                justifyContent: "center",
                height: 42,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(148,163,184,0.35)",
              }}
            >
              <AppText size={14} weight="semibold" color="#E2E8F0">
                {t("common.cancel")}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LanguageModalContext.Provider>
  );
}

export function useLanguageModal() {
  const ctx = useContext(LanguageModalContext);
  if (!ctx) {
    throw new Error("useLanguageModal must be used inside LanguageModalProvider");
  }
  return ctx;
}

