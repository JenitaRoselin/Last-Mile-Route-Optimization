import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  Dimensions,
  Platform,
  Linking,
  Animated as RNAnimated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/lib/auth-context";
import LeafletMap from "@/components/LeafletMap";
import VoiceBotFAB from "@/components/VoiceBotFAB";
import { router } from "expo-router";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_MIN = 180;
const SHEET_MAX = SCREEN_HEIGHT * 0.55;

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { orders, fuelStopVisible, urgentMarkerVisible, urgentOrder, breakRequested, setBreakRequested } = useApp();
  const { user, logout } = useAuth();
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastAnim = useRef(new RNAnimated.Value(-100)).current;
  const toastTimer = useRef<any>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMsg(msg);
    setToastVisible(true);
    toastAnim.setValue(-100);
    RNAnimated.spring(toastAnim, { toValue: 0, friction: 8, tension: 80, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      RNAnimated.timing(toastAnim, { toValue: -100, duration: 250, useNativeDriver: true }).start(() => setToastVisible(false));
    }, 2500);
  }, [toastAnim]);

  const toggleBreak = useCallback((val: boolean) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBreakRequested(val);
    showToast(val ? "Break requested - dispatch notified" : "Break request cancelled");
  }, [showToast, setBreakRequested]);

  const enRouteOrder = orders.find((o) => o.status === "en_route");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const sheetHeight = useSharedValue(SHEET_MIN);
  const sheetStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  const toggleSheet = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = !sheetExpanded;
    setSheetExpanded(next);
    sheetHeight.value = withSpring(next ? SHEET_MAX : SHEET_MIN, {
      damping: 20,
      stiffness: 150,
    });
  };

  const mapMarkers = useMemo(() => {
    const markers: any[] = [];

    markers.push({
      lat: 13.0475,
      lng: 80.2090,
      label: "You (Driver)",
      color: Colors.primary,
      type: "driver",
    });

    orders
      .filter((o) => o.status !== "completed")
      .forEach((o) => {
        markers.push({
          lat: o.lat,
          lng: o.lng,
          label: `${o.id} - ${o.customerName}`,
          color: o.status === "en_route" ? Colors.danger : o.isUrgent ? "#FF6B00" : Colors.warning,
          type: "order",
        });
      });

    if (fuelStopVisible) {
      markers.push({
        lat: 13.0067,
        lng: 80.2571,
        label: "Fuel Stop - Indian Oil, Adyar",
        color: Colors.orange,
        type: "fuel",
      });
    }

    if (urgentMarkerVisible && urgentOrder) {
      markers.push({
        lat: urgentOrder.order.lat,
        lng: urgentOrder.order.lng,
        label: `URGENT: ${urgentOrder.order.customerName}`,
        color: Colors.danger,
        type: "order",
      });
    }

    return markers;
  }, [orders, fuelStopVisible, urgentMarkerVisible, urgentOrder]);

  const handleCallCustomer = () => {
    if (enRouteOrder?.phone) {
      Linking.openURL(`tel:${enRouteOrder.phone}`);
    }
  };

  const handleLogout = async () => {
    setSidebarOpen(false);
    await logout();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.mapArea, { paddingTop: 0 }]}>
        <LeafletMap
          markers={mapMarkers}
          center={{ lat: 13.0475, lng: 80.2400 }}
          zoom={13}
          showRoute
          style={{ flex: 1, marginTop: insets.top + webTopInset }}
        />

        <Pressable
          style={[styles.sidebarToggle, { top: insets.top + 16 + webTopInset }]}
          onPress={() => setSidebarOpen(!sidebarOpen)}
        >
          <Feather name={sidebarOpen ? "x" : "menu"} size={22} color={Colors.textPrimary} />
        </Pressable>

        <View style={[styles.topRight, { top: insets.top + 16 + webTopInset }]}>
          <Pressable style={styles.topIconBtn} onPress={() => router.push("/fuel-log")}>
            <Ionicons name="flame-outline" size={20} color={Colors.orange} />
          </Pressable>
          <Pressable style={styles.topIconBtn} onPress={() => toggleBreak(!breakRequested)}>
            <Ionicons name="cafe-outline" size={20} color={breakRequested ? Colors.success : Colors.darkGrey} />
          </Pressable>
          <Pressable
            style={styles.topIconBtn}
            onPress={() => {
              if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Ionicons name="volume-high-outline" size={20} color={Colors.primary} />
          </Pressable>
        </View>

        {sidebarOpen && (
          <View style={[styles.sidebar, { top: insets.top + 60 + webTopInset }]}>
            <Pressable
              style={styles.sidebarItem}
              onPress={() => { setSidebarOpen(false); router.push("/profile"); }}
            >
              <Feather name="user" size={20} color={Colors.textPrimary} />
              <Text style={styles.sidebarText}>Profile</Text>
            </Pressable>
            <Pressable
              style={styles.sidebarItem}
              onPress={() => { setSidebarOpen(false); router.push("/settings"); }}
            >
              <Feather name="settings" size={20} color={Colors.textPrimary} />
              <Text style={styles.sidebarText}>Settings</Text>
            </Pressable>
            <Pressable
              style={styles.sidebarItem}
              onPress={() => { setSidebarOpen(false); router.push("/(tabs)/notifications"); }}
            >
              <Feather name="bell" size={20} color={Colors.textPrimary} />
              <Text style={styles.sidebarText}>Notifications</Text>
            </Pressable>
            <View style={styles.sidebarDivider} />
            <Pressable style={styles.sidebarItem} onPress={handleLogout}>
              <Feather name="log-out" size={20} color={Colors.danger} />
              <Text style={[styles.sidebarText, { color: Colors.danger }]}>Logout</Text>
            </Pressable>
          </View>
        )}
      </View>

      <Animated.View style={[styles.bottomSheet, sheetStyle]}>
        <Pressable onPress={toggleSheet} style={styles.sheetHandle}>
          <View style={styles.handleBar} />
          <Text style={styles.slideHint}>
            {sheetExpanded ? "Slide down to see map" : "Slide up for order details"}
          </Text>
        </Pressable>

        <ScrollView
          style={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          scrollEnabled={sheetExpanded}
        >
          {enRouteOrder ? (
            <>
              <View style={styles.orderHeader}>
                <View style={styles.orderLive}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
                <Text style={styles.orderIdText}>{enRouteOrder.id}</Text>
              </View>

              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Feather name="user" size={16} color={Colors.darkGrey} />
                  <View>
                    <Text style={styles.detailLabel}>Customer</Text>
                    <Text style={styles.detailValue}>{enRouteOrder.customerName}</Text>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Feather name="map-pin" size={16} color={Colors.darkGrey} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{enRouteOrder.address}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={[styles.detailItem, { flex: 1 }]}>
                    <Feather name="clock" size={16} color={Colors.darkGrey} />
                    <View>
                      <Text style={styles.detailLabel}>ETA</Text>
                      <Text style={[styles.detailValue, { color: Colors.primary }]}>{enRouteOrder.eta}</Text>
                    </View>
                  </View>
                  <View style={[styles.detailItem, { flex: 1 }]}>
                    <Feather name="calendar" size={16} color={Colors.darkGrey} />
                    <View>
                      <Text style={styles.detailLabel}>Window</Text>
                      <Text style={styles.detailValue}>{enRouteOrder.timeWindow}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <Feather name="package" size={16} color={Colors.darkGrey} />
                  <View>
                    <Text style={styles.detailLabel}>Package ID</Text>
                    <Text style={styles.detailValue}>{enRouteOrder.packageId}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.contactRow}>
                <Pressable style={styles.contactBtn} onPress={handleCallCustomer}>
                  <Feather name="phone" size={16} color={Colors.primary} />
                  <Text style={styles.contactBtnText}>Call Customer</Text>
                </Pressable>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.primaryBtn,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                  onPress={() => router.push("/delivery-proof")}
                >
                  <Feather name="check-circle" size={18} color={Colors.white} />
                  <Text style={styles.primaryBtnText}>Arrived</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionBtn,
                    styles.outlineBtn,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                  onPress={() => router.push("/exception")}
                >
                  <Feather name="alert-triangle" size={18} color={Colors.danger} />
                  <Text style={styles.outlineBtnText}>Report</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <View style={styles.noOrder}>
              <Feather name="check-circle" size={40} color={Colors.success} />
              <Text style={styles.noOrderText}>All deliveries complete</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {toastVisible && (
        <RNAnimated.View
          style={[
            styles.toastBanner,
            { top: insets.top + 16 + webTopInset, transform: [{ translateY: toastAnim }] },
          ]}
        >
          <View style={styles.toastContent}>
            <View style={[styles.toastIconCircle, { backgroundColor: Colors.success + "20" }]}>
              <Ionicons name="cafe" size={16} color={Colors.success} />
            </View>
            <Text style={styles.toastText}>{toastMsg}</Text>
          </View>
        </RNAnimated.View>
      )}

      <VoiceBotFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
  },
  mapArea: {
    flex: 1,
    position: "relative",
  },
  sidebarToggle: {
    position: "absolute",
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  topRight: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },
  topIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sidebar: {
    position: "absolute",
    left: 16,
    width: 200,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
  },
  sidebarText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 14,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    alignItems: "center",
    paddingVertical: 10,
    gap: 4,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
  },
  slideHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
  },
  sheetContent: {
    paddingHorizontal: 20,
    flex: 1,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  orderLive: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.danger,
  },
  liveText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.danger,
    letterSpacing: 1,
  },
  orderIdText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.darkGrey,
  },
  detailGrid: {
    gap: 14,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
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
  contactRow: {
    marginBottom: 14,
  },
  contactBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 10,
    borderRadius: 10,
  },
  contactBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
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
  primaryBtn: {
    backgroundColor: Colors.primary,
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  outlineBtn: {
    backgroundColor: "#FEE2E2",
  },
  outlineBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.danger,
  },
  noOrder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 12,
  },
  noOrderText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.darkGrey,
  },
  toastBanner: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 999,
    borderRadius: 14,
    backgroundColor: Colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.success + "30",
  },
  toastContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  toastIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
});
