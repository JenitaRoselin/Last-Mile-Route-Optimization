import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/colors";
import { EXCEPTION_TYPES } from "@/lib/mock-data";

export default function ExceptionScreen() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [photoAdded, setPhotoAdded] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoAdded(true);
    }
  };

  const handleSubmit = () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const selected = EXCEPTION_TYPES.find((t) => t.id === selectedType);
    Alert.alert(
      "Exception Reported",
      `"${selected?.label || "Unknown"}" exception has been sent to dispatch.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Feather name="alert-triangle" size={28} color={Colors.danger} />
          </View>
          <Text style={styles.heroTitle}>Report Exception</Text>
          <Text style={styles.heroSubtitle}>
            Select the issue you encountered during delivery
          </Text>
        </View>

        <View style={styles.optionsGrid}>
          {EXCEPTION_TYPES.map((type) => (
            <Pressable
              key={type.id}
              style={[
                styles.optionCard,
                selectedType === type.id && styles.optionCardActive,
              ]}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedType(type.id);
              }}
            >
              <View
                style={[
                  styles.optionIcon,
                  selectedType === type.id && styles.optionIconActive,
                ]}
              >
                <Feather
                  name={type.icon}
                  size={22}
                  color={selectedType === type.id ? Colors.white : Colors.darkGrey}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  selectedType === type.id && styles.optionLabelActive,
                ]}
              >
                {type.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {selectedType === "other" && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Describe the issue</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Enter details about the exception..."
              placeholderTextColor="#9CA3AF"
              value={otherText}
              onChangeText={setOtherText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        )}

        <View style={styles.photoSection}>
          <Text style={styles.inputLabel}>Photo Evidence (Optional)</Text>
          <Pressable
            style={[styles.photoBtn, photoAdded && styles.photoBtnFilled]}
            onPress={pickImage}
          >
            <Feather
              name={photoAdded ? "check-circle" : "camera"}
              size={20}
              color={photoAdded ? Colors.success : Colors.primary}
            />
            <Text
              style={[styles.photoBtnText, photoAdded && { color: Colors.success }]}
            >
              {photoAdded ? "Photo Added" : "Add Photo Proof"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            !selectedType && styles.submitBtnDisabled,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
          onPress={handleSubmit}
          disabled={!selectedType}
        >
          <Feather name="send" size={18} color={Colors.white} />
          <Text style={styles.submitBtnText}>Submit Report</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 10,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.danger + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
    textAlign: "center",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    width: "47%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  optionCardActive: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger + "08",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.lightGrey,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIconActive: {
    backgroundColor: Colors.danger,
  },
  optionLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  optionLabelActive: {
    color: Colors.danger,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 100,
  },
  photoSection: {
    marginBottom: 24,
  },
  photoBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  photoBtnFilled: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + "08",
  },
  photoBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.danger,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: Colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
});
