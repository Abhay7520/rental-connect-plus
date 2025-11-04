import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
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
  getAllUsers: () => User[];
  deleteUser: (uid: string) => void;
  updateUserRole: (uid: string, role: User['role']) => void;
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

    // Store all users
    const users = JSON.parse(localStorage.getItem("renteazy_users") || "[]");
    users.push(newUser);
    localStorage.setItem("renteazy_users", JSON.stringify(users));

    // Store current user
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

  const getAllUsers = (): User[] => {
    return JSON.parse(localStorage.getItem("renteazy_users") || "[]");
  };

  const deleteUser = (uid: string) => {
    const users = getAllUsers();
    const updatedUsers = users.filter(u => u.uid !== uid);
    localStorage.setItem("renteazy_users", JSON.stringify(updatedUsers));
    
    // If deleting current user, logout
    if (user?.uid === uid) {
      logout();
    }
  };

  const updateUserRole = (uid: string, role: User['role']) => {
    const users = getAllUsers();
    const updatedUsers = users.map(u => 
      u.uid === uid ? { ...u, role } : u
    );
    localStorage.setItem("renteazy_users", JSON.stringify(updatedUsers));
    
    // If updating current user, update state
    if (user?.uid === uid) {
      const updatedUser = { ...user, role };
      localStorage.setItem("renteazy_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout,
      getAllUsers,
      deleteUser,
      updateUserRole,
    }}>
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
