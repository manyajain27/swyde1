import { Stack } from "expo-router";
import '@/global.css'
import { AuthProvider } from "@/context/AuthProvider";
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, Text, TextInput } from "react-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

// Type augmentation for defaultProps
declare module 'react-native' {
  interface TextProps {
    style?: { fontFamily?: string };
  }
  interface TextInputProps {
    style?: { fontFamily?: string };
  }
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'SignikaNegative-Bold': require('../assets/fonts/SignikaNegative-Bold.ttf'),
    'SignikaNegative-Light': require('../assets/fonts/SignikaNegative-Light.ttf'),
    'SignikaNegative-Medium': require('../assets/fonts/SignikaNegative-Medium.ttf'),
    'SignikaNegative-Regular': require('../assets/fonts/SignikaNegative-Regular.ttf'),
    'SignikaNegative-SemiBold': require('../assets/fonts/SignikaNegative-SemiBold.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Urbanist-Medium': require('../assets/fonts/Urbanist-Medium.ttf'),
    'OpenSans-Medium': require('../assets/fonts/OpenSans/OpenSans-Medium.ttf'),
    'OpenSans-Regular': require('../assets/fonts/OpenSans/OpenSans-Regular.ttf'),
    'OpenSans-SemiBold': require('../assets/fonts/OpenSans/OpenSans-SemiBold.ttf'),
    'OpenSans-Bold': require('../assets/fonts/OpenSans/OpenSans-Bold.ttf'),
    'OpenSans-Light': require('../assets/fonts/OpenSans/OpenSans-Light.ttf'),
    'OpemSans_Condensed-Medium': require('../assets/fonts/OpenSans/OpenSans_Condensed-Medium.ttf'),
    'MuseoSans-Light': require('../assets/fonts/MuseoSansRounded100.otf'),
    'MuseoSans-Regular': require('../assets/fonts/MuseoSansRounded300.otf'),
    'MuseoSans-Medium': require('../assets/fonts/MuseoSansRounded700.otf'),
    'MuseoSans-Bold': require('../assets/fonts/MuseoSansRounded900.otf'),
    'MuseoSans-ExtraBold': require('../assets/fonts/MuseoSansRounded1000.otf'),

  });

  useEffect(() => {
    if (fontsLoaded) {
      // Set default for Text
      const originalTextRender = Text.render;
      Text.render = function (props, ref) {
        const mergedStyle = Array.isArray(props.style)
          ? [{ fontFamily: 'MuseoSans-Medium' }, ...props.style]
          : { fontFamily: 'MuseoSans-Medium', ...props.style };
        return originalTextRender.call(this, { ...props, style: mergedStyle }, ref);
      };

      // Set default for TextInput
      const originalTextInputRender = TextInput.render;
      TextInput.render = function (props, ref) {
        const mergedStyle = Array.isArray(props.style)
          ? [{ fontFamily: 'MuseoSans-Medium' }, ...props.style]
          : { fontFamily: 'MuseoSans-Medium', ...props.style };
        return originalTextInputRender.call(this, { ...props, style: mergedStyle }, ref);
      };
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync("lightgray");
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack screenOptions={{ 
          headerShown: false
         }}>
          <Stack.Screen name="index"/>
          <Stack.Screen name="onboarding"/>
          <Stack.Screen name="(auth)"/>
          <Stack.Screen name="(tabs)"/>
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}