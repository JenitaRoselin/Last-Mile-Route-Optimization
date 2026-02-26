import React, { useState, useEffect, useRef } from "react";
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
import { EXCEPTION_TYPES } from "@/lib/mock-data";
import VoiceBotFAB from "@/components/VoiceBotFAB";

export default function DeliveryProofScreen() {
  const [proofImage, setProofImage] = useState(false);
  const [selectedAction, setSelectedAction] = useState<"proof" | "exception" | null>(null);
  const [exceptionCategory, setExceptionCategory] = useState("");
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const popupScale = useRef(new Animated.Value(0)).current;
  const popupOpacity = useRef(new Animated.Value(0)).current;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProofImage(true);
      setSelectedAction("proof");
    }
  };

  const handleSubmit = () => {
    if (!selectedAction) {
      if (Platform.OS === "web") {
        alert("Please upload delivery proof or report an exception.");
      } else {
        import("react-native").then(({ Alert }) =>
          Alert.alert("Required", "Please upload delivery proof or report an exception.")
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
          <Ionicons name="location" size={24} color={Colors.success} />
          <Text style={styles.titleText}>Address Reached</Text>
        </View>

        <Pressable
          style={[
            styles.uploadBtn,
            proofImage && styles.uploadBtnDone,
            selectedAction === "proof" && styles.uploadBtnSelected,
          ]}
          onPress={pickImage}
        >
          <View style={[styles.uploadIconBox, proofImage && styles.uploadIconBoxDone]}>
            <Feather name={proofImage ? "check" : "camera"} size={22} color={proofImage ? Colors.white : Colors.primary} />
          </View>
          <View style={styles.uploadInfo}>
            <Text style={styles.uploadTitle}>Upload</Text>
            <Text style={styles.uploadSubtext}>
              {proofImage ? "Delivery proof uploaded" : "Delivery Proof"}
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.darkGrey} />
        </Pressable>

        <Text style={styles.orText}>(or)</Text>

        <Pressable
          style={[
            styles.exceptionBtn,
            selectedAction === "exception" && styles.exceptionBtnSelected,
          ]}
          onPress={() => setSelectedAction("exception")}
        >
          <View style={[styles.uploadIconBox, { backgroundColor: Colors.danger + "15" }]}>
            <Feather name="alert-triangle" size={22} color={Colors.danger} />
          </View>
          <View style={styles.uploadInfo}>
            <Text style={styles.uploadTitle}>Report Exception</Text>
            <Text style={styles.uploadSubtext}>Should definitely pick one of two</Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.darkGrey} />
        </Pressable>

        {selectedAction === "exception" && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <Pressable
                style={styles.inputWrapper}
                onPress={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              >
                <Text style={[styles.dropdownText, !exceptionCategory && { color: "#9CA3AF" }]}>
                  {exceptionCategory || "Select category"}
                </Text>
                <Feather
                  name={categoryDropdownOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.darkGrey}
                />
              </Pressable>
              {categoryDropdownOpen && (
                <View style={styles.dropdown}>
                  {EXCEPTION_TYPES.map((et) => (
                    <Pressable
                      key={et.id}
                      style={[styles.dropdownItem, exceptionCategory === et.label && styles.dropdownItemActive]}
                      onPress={() => {
                        setExceptionCategory(et.label);
                        setCategoryDropdownOpen(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, exceptionCategory === et.label && styles.dropdownItemTextActive]}>
                        {et.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

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
      </ScrollView>

      <Modal visible={showPopup} transparent animationType="none">
        <View style={styles.popupOverlay}>
          <Animated.View style={[styles.popupCard, { transform: [{ scale: popupScale }], opacity: popupOpacity }]}>
            <View style={styles.popupIconCircle}>
              <Feather name="check" size={32} color={Colors.white} />
            </View>
            <Text style={styles.popupTitle}>
              {selectedAction === "proof" ? "Delivery Confirmed" : "Exception Reported"}
            </Text>
            <Text style={styles.popupSubtitle}>Submitted Successfully</Text>

            <View style={styles.popupDivider} />

            <View style={styles.popupDetail}>
              <Text style={styles.popupLabel}>Type</Text>
              <Text style={styles.popupValue}>
                {selectedAction === "proof" ? "Proof of Delivery" : "Exception Report"}
              </Text>
            </View>

            {selectedAction === "exception" && exceptionCategory ? (
              <View style={styles.popupDetail}>
                <Text style={styles.popupLabel}>Category</Text>
                <Text style={styles.popupValue}>{exceptionCategory}</Text>
              </View>
            ) : null}

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
  uploadBtn: {
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
  uploadBtnDone: {
    borderColor: Colors.success + "50",
    backgroundColor: Colors.success + "08",
  },
  uploadBtnSelected: {
    borderColor: Colors.primary,
  },
  uploadIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconBoxDone: {
    backgroundColor: Colors.success,
  },
  uploadInfo: {
    flex: 1,
  },
  uploadTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  uploadSubtext: {
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
  exceptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginBottom: 20,
  },
  exceptionBtnSelected: {
    borderColor: Colors.danger,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dropdownText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  dropdownItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  dropdownItemText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  dropdownItemTextActive: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
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
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: Colors.primary,
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
