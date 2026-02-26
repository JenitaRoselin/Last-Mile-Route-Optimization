import React, { useState } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { Order } from "@/lib/mock-data";

interface OrderCardProps {
  order: Order;
  variant: "en_route" | "upcoming" | "completed";
}

export default function OrderCard({ order, variant }: OrderCardProps) {
  const [expanded, setExpanded] = useState(variant === "en_route" || !!order.isUrgent);

  const getStatusColor = () => {
    if (order.isUrgent) return Colors.danger;
    switch (variant) {
      case "en_route":
        return Colors.primary;
      case "upcoming":
        return Colors.warning;
      case "completed":
        return Colors.success;
    }
  };

  const getStatusLabel = () => {
    if (order.isUrgent) return "URGENT";
    switch (variant) {
      case "en_route":
        return "En Route";
      case "upcoming":
        return "Upcoming";
      case "completed":
        return "Delivered";
    }
  };

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={[
        styles.card,
        variant === "completed" && styles.completedCard,
        order.isUrgent && styles.urgentCard,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {order.isUrgent ? (
            <View style={styles.urgentDotWrap}>
              <Ionicons name="warning" size={12} color={Colors.white} />
            </View>
          ) : (
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
          )}
          <View style={styles.headerInfo}>
            <Text
              style={[
                styles.customerName,
                variant === "completed" && styles.completedText,
              ]}
            >
              {order.customerName}
            </Text>
            <Text style={styles.orderId}>{order.id}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + "18" }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusLabel()}
            </Text>
          </View>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={Colors.darkGrey}
          />
        </View>
      </View>

      {expanded && (
        <View style={styles.details}>
          {order.isUrgent && order.weight && (
            <View style={styles.urgentConstraints}>
              <View style={styles.urgentConstraintItem}>
                <Feather name="package" size={12} color={Colors.textPrimary} />
                <Text style={styles.urgentConstraintLabel}>Weight</Text>
                <Text style={styles.urgentConstraintValue}>{order.weight}</Text>
              </View>
              <View style={styles.urgentConstraintDivider} />
              <View style={styles.urgentConstraintItem}>
                <Feather name="clock" size={12} color={Colors.danger} />
                <Text style={[styles.urgentConstraintLabel, { color: Colors.danger }]}>Deadline</Text>
                <Text style={[styles.urgentConstraintValue, { color: Colors.danger }]}>
                  {order.deadline}
                </Text>
              </View>
            </View>
          )}
          <View style={styles.detailRow}>
            <Feather name="map-pin" size={14} color={Colors.darkGrey} />
            <Text style={[styles.detailText, variant === "completed" && styles.completedText]}>
              {order.address}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Feather name="clock" size={14} color={Colors.darkGrey} />
            <Text style={[styles.detailText, variant === "completed" && styles.completedText]}>
              {order.timeWindow}
            </Text>
          </View>
          {variant !== "completed" && (
            <View style={styles.detailRow}>
              <Feather name="navigation" size={14} color={Colors.primary} />
              <Text style={[styles.detailText, { color: Colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                ETA: {order.eta}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Feather name="package" size={14} color={Colors.darkGrey} />
            <Text style={[styles.detailText, variant === "completed" && styles.completedText]}>
              {order.packageId}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  completedCard: {
    opacity: 0.55,
    backgroundColor: "#FAFAFA",
  },
  urgentCard: {
    borderColor: Colors.danger + "50",
    borderWidth: 2,
    backgroundColor: Colors.danger + "04",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  urgentDotWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.danger,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  orderId: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    marginTop: 2,
  },
  completedText: {
    color: Colors.darkGrey,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  details: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    flex: 1,
  },
  urgentConstraints: {
    flexDirection: "row",
    backgroundColor: Colors.lightGrey,
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
  },
  urgentConstraintItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  urgentConstraintDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  urgentConstraintLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
  },
  urgentConstraintValue: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
});
