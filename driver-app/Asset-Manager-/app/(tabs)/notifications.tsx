import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useApp } from "@/lib/app-context";
import { Notification } from "@/lib/mock-data";
import VoiceBotFAB from "@/components/VoiceBotFAB";

function NotificationItem({
  notification,
  onDismiss,
  onAcknowledge,
}: {
  notification: Notification;
  onDismiss: (id: string) => void;
  onAcknowledge: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const translateX = useSharedValue(0);

  const getTypeColor = () => {
    switch (notification.type) {
      case "urgent":
        return Colors.danger;
      case "warning":
        return Colors.warning;
      default:
        return Colors.primary;
    }
  };

  const getTypeIcon = (): "alert-circle" | "alert-triangle" | "info" => {
    switch (notification.type) {
      case "urgent":
        return "alert-circle";
      case "warning":
        return "alert-triangle";
      default:
        return "info";
    }
  };

  const handleSwipeAction = () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (notification.read) {
      onDismiss(notification.id);
    } else {
      onAcknowledge(notification.id);
      translateX.value = withTiming(0, { duration: 200 });
    }
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -120);
      }
    })
    .onEnd((e) => {
      if (e.translationX < -80) {
        translateX.value = withTiming(-400, { duration: 300 });
        runOnJS(handleSwipeAction)();
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.notifWrapper}>
      <View style={styles.swipeBackground}>
        <View style={styles.swipeAction}>
          <Feather
            name={notification.read ? "trash-2" : "check"}
            size={20}
            color={Colors.white}
          />
          <Text style={styles.swipeActionText}>
            {notification.read ? "Delete" : "Ack"}
          </Text>
        </View>
      </View>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animStyle}>
          <Pressable
            onPress={() => setExpanded(!expanded)}
            style={[
              styles.notifCard,
              !notification.read && styles.notifUnread,
            ]}
          >
            <View style={styles.notifHeader}>
              <View style={[styles.notifIcon, { backgroundColor: getTypeColor() + "15" }]}>
                <Feather name={getTypeIcon()} size={18} color={getTypeColor()} />
              </View>
              <View style={styles.notifInfo}>
                <Text style={styles.notifTitle}>{notification.title}</Text>
                <Text style={styles.notifTime}>{notification.time}</Text>
              </View>
              {!notification.read && <View style={styles.unreadDot} />}
              <Feather
                name={expanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={Colors.darkGrey}
              />
            </View>
            {expanded && (
              <Text style={styles.notifMessage}>{notification.message}</Text>
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { notifications, dismissNotification, acknowledgeNotification } = useApp();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 + webTopInset }]}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {notifications.filter((n) => !n.read).length} new
          </Text>
        </View>
      </View>

      <View style={styles.swipeHint}>
        <Feather name="arrow-left" size={12} color={Colors.darkGrey} />
        <Text style={styles.swipeHintText}>Swipe left to acknowledge or delete</Text>
      </View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="bell-off" size={48} color={Colors.darkGrey} />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onDismiss={dismissNotification}
              onAcknowledge={acknowledgeNotification}
            />
          ))
        )}
      </Animated.ScrollView>

      <VoiceBotFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  headerBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  headerBadgeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  swipeHintText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
  },
  notifWrapper: {
    marginBottom: 8,
    borderRadius: 14,
    overflow: "hidden",
  },
  swipeBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 120,
    backgroundColor: Colors.danger,
    borderRadius: 14,
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 20,
  },
  swipeAction: {
    alignItems: "center",
    gap: 4,
  },
  swipeActionText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.white,
  },
  notifCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  notifUnread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  notifHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  notifInfo: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  notifTime: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  notifMessage: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.textSecondary,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    lineHeight: 20,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: Colors.darkGrey,
  },
});
