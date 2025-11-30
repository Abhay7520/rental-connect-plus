import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserService, UserRolesService } from "@/services/apiService";

export interface User {
  uid: string;
  name: string;
  email: string;
  role: "tenant" | "owner" | "admin";
  phone?: string;
  address?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  getAllUsers: () => User[];
  deleteUser: (uid: string) => void;
  updateUserRole: (uid: string, role: User["role"]) => void;
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
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Check local storage for session
    const storedUser = localStorage.getItem("renteazy_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);

    // Load all users with real-time sync
    const unsub = UserService.onSnapshot(async (users) => {
      const usersWithRoles = await Promise.all(
        users.map(async (raw: any) => {
          const roleData = await UserRolesService.getRole(raw._id || raw.uid || raw.id);
          return {
            uid: raw._id || raw.uid || raw.id || "",
            name: raw.displayName || raw.name || "",
            email: raw.email || "",
            role: (roleData?.role as User["role"]) || "tenant",
            phone: raw.phone,
            address: raw.address,
            createdAt: raw.createdAt || new Date().toISOString(),
            lastLogin: raw.lastLogin,
          };
        })
      );
      setAllUsers(usersWithRoles);
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const signup = async (data: SignupData) => {
    try {
      // Create user in backend
      const userProfileData = {
        displayName: data.name,
        email: data.email,
        password: data.password, // Send password to backend
        phone: data.phone || "",
        address: data.address || "",
        createdAt: new Date().toISOString(),
      };

      // UserService.create calls POST /api/users
      const createdUser = await UserService.create(userProfileData);
      const uid = createdUser._id || createdUser.id; // MongoDB uses _id

      // Create role
      await UserRolesService.create(uid, data.role);

      const newUser: User = {
        uid: uid,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        address: data.address,
        createdAt: userProfileData.createdAt,
      };

      localStorage.setItem("renteazy_user", JSON.stringify(newUser));
      setUser(newUser);
    } catch (error: any) {
      console.error("Signup error:", error);
      throw new Error(error.message || "Signup failed");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Call login endpoint
      const rawUser = await UserService.login(email, password);

      const uid = rawUser._id || rawUser.id;

      // Fetch role
      let roleData = await UserRolesService.getRole(uid);

      // If role is missing, auto-create it as 'tenant' (migration fallback)
      if (!roleData?.role) {
        console.warn("⚠️ User role missing, auto-creating as 'tenant' for:", uid);
        await UserRolesService.create(uid, "tenant");
        roleData = { role: "tenant" };
      }

      const userRole = roleData.role as User["role"];

      const mappedUser: User = {
        uid: uid,
        name: rawUser.displayName || rawUser.name || "",
        email: rawUser.email || "",
        role: userRole,
        phone: rawUser.phone,
        address: rawUser.address,
        createdAt: rawUser.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      localStorage.setItem("renteazy_user", JSON.stringify(mappedUser));
      setUser(mappedUser);
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("renteazy_user");
    setUser(null);
  };

  const getAllUsers = (): User[] => {
    return allUsers;
  };

  const deleteUser = async (uid: string) => {
    try {
      await UserService.delete(uid);
      // Also delete role?
      await UserRolesService.delete(uid);

      // Optimistic update not needed if polling is fast enough, but good for UX
      const updatedUsers = allUsers.filter((u) => u.uid !== uid);
      setAllUsers(updatedUsers);

      if (user?.uid === uid) {
        logout();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const updateUserRole = async (uid: string, role: User["role"]) => {
    try {
      await UserRolesService.updateRole(uid, role, user?.uid || "admin");

      // Optimistic update
      const updatedUsers = allUsers.map((u) => (u.uid === uid ? { ...u, role } : u));
      setAllUsers(updatedUsers);

      if (user?.uid === uid) {
        const updatedUser = { ...user, role };
        localStorage.setItem("renteazy_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        getAllUsers,
        deleteUser,
        updateUserRole,
      }}
    >
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