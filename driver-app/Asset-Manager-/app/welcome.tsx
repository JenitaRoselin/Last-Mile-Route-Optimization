import React from "react";
import { StyleSheet, Text, View, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1a2a4a", "#1e3a5f", "#2563EB"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={[styles.content, { paddingTop: insets.top + 60 + webTopInset, paddingBottom: insets.bottom + 40 + webBottomInset }]}>
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="navigate" size={48} color={Colors.white} />
          </View>
          <Text style={styles.appName}>FleetDrive</Text>
          <View style={styles.taglineRow}>
            <View style={styles.taglineLine} />
            <Text style={styles.tagline}>Urban Logistics</Text>
            <View style={styles.taglineLine} />
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Pressable
            style={({ pressed }) => [
              styles.getStartedBtn,
              { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
            onPress={() => router.push("/login")}
            testID="get-started-btn"
          >
            <Text style={styles.getStartedText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#1e3a5f" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: "center",
    marginTop: 80,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 28,
  },
  appName: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: 2,
    marginBottom: 12,
  },
  taglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  taglineLine: {
    width: 30,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
  },
  getStartedBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.white,
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  getStartedText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#1e3a5f",
  },
});
