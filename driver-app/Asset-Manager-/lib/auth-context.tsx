import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/lib/query-client";

interface UserData {
  id: string;
  username: string;
  name: string;
  companyName: string;
  employeeId: string;
  vehicleNo: string;
  vehicleType: string;
  fuelType: string;
  capacity: string;
  phoneNo: string;
}

interface AuthContextValue {
  user: UserData | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (data: { username: string; password: string; companyName: string; employeeId: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<UserData>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const stored = await AsyncStorage.getItem("fleetdrive_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load user:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const data = await res.json();
      const userData = data.user as UserData;
      setUser(userData);
      await AsyncStorage.setItem("fleetdrive_user", JSON.stringify(userData));
      return { success: true };
    } catch (e: any) {
      const msg = e.message || "Login failed";
      if (msg.includes("401")) {
        return { success: false, message: "Invalid username or password" };
      }
      return { success: false, message: "Connection error. Please try again." };
    }
  };

  const signup = async (data: { username: string; password: string; companyName: string; employeeId: string }) => {
    try {
      const res = await apiRequest("POST", "/api/auth/signup", data);
      const result = await res.json();
      const userData = result.user as UserData;
      setUser(userData);
      await AsyncStorage.setItem("fleetdrive_user", JSON.stringify(userData));
      return { success: true };
    } catch (e: any) {
      const msg = e.message || "Signup failed";
      if (msg.includes("409")) {
        return { success: false, message: "Username already taken" };
      }
      return { success: false, message: "Connection error. Please try again." };
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("fleetdrive_user");
  };

  const updateUser = (data: Partial<UserData>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      AsyncStorage.setItem("fleetdrive_user", JSON.stringify(updated));
    }
  };

  const value = useMemo(
    () => ({ user, isLoading, login, signup, logout, updateUser }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
