import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";
import VoiceBotFAB from "@/components/VoiceBotFAB";

const MOCK_ATTENDANCE = [
  { date: "2025-02-10", type: "present" },
  { date: "2025-02-11", type: "present" },
  { date: "2025-02-12", type: "leave" },
  { date: "2025-02-13", type: "present" },
  { date: "2025-02-14", type: "present" },
  { date: "2025-02-15", type: "present" },
  { date: "2025-02-16", type: "off" },
  { date: "2025-02-17", type: "present" },
  { date: "2025-02-18", type: "present" },
  { date: "2025-02-19", type: "present" },
];

const MOCK_OVERTIME = [
  { date: "2025-02-11", hours: 2 },
  { date: "2025-02-14", hours: 1.5 },
  { date: "2025-02-17", hours: 3 },
];

const MOCK_BREAKS = [
  { date: "2025-02-19", time: "12:30 PM", duration: "15 min" },
  { date: "2025-02-18", time: "1:00 PM", duration: "20 min" },
  { date: "2025-02-17", time: "12:45 PM", duration: "15 min" },
];

export default function ProfileScreen() {
  const { user } = useAuth();
  const [showAttendance, setShowAttendance] = useState(false);
  const [showOvertime, setShowOvertime] = useState(false);
  const [showBreaks, setShowBreaks] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DR";

  const totalOTHours = MOCK_OVERTIME.reduce((s, o) => s + o.hours, 0);
  const daysWorked = MOCK_ATTENDANCE.filter((a) => a.type === "present").length;
  const leaveDays = MOCK_ATTENDANCE.filter((a) => a.type === "leave").length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.homeBtn} onPress={() => router.back()}>
          <Ionicons name="home-outline" size={20} color={Colors.primary} />
        </Pressable>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name || "Driver"}</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="hash" label="Vehicle No" value={user?.vehicleNo || "N/A"} color={Colors.primary} />
          <View style={styles.infoDivider} />
          <InfoRow icon="truck" label="Vehicle Type" value={user?.vehicleType || "N/A"} color={Colors.success} />
          <View style={styles.infoDivider} />
          <InfoRow icon="zap" label="Fuel Type" value={user?.fuelType || "N/A"} color={Colors.orange} />
          <View style={styles.infoDivider} />
          <InfoRow icon="box" label="Capacity" value={user?.capacity || "N/A"} color={Colors.warning} />
          <View style={styles.infoDivider} />
          <InfoRow icon="phone" label="Phone No" value={user?.phoneNo || "N/A"} color={Colors.primaryDark} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{daysWorked}</Text>
            <Text style={styles.statLabel}>Days Worked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.danger }]}>{leaveDays}</Text>
            <Text style={styles.statLabel}>Leave Days</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: Colors.orange }]}>{totalOTHours}h</Text>
            <Text style={styles.statLabel}>Overtime</Text>
          </View>
        </View>

        <ToggleSection
          title="Show Attendance"
          icon="calendar"
          isOpen={showAttendance}
          onToggle={() => setShowAttendance(!showAttendance)}
        >
          <View style={styles.attendanceGrid}>
            {MOCK_ATTENDANCE.map((a) => (
              <View key={a.date} style={styles.attendanceItem}>
                <View
                  style={[
                    styles.attendanceDot,
                    {
                      backgroundColor:
                        a.type === "present" ? Colors.success :
                        a.type === "leave" ? Colors.danger : Colors.darkGrey,
                    },
                  ]}
                />
                <Text style={styles.attendanceDate}>
                  {new Date(a.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </Text>
                <Text style={styles.attendanceType}>{a.type}</Text>
              </View>
            ))}
          </View>
        </ToggleSection>

        <ToggleSection
          title="Show Overtime"
          icon="clock"
          isOpen={showOvertime}
          onToggle={() => setShowOvertime(!showOvertime)}
        >
          {MOCK_OVERTIME.map((o) => (
            <View key={o.date} style={styles.otRow}>
              <Text style={styles.otDate}>
                {new Date(o.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </Text>
              <View style={styles.otBarWrap}>
                <View style={[styles.otBar, { width: `${(o.hours / 4) * 100}%` }]} />
              </View>
              <Text style={styles.otHours}>{o.hours}h</Text>
            </View>
          ))}
        </ToggleSection>

        <ToggleSection
          title="Show Breaks"
          icon="coffee"
          isOpen={showBreaks}
          onToggle={() => setShowBreaks(!showBreaks)}
        >
          {MOCK_BREAKS.map((b, i) => (
            <View key={i} style={styles.breakRow}>
              <Text style={styles.breakDate}>
                {new Date(b.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
              </Text>
              <Text style={styles.breakTime}>{b.time}</Text>
              <Text style={styles.breakDuration}>{b.duration}</Text>
            </View>
          ))}
        </ToggleSection>

        <View style={styles.payCard}>
          <Text style={styles.payTitle}>This Week</Text>
          <View style={styles.payRow}>
            <View>
              <Text style={styles.payLabel}>Time Done</Text>
              <Text style={styles.payValue}>38.5 hrs</Text>
            </View>
            <View>
              <Text style={styles.payLabel}>Time Left</Text>
              <Text style={styles.payValue}>1.5 hrs</Text>
            </View>
            <View>
              <Text style={styles.payLabel}>Pay Est.</Text>
              <Text style={[styles.payValue, { color: Colors.success }]}>Rs. 12,450</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <VoiceBotFAB />
    </View>
  );
}

function InfoRow({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: color + "15" }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function ToggleSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.toggleSection}>
      <Pressable style={styles.toggleHeader} onPress={onToggle}>
        <View style={styles.toggleHeaderLeft}>
          <Feather name={icon as any} size={18} color={Colors.primary} />
          <Text style={styles.toggleTitle}>{title}</Text>
        </View>
        <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={18} color={Colors.darkGrey} />
      </Pressable>
      {isOpen && <View style={styles.toggleBody}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
  },
  homeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  name: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  statNumber: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    marginTop: 2,
  },
  toggleSection: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  toggleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  toggleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toggleTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
  },
  toggleBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  attendanceGrid: {
    gap: 8,
  },
  attendanceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  attendanceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  attendanceDate: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    width: 60,
  },
  attendanceType: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    textTransform: "capitalize",
  },
  otRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  otDate: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    width: 60,
  },
  otBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    overflow: "hidden",
  },
  otBar: {
    height: "100%",
    backgroundColor: Colors.orange,
    borderRadius: 4,
  },
  otHours: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.orange,
    width: 32,
    textAlign: "right",
  },
  breakRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  breakDate: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
    width: 60,
  },
  breakTime: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    flex: 1,
    textAlign: "center",
  },
  breakDuration: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.success,
    width: 50,
    textAlign: "right",
  },
  payCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  payTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  payRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  payLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    marginBottom: 4,
  },
  payValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
});
