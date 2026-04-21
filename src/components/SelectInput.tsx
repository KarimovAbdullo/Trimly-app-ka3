import { AppText } from "@/components/AppText";
import { BlurView } from "expo-blur";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export type SelectOption = {
  value: string;
  label: string;
  emoji?: string;
};

type Props = {
  label: string;
  placeholder: string;
  value: string | null;
  options: SelectOption[];
  onSelect: (value: string) => void;
};

export function SelectInput({
  label,
  placeholder,
  value,
  options,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <View style={styles.wrap}>
      <AppText size={13} weight="semibold" color="#CBD5E1" style={styles.label}>
        {label}
      </AppText>

      <TouchableOpacity
        style={styles.field}
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
      >
        <View style={styles.fieldRow}>
          {selected?.emoji ? (
            <AppText size={18} style={styles.emoji}>
              {selected.emoji}
            </AppText>
          ) : null}
          <AppText
            size={15}
            color={selected ? "#F9FAFB" : "#94A3B8"}
            style={{ flex: 1 }}
          >
            {selected ? selected.label : placeholder}
          </AppText>
          <AppText size={14} color="#A855F7">
            ▾
          </AppText>
        </View>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        </Pressable>

        <View style={styles.sheetWrap} pointerEvents="box-none">
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <AppText
              size={16}
              weight="bold"
              color="#F9FAFB"
              style={styles.sheetTitle}
            >
              {label}
            </AppText>
            <ScrollView style={{ maxHeight: 380 }}>
              {options.map((o) => {
                const isActive = o.value === value;
                return (
                  <TouchableOpacity
                    key={o.value}
                    style={[styles.option, isActive && styles.optionActive]}
                    activeOpacity={0.8}
                    onPress={() => {
                      onSelect(o.value);
                      setOpen(false);
                    }}
                  >
                    {o.emoji ? (
                      <AppText size={18} style={styles.emoji}>
                        {o.emoji}
                      </AppText>
                    ) : null}
                    <AppText
                      size={15}
                      weight={isActive ? "bold" : "regular"}
                      color={isActive ? "#F9FAFB" : "#E2E8F0"}
                      style={{ flex: 1 }}
                    >
                      {o.label}
                    </AppText>
                    {isActive ? (
                      <AppText size={16} color="#A855F7">
                        ✓
                      </AppText>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 6,
    marginLeft: 4,
  },
  field: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.35)",
    backgroundColor: "rgba(30,27,75,0.55)",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emoji: {
    marginRight: 10,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1B1033",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "rgba(167,139,250,0.35)",
  },
  sheetHandle: {
    alignSelf: "center",
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 14,
  },
  sheetTitle: {
    marginBottom: 14,
    marginLeft: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
  },
  optionActive: {
    backgroundColor: "rgba(168,85,247,0.22)",
    borderWidth: 1,
    borderColor: "rgba(168,85,247,0.55)",
  },
});
