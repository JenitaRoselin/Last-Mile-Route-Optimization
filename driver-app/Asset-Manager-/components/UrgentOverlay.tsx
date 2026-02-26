import React, { useEffect } from "react";
import { StyleSheet, Text, View, Pressable, Platform, Dimensions } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  FadeIn,
  SlideInUp,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useApp } from "@/lib/app-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function UrgentOverlay() {
  const insets = useSafeAreaInsets();
  const { urgentOverlayVisible, urgentOrder, dismissUrgentOverlay, acknowledgeUrgentOrder } = useApp();

  const pulseScale = useSharedValue(1);
  const shimmerX = useSharedValue(-SCREEN_WIDTH);
  const slideY = useSharedValue(-200);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (urgentOverlayVisible) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      backdropOpacity.value = withTiming(1, { duration: 300 });
      slideY.value = withSpring(0, { damping: 18, stiffness: 120 });

      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      shimmerX.value = withRepeat(
        withTiming(SCREEN_WIDTH * 2, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      slideY.value = withTiming(-200, { duration: 200 });
      pulseScale.value = withTiming(1, { duration: 100 });
    }
  }, [urgentOverlayVisible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  const badgePulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!urgentOverlayVisible || !urgentOrder) return null;

  const handleViewDetails = () => {
    dismissUrgentOverlay();
    router.push("/urgent-order");
  };

  const handleAcknowledge = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    acknowledgeUrgentOrder();
  };

  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, backdropStyle]} pointerEvents="auto">
        <Pressable style={StyleSheet.absoluteFill} onPress={dismissUrgentOverlay} />
      </Animated.View>

      <Animated.View
        style={[styles.card, cardStyle, { marginTop: insets.top + (Platform.OS === "web" ? 67 : 10) }]}
        pointerEvents="auto"
      >
        <View style={styles.cardTopStripe} />

        <View style={styles.cardContent}>
          <View style={styles.headerRow}>
            <Animated.View style={[styles.urgentBadge, badgePulseStyle]}>
              <View style={styles.urgentDot} />
              <Text style={styles.urgentText}>URGENT</Text>
            </Animated.View>
            <Pressable
              onPress={dismissUrgentOverlay}
              hitSlop={12}
            >
              <Feather name="x" size={20} color={Colors.darkGrey} />
            </Pressable>
          </View>

          <View style={styles.iconRow}>
            <View style={styles.alertIconWrap}>
              <Ionicons name="warning" size={24} color={Colors.white} />
            </View>
            <View style={styles.alertTextWrap}>
              <Text style={styles.alertTitle}>New Urgent Order assigned by Admin!</Text>
              <Text style={styles.alertSubtext}>
                {urgentOrder.order.id} - {urgentOrder.order.customerName}
              </Text>
            </View>
          </View>

          <View style={styles.constraintRow}>
            <View style={styles.constraintItem}>
              <Feather name="package" size={14} color={Colors.textPrimary} />
              <Text style={styles.constraintLabel}>Weight</Text>
              <Text style={styles.constraintValue}>{urgentOrder.weight}</Text>
            </View>
            <View style={styles.constraintDivider} />
            <View style={styles.constraintItem}>
              <Feather name="clock" size={14} color={Colors.danger} />
              <Text style={styles.constraintLabel}>Deadline</Text>
              <Text style={[styles.constraintValue, { color: Colors.danger }]}>
                {urgentOrder.deadline}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.detailsBtn,
                { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={handleViewDetails}
            >
              <Feather name="eye" size={16} color={Colors.primary} />
              <Text style={styles.detailsBtnText}>View Details</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                styles.ackBtn,
                { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
              onPress={handleAcknowledge}
            >
              <Feather name="check" size={16} color={Colors.white} />
              <Text style={styles.ackBtnText}>Acknowledge</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  card: {
    marginHorizontal: 12,
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  cardTopStripe: {
    height: 4,
    backgroundColor: Colors.primary,
  },
  cardContent: {
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  urgentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
  },
  urgentText: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: 1.5,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  alertIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  alertSubtext: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.darkGrey,
  },
  constraintRow: {
    flexDirection: "row",
    backgroundColor: Colors.lightGrey,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  constraintItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  constraintDivider: {
    width: 1,
    backgroundColor: Colors.light.border,
  },
  constraintLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
  },
  constraintValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  detailsBtn: {
    backgroundColor: Colors.primaryLight,
  },
  detailsBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  ackBtn: {
    backgroundColor: Colors.primary,
  },
  ackBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
});
