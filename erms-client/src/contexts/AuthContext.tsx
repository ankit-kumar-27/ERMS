import React, { createContext, useContext, useState, useEffect } from "react";
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

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth/profile");
      setUser(response.data);
      sessionStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      setUser(null);
      sessionStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(); // ✅ ensure this is called on mount
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
