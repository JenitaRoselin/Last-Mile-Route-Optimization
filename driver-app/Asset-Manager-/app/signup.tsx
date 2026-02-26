import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useAuth } from "@/lib/auth-context";

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  const [companyName, setCompanyName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [detailsFetched, setDetailsFetched] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleGetDetails = () => {
    if (!companyName.trim() || !employeeId.trim()) {
      setError("Please enter company name and employee ID");
      return;
    }
    setError("");
    setDetailsFetched(true);
    setUsername(employeeId.toLowerCase().replace(/[^a-z0-9]/g, ""));
  };

  const handleSignup = async () => {
    if (!password.trim()) {
      setError("Please enter a password");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setLoading(true);
    const result = await signup({
      username: username.trim(),
      password: password.trim(),
      companyName: companyName.trim(),
      employeeId: employeeId.trim(),
    });
    setLoading(false);
    if (!result.success) {
      setError(result.message || "Signup failed");
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 40 + webTopInset, paddingBottom: insets.bottom + 20 + webBottomInset },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </Pressable>

          <View style={styles.headerSection}>
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Create your FleetDrive account</Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company Name</Text>
              <View style={styles.inputWrapper}>
                <Feather name="briefcase" size={18} color={Colors.darkGrey} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter company name"
                  placeholderTextColor="#9CA3AF"
                  value={companyName}
                  onChangeText={setCompanyName}
                  editable={!detailsFetched}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Employee ID</Text>
              <View style={styles.inputWrapper}>
                <Feather name="hash" size={18} color={Colors.darkGrey} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter employee ID"
                  placeholderTextColor="#9CA3AF"
                  value={employeeId}
                  onChangeText={setEmployeeId}
                  autoCapitalize="characters"
                  editable={!detailsFetched}
                />
              </View>
            </View>

            {!detailsFetched ? (
              <Pressable
                style={({ pressed }) => [
                  styles.getDetailsBtn,
                  { transform: [{ scale: pressed ? 0.98 : 1 }] },
                ]}
                onPress={handleGetDetails}
              >
                <Feather name="search" size={18} color={Colors.primary} />
                <Text style={styles.getDetailsBtnText}>Get Details</Text>
              </Pressable>
            ) : (
              <>
                {detailsFetched && (
                  <View style={styles.verifiedBox}>
                    <Feather name="check-circle" size={16} color={Colors.success} />
                    <Text style={styles.verifiedText}>
                      Company verified: {companyName}
                    </Text>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Username</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="user" size={18} color={Colors.darkGrey} />
                    <TextInput
                      style={styles.input}
                      placeholder="Choose username"
                      placeholderTextColor="#9CA3AF"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={18} color={Colors.darkGrey} />
                    <TextInput
                      style={styles.input}
                      placeholder="Create password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Feather name="lock" size={18} color={Colors.darkGrey} />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm password"
                      placeholderTextColor="#9CA3AF"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.signupBtn,
                    loading && { opacity: 0.7 },
                    { transform: [{ scale: pressed ? 0.98 : 1 }] },
                  ]}
                  onPress={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.signupBtnText}>Sign Up</Text>
                  )}
                </Pressable>
              </>
            )}
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>Already have an account?</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.loginLink}>Log In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.lightGrey,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  headerSection: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEE2E2",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.danger,
    flex: 1,
  },
  formSection: {
    gap: 18,
    marginBottom: 32,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightGrey,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    color: Colors.textPrimary,
  },
  getDetailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  getDetailsBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
  verifiedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.success + "15",
    padding: 14,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.success,
    flex: 1,
  },
  signupBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  signupBtnText: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: Colors.white,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: "auto",
    paddingBottom: 20,
  },
  loginLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.darkGrey,
  },
  loginLink: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.primary,
  },
});
