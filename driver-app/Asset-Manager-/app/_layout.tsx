import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, Redirect, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AppProvider } from "@/lib/app-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import UrgentOverlay from "@/components/UrgentOverlay";
import Colors from "@/constants/colors";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.white }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const inAuthGroup = segments[0] === "(tabs)" || segments[0] === "delivery-proof" || segments[0] === "exception" || segments[0] === "fuel-log" || segments[0] === "profile" || segments[0] === "settings" || segments[0] === "urgent-order";
  const inUnauthGroup = segments[0] === "welcome" || segments[0] === "login" || segments[0] === "signup";

  if (!user && inAuthGroup) {
    return <Redirect href="/welcome" />;
  }

  if (user && (inUnauthGroup || segments.length === 0)) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <AppProvider>
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="delivery-proof"
          options={{
            title: "Address Reached",
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
          }}
        />
        <Stack.Screen
          name="exception"
          options={{
            title: "Report Exception",
            headerTintColor: Colors.danger,
            headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
          }}
        />
        <Stack.Screen
          name="fuel-log"
          options={{
            title: "Fuel Stop Reached",
            headerTintColor: Colors.orange,
            headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: "Profile",
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
            headerTintColor: Colors.primary,
            headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
          }}
        />
        <Stack.Screen
          name="urgent-order"
          options={{
            title: "Urgent Order",
            headerTintColor: Colors.danger,
            headerTitleStyle: { fontFamily: "Inter_600SemiBold" },
          }}
        />
      </Stack>
      {user && <UrgentOverlay />}
    </AppProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <AuthProvider>
              <RootLayoutNav />
            </AuthProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
