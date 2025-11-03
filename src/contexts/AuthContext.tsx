import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  uid: string;
  name: string;
  email: string;
  role: "tenant" | "owner" | "admin";
  phone?: string;
  address?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: "tenant" | "owner" | "admin";
  phone?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("renteazy_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signup = async (data: SignupData) => {
    // Mock signup - in real app this would call Firebase
    const newUser: User = {
      uid: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
      address: data.address,
      createdAt: new Date().toISOString(),
    };

    // Store user in localStorage and state
    localStorage.setItem("renteazy_user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    // Mock login - check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("renteazy_users") || "[]");
    const existingUser = users.find((u: User) => u.email === email);

    if (existingUser) {
      localStorage.setItem("renteazy_user", JSON.stringify(existingUser));
      setUser(existingUser);
    } else {
      throw new Error("User not found. Please sign up first.");
    }
  };

  const logout = () => {
    localStorage.removeItem("renteazy_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
