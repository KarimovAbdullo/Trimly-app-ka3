import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

import { LanguageModalProvider } from "@/contexts/LanguageModalContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import "@/i18n";
import { loadSavedLanguage } from "@/i18n";
import { initAdMob, preloadInterstitial, preloadRewarded } from "@/lib/ads";
import { AppProviders } from "@/store/providers";

if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("@/lib/reactotron");
}

export const unstable_settings = {
  anchor: "(tabs)",
};

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    "Fredoka-Regular": require("../assets/fonst/Fredoka-Regular.ttf"),
    "Fredoka-Medium": require("../assets/fonst/Fredoka-Medium.ttf"),
    "Fredoka-SemiBold": require("../assets/fonst/Fredoka-SemiBold.ttf"),
    "Fredoka-Bold": require("../assets/fonst/Fredoka-Bold.ttf"),
    "Fredoka-Light": require("../assets/fonst/Fredoka-Light.ttf"),
  });

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    void loadSavedLanguage();
  }, []);

  useEffect(() => {
    void initAdMob().then(() => {
      preloadInterstitial();
      preloadRewarded();
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />

      <AppProviders>
        <LanguageModalProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
          </ThemeProvider>
        </LanguageModalProvider>
      </AppProviders>
    </GestureHandlerRootView>
  );
}
