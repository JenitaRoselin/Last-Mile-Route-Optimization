import React, { useEffect, useState } from "react";
import { StyleSheet, Pressable, View, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/lib/app-context";

export default function VoiceBotFAB() {
  const [listening, setListening] = useState(false);
  const { voiceBotMessage, clearVoiceBotMessage } = useApp();
  const pulseScale = useSharedValue(1);
  const bounceY = useSharedValue(0);
  const messageOpacity = useSharedValue(0);
  const messageScale = useSharedValue(0.8);

  useEffect(() => {
    if (listening || !!voiceBotMessage) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [listening, voiceBotMessage]);

  useEffect(() => {
    if (voiceBotMessage) {
      bounceY.value = withSequence(
        withTiming(-8, { duration: 150 }),
        withTiming(0, { duration: 150 }),
        withTiming(-4, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      messageOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
      messageScale.value = withDelay(200, withSpring(1, { damping: 14, stiffness: 150 }));

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else {
      messageOpacity.value = withTiming(0, { duration: 200 });
      messageScale.value = withTiming(0.8, { duration: 200 });
    }
  }, [voiceBotMessage]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const fabAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounceY.value }],
  }));

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageOpacity.value,
    transform: [{ scale: messageScale.value }],
  }));

  const handlePress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (voiceBotMessage) {
      clearVoiceBotMessage();
    } else {
      setListening(!listening);
    }
  };

  const isActive = listening || !!voiceBotMessage;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {!!voiceBotMessage && (
        <Animated.View style={[styles.messageBubble, messageStyle]}>
          <View style={styles.messageBubbleInner}>
            <View style={styles.messageHeader}>
              <View style={styles.voiceBotDot} />
              <Text style={styles.messageHeaderText}>Voice Bot</Text>
            </View>
            <Text style={styles.messageText}>{voiceBotMessage}</Text>
          </View>
          <View style={styles.messageTail} />
        </Animated.View>
      )}

      {isActive && (
        <Animated.View style={[styles.pulseRing, pulseStyle]} />
      )}
      {isActive && (
        <Animated.View style={[styles.pulseRingOuter, pulseStyle]} />
      )}

      <Animated.View style={fabAnimStyle}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.fab,
            isActive && styles.fabActive,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
        >
          <Ionicons
            name={isActive ? "mic" : "mic-outline"}
            size={26}
            color={Colors.white}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 999,
    alignItems: "flex-end",
  },
  messageBubble: {
    marginBottom: 12,
    maxWidth: 260,
    alignItems: "flex-end",
  },
  messageBubbleInner: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  voiceBotDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#93C5FD",
  },
  messageHeaderText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: "#93C5FD",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  messageText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.white,
    lineHeight: 19,
  },
  messageTail: {
    width: 12,
    height: 12,
    backgroundColor: Colors.primary,
    transform: [{ rotate: "45deg" }],
    marginTop: -6,
    marginRight: 16,
  },
  pulseRing: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(37, 99, 235, 0.15)",
    marginBottom: -8,
    marginRight: -8,
  },
  pulseRingOuter: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(37, 99, 235, 0.07)",
    marginBottom: -16,
    marginRight: -16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabActive: {
    backgroundColor: Colors.primaryDark,
  },
});
