import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useApp } from "@/lib/app-context";

function PulsingDot() {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.4, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[urgentStyles.pulsingDot, animStyle]} />
  );
}

export default function UrgentOrderScreen() {
  const { urgentOrder, acknowledgeUrgentOrder, urgentAcknowledged } = useApp();

  if (!urgentOrder) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Feather name="check-circle" size={48} color={Colors.success} />
          <Text style={styles.emptyText}>No urgent orders</Text>
        </View>
      </View>
    );
  }

  const handleAccept = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    acknowledgeUrgentOrder();
    router.back();
  };

  const { order, currentRouteEta, newRouteEta, reason, weight, deadline } = urgentOrder;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={urgentStyles.topBanner}>
          <PulsingDot />
          <Text style={urgentStyles.bannerText}>URGENT ORDER INSERTION</Text>
          <PulsingDot />
        </View>

        <View style={urgentStyles.orderIdCard}>
          <View style={urgentStyles.orderIdRow}>
            <View>
              <Text style={urgentStyles.orderLabel}>Order ID</Text>
              <Text style={urgentStyles.orderId}>{order.id}</Text>
            </View>
            <View style={urgentStyles.urgentBadge}>
              <Ionicons name="warning" size={14} color={Colors.white} />
              <Text style={urgentStyles.urgentBadgeText}>PRIORITY</Text>
            </View>
          </View>
        </View>

        <View style={urgentStyles.criticalSection}>
          <Text style={urgentStyles.sectionLabel}>CRITICAL CONSTRAINTS</Text>
          <View style={urgentStyles.criticalRow}>
            <View style={urgentStyles.criticalCard}>
              <Feather name="package" size={20} color={Colors.textPrimary} />
              <Text style={urgentStyles.criticalLabel}>Package Weight</Text>
              <Text style={urgentStyles.criticalValueBold}>{weight}</Text>
            </View>
            <View style={[urgentStyles.criticalCard, urgentStyles.criticalCardDanger]}>
              <Feather name="clock" size={20} color={Colors.danger} />
              <Text style={[urgentStyles.criticalLabel, { color: Colors.danger }]}>
                Delivery Deadline
              </Text>
              <Text style={[urgentStyles.criticalValueBold, { color: Colors.danger }]}>
                {deadline}
              </Text>
            </View>
          </View>
        </View>

        <View style={urgentStyles.detailsCard}>
          <Text style={urgentStyles.sectionLabel}>ORDER DETAILS</Text>
          <View style={urgentStyles.detailRow}>
            <View style={urgentStyles.detailIcon}>
              <Feather name="user" size={16} color={Colors.primary} />
            </View>
            <View style={urgentStyles.detailContent}>
              <Text style={urgentStyles.detailLabel}>Customer</Text>
              <Text style={urgentStyles.detailValue}>{order.customerName}</Text>
            </View>
          </View>
          <View style={urgentStyles.detailDivider} />
          <View style={urgentStyles.detailRow}>
            <View style={urgentStyles.detailIcon}>
              <Feather name="map-pin" size={16} color={Colors.primary} />
            </View>
            <View style={urgentStyles.detailContent}>
              <Text style={urgentStyles.detailLabel}>Address</Text>
              <Text style={urgentStyles.detailValue}>{order.address}</Text>
            </View>
          </View>
          <View style={urgentStyles.detailDivider} />
          <View style={urgentStyles.detailRow}>
            <View style={urgentStyles.detailIcon}>
              <Feather name="navigation" size={16} color={Colors.primary} />
            </View>
            <View style={urgentStyles.detailContent}>
              <Text style={urgentStyles.detailLabel}>ETA from current location</Text>
              <Text style={[urgentStyles.detailValue, { color: Colors.primary }]}>
                {order.eta}
              </Text>
            </View>
          </View>
          <View style={urgentStyles.detailDivider} />
          <View style={urgentStyles.detailRow}>
            <View style={urgentStyles.detailIcon}>
              <Feather name="calendar" size={16} color={Colors.primary} />
            </View>
            <View style={urgentStyles.detailContent}>
              <Text style={urgentStyles.detailLabel}>Time Window</Text>
              <Text style={urgentStyles.detailValue}>{order.timeWindow}</Text>
            </View>
          </View>
          <View style={urgentStyles.detailDivider} />
          <View style={urgentStyles.detailRow}>
            <View style={urgentStyles.detailIcon}>
              <Feather name="package" size={16} color={Colors.primary} />
            </View>
            <View style={urgentStyles.detailContent}>
              <Text style={urgentStyles.detailLabel}>Package ID</Text>
              <Text style={urgentStyles.detailValue}>{order.packageId}</Text>
            </View>
          </View>
        </View>

        <View style={urgentStyles.etaCompareCard}>
          <Text style={urgentStyles.sectionLabel}>ROUTE IMPACT ANALYSIS</Text>
          <View style={urgentStyles.etaCompareRow}>
            <View style={urgentStyles.etaBox}>
              <Text style={urgentStyles.etaBoxLabel}>Current Route</Text>
              <Text style={urgentStyles.etaBoxValue}>{currentRouteEta}</Text>
              <Text style={urgentStyles.etaBoxSub}>Without urgent order</Text>
            </View>
            <View style={urgentStyles.etaArrow}>
              <Feather name="arrow-right" size={20} color={Colors.primary} />
              <Text style={urgentStyles.etaDelta}>+7 min</Text>
            </View>
            <View style={[urgentStyles.etaBox, urgentStyles.etaBoxNew]}>
              <Text style={urgentStyles.etaBoxLabel}>New Route</Text>
              <Text style={[urgentStyles.etaBoxValue, { color: Colors.primary }]}>
                {newRouteEta}
              </Text>
              <Text style={urgentStyles.etaBoxSub}>With urgent order</Text>
            </View>
          </View>
        </View>

        <View style={urgentStyles.reasonCard}>
          <View style={urgentStyles.reasonIconWrap}>
            <Ionicons name="location" size={20} color={Colors.primary} />
          </View>
          <View style={urgentStyles.reasonContent}>
            <Text style={urgentStyles.reasonTitle}>Why you were selected</Text>
            <Text style={urgentStyles.reasonText}>{reason}</Text>
          </View>
        </View>

        {!urgentAcknowledged ? (
          <View style={urgentStyles.actionSection}>
            <Pressable
              style={({ pressed }) => [
                urgentStyles.acceptBtn,
                { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
              onPress={handleAccept}
            >
              <Feather name="check-circle" size={20} color={Colors.white} />
              <Text style={urgentStyles.acceptBtnText}>Accept & Add to Route</Text>
            </Pressable>
          </View>
        ) : (
          <View style={urgentStyles.acknowledgedBanner}>
            <Feather name="check-circle" size={20} color={Colors.success} />
            <Text style={urgentStyles.acknowledgedText}>
              Order acknowledged and added to your route
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.darkGrey,
  },
});

const urgentStyles = StyleSheet.create({
  topBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.danger,
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  bannerText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: 2,
  },
  orderIdCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  orderIdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    marginBottom: 4,
  },
  orderId: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  urgentBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  criticalSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.darkGrey,
    letterSpacing: 1,
    marginBottom: 10,
  },
  criticalRow: {
    flexDirection: "row",
    gap: 10,
  },
  criticalCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  criticalCardDanger: {
    borderColor: Colors.danger + "40",
    backgroundColor: Colors.danger + "06",
  },
  criticalLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.darkGrey,
    textAlign: "center",
  },
  criticalValueBold: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 50,
  },
  etaCompareCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  etaCompareRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  etaBox: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  etaBoxNew: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  etaBoxLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    color: Colors.darkGrey,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  etaBoxValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  etaBoxSub: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    textAlign: "center",
  },
  etaArrow: {
    alignItems: "center",
    paddingHorizontal: 8,
    gap: 2,
  },
  etaDelta: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.warning,
  },
  reasonCard: {
    flexDirection: "row",
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 18,
    gap: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary + "20",
  },
  reasonIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  reasonContent: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.primaryDark,
    lineHeight: 19,
  },
  actionSection: {
    gap: 10,
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  acceptBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  acknowledgedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.success + "15",
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.success + "40",
  },
  acknowledgedText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.success,
  },
});
