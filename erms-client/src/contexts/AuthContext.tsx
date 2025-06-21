import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../config/api";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  skills?: string[];
  seniority?: string;
  maxCapacity?: number;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  fetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    console.log("🔍 fetchProfile called");
    
    // Check if user exists in sessionStorage first
    const storedUser = sessionStorage.getItem("user");
    console.log("📦 Stored user:", storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("✅ Using stored user:", parsedUser);
        setUser(parsedUser);
        setLoading(false);
        return;
      } catch (error) {
        console.error("❌ Error parsing stored user:", error);
        sessionStorage.removeItem("user");
      }
    }

    // Check if token exists
    const token = sessionStorage.getItem("token");
    console.log("🔑 Token exists:", !!token);
    
    if (!token) {
      console.log("❌ No token found, setting loading to false");
      setLoading(false);
      return;
    }

    setLoading(true);
    console.log("🌐 Making API call to /auth/profile");
    
    try {
      const response = await api.get("/auth/profile");
      console.log("✅ API response:", response.data);
      setUser(response.data);
      sessionStorage.setItem("user", JSON.stringify(response.data));
    } catch (error: any) {
      console.error("❌ Error fetching profile:", error);
      console.error("❌ Error response:", error.response?.data);
      setUser(null);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};