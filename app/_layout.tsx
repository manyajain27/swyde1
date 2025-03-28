import { Stack } from "expo-router";
import '@/global.css'
import { AuthProvider } from "@/context/AuthProvider";
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from "react-native";
import { useEffect } from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  if(Platform.OS === 'android'){
    useEffect(() => {
      NavigationBar.setBackgroundColorAsync("lightgray")
      NavigationBar.setVisibilityAsync("hidden")
    },[])
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack
          screenOptions={{
            "headerShown": false
          }}
        >
          <Stack.Screen name="index"/>
          <Stack.Screen name="onboarding"/>
          <Stack.Screen name="(auth)"/>
          <Stack.Screen name="(tabs)"/>
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  )
}
