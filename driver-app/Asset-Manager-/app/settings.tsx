import React from "react";
import { StyleSheet, Text, View, ScrollView, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [locationTracking, setLocationTracking] = React.useState(true);
  const [soundAlerts, setSoundAlerts] = React.useState(true);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Feather name="moon" size={18} color={Colors.textPrimary} />
                <Text style={styles.settingLabel}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#E5E7EB", true: Colors.primaryLight }}
                thumbColor={darkMode ? Colors.primary : "#fff"}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Feather name="map-pin" size={18} color={Colors.textPrimary} />
                <Text style={styles.settingLabel}>Location Tracking</Text>
              </View>
              <Switch
                value={locationTracking}
                onValueChange={setLocationTracking}
                trackColor={{ false: "#E5E7EB", true: Colors.primaryLight }}
                thumbColor={locationTracking ? Colors.primary : "#fff"}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Feather name="volume-2" size={18} color={Colors.textPrimary} />
                <Text style={styles.settingLabel}>Sound Alerts</Text>
              </View>
              <Switch
                value={soundAlerts}
                onValueChange={setSoundAlerts}
                trackColor={{ false: "#E5E7EB", true: Colors.primaryLight }}
                thumbColor={soundAlerts ? Colors.primary : "#fff"}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <Pressable style={styles.linkRow}>
              <Feather name="help-circle" size={18} color={Colors.textPrimary} />
              <Text style={styles.linkText}>Help Center</Text>
              <Feather name="chevron-right" size={18} color={Colors.darkGrey} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.linkRow}>
              <Feather name="message-square" size={18} color={Colors.textPrimary} />
              <Text style={styles.linkText}>Contact Dispatch</Text>
              <Feather name="chevron-right" size={18} color={Colors.darkGrey} />
            </Pressable>
          </View>
        </View>

        <Text style={styles.version}>FleetDrive v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.darkGrey,
    marginBottom: 10,
    paddingLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: "#F5F5F5",
    marginHorizontal: 16,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.textPrimary,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    marginTop: 16,
  },
});
