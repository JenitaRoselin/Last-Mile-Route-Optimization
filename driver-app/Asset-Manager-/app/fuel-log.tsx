import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Animated,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/colors";
import VoiceBotFAB from "@/components/VoiceBotFAB";

export default function FuelLogScreen() {
  const [proofUploaded, setProofUploaded] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"proof" | "complaint" | null>(null);
  const [notes, setNotes] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setProofUploaded(true);
      setSelectedAction("proof");
    }
  };

  const handleSubmit = () => {
    if (!selectedAction) {
      if (Platform.OS === "web") {
        alert("Please upload fuel proof or report a complaint.");
      } else {
        import("react-native").then(({ Alert }) =>
          Alert.alert("Required", "Please upload fuel proof or report a complaint.")
        );
      }
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowPopup(true);
    Animated.parallel([
      Animated.spring(popupScale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.timing(popupOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      setShowPopup(false);
      router.replace("/(tabs)/");
    }, 2500);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Ionicons name="flame" size={24} color={Colors.orange} />
          <Text style={styles.titleText}>Fuel Stop Reached</Text>
        </View>

        <Pressable
          style={[
            styles.actionBtn,
            proofUploaded && styles.actionBtnDone,
            selectedAction === "proof" && styles.actionBtnSelected,
          ]}
          onPress={pickImage}
        >
          <View style={[styles.iconBox, proofUploaded && styles.iconBoxDone]}>
            <Feather
              name={proofUploaded ? "check" : "camera"}
              size={22}
              color={proofUploaded ? Colors.white : Colors.orange}
            />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Upload Proof</Text>
            <Text style={styles.actionSubtext}>
              {proofUploaded ? "Photo uploaded" : "Upload fuel receipt or meter reading"}
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.darkGrey} />
        </Pressable>

        <Text style={styles.orText}>(or)</Text>

        <Pressable
          style={[
            styles.actionBtn,
            selectedAction === "complaint" && styles.actionBtnComplaint,
          ]}
          onPress={() => setSelectedAction("complaint")}
        >
          <View style={[styles.iconBox, { backgroundColor: Colors.danger + "15" }]}>
            <Feather name="alert-triangle" size={22} color={Colors.danger} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Report Complaints</Text>
            <Text style={styles.actionSubtext}>Report issues at fuel station</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.darkGrey} />
        </Pressable>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Text</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add notes or description..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            !selectedAction && styles.submitBtnDisabled,
            { transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          onPress={handleSubmit}
          disabled={!selectedAction}
        >
          <Text style={styles.submitBtnText}>Submit</Text>
        </Pressable>

        <View style={styles.noteBox}>
          <Feather name="info" size={14} color={Colors.primary} />
          <Text style={styles.noteText}>
            After completion, you will be redirected to the homepage.
          </Text>
        </View>
      </ScrollView>

      <Modal visible={showPopup} transparent animationType="none">
        <View style={styles.popupOverlay}>
          <Animated.View style={[styles.popupCard, { transform: [{ scale: popupScale }], opacity: popupOpacity }]}>
            <View style={styles.popupIconCircle}>
              <Feather name="check" size={32} color={Colors.white} />
            </View>
            <Text style={styles.popupTitle}>
              {selectedAction === "proof" ? "Fuel Log Submitted" : "Complaint Filed"}
            </Text>
            <Text style={styles.popupSubtitle}>Submitted Successfully</Text>

            <View style={styles.popupDivider} />

            <View style={styles.popupDetail}>
              <Text style={styles.popupLabel}>Type</Text>
              <Text style={styles.popupValue}>
                {selectedAction === "proof" ? "Fuel Receipt / Proof" : "Fuel Station Complaint"}
              </Text>
            </View>

            {selectedAction === "proof" ? (
              <View style={styles.popupDetail}>
                <Text style={styles.popupLabel}>Photo</Text>
                <Text style={styles.popupValue}>Uploaded</Text>
              </View>
            ) : null}

            {notes.trim() ? (
              <View style={styles.popupDetail}>
                <Text style={styles.popupLabel}>Notes</Text>
                <Text style={[styles.popupValue, { flex: 1 }]} numberOfLines={3}>{notes}</Text>
              </View>
            ) : null}

            <View style={styles.popupDivider} />
            <Text style={styles.popupRedirectText}>Redirecting to home...</Text>
          </Animated.View>
        </View>
      </Modal>

      <VoiceBotFAB />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
    marginTop: 8,
  },
  titleText: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginBottom: 8,
  },
  actionBtnDone: {
    borderColor: Colors.success + "50",
    backgroundColor: Colors.success + "08",
  },
  actionBtnSelected: {
    borderColor: Colors.orange,
  },
  actionBtnComplaint: {
    borderColor: Colors.danger,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.orange + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxDone: {
    backgroundColor: Colors.success,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
  },
  orText: {
    textAlign: "center",
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.darkGrey,
    marginVertical: 8,
  },
  inputGroup: {
    marginTop: 12,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 100,
  },
  submitBtn: {
    backgroundColor: Colors.orange,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  noteText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.primary,
    flex: 1,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  popupCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  popupIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  popupTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  popupSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.success,
    marginBottom: 16,
  },
  popupDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    width: "100%",
    marginVertical: 14,
  },
  popupDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 6,
  },
  popupLabel: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.darkGrey,
  },
  popupValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
    textAlign: "right",
  },
  popupRedirectText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    marginTop: 4,
  },
});
