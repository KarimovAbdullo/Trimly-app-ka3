import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
};

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 30;
const THUMB_SIZE = 26;
const THUMB_OFFSET = (TRACK_HEIGHT - THUMB_SIZE) / 2;

export function CustomSwitch({ value, onChange, disabled }: Props) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [anim, value]);

  const thumbTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [THUMB_OFFSET, TRACK_WIDTH - THUMB_SIZE - THUMB_OFFSET],
  });

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(148,163,184,0.45)", "#A855F7"],
  });

  return (
    <Pressable
      onPress={() => !disabled && onChange(!value)}
      disabled={disabled}
      hitSlop={8}
    >
      <Animated.View
        style={[
          styles.track,
          { backgroundColor: trackColor as any },
          disabled && styles.disabled,
        ]}
      >
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX: thumbTranslate }] }]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: "center",
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  disabled: {
    opacity: 0.5,
  },
});
