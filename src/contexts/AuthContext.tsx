import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/firebase/config";
import { UserService, UserRolesService } from "@/services/firebaseService";

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

const USE_FIREBASE = true;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (USE_FIREBASE) {
      // Firebase Auth listener
      const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const users = await UserService.getByEmail(firebaseUser.email || "");
            if (users.length > 0) {
              const raw = users[0] as any;
              
              // Fetch role from separate user_roles collection
              let roleData = await UserRolesService.getRole(raw.uid || raw.id);
              
              // Retry once if role not found (handles timing during signup)
              if (!roleData?.role) {
                await new Promise(resolve => setTimeout(resolve, 500));
                roleData = await UserRolesService.getRole(raw.uid || raw.id);
              }
              
              if (!roleData?.role) {
                setLoading(false);
                return;
              }
              
              const userRole = roleData.role as User["role"];
              
              const mappedUser: User = {
                uid: raw.uid || raw.id || "",
                name: raw.name || "",
                email: raw.email || "",
                role: userRole,
                phone: raw.phone,
                address: raw.address,
                createdAt: raw.createdAt || new Date().toISOString(),
                lastLogin: raw.lastLogin,
              };
              
              setUser(mappedUser);
            } else {
              setUser(null);
            }
          } catch (error) {
            console.error("Error loading user:", error);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      const usersUnsubscribe = UserService.onSnapshot(
        async (users) => {
          const usersWithRoles = await Promise.all(
            users.map(async (raw: any) => {
              const roleData = await UserRolesService.getRole(raw.uid || raw.id);
              return {
                uid: raw.uid || raw.id || "",
                name: raw.name || "",
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
        },
        (error) => {
          console.error("Error loading users:", error);
        }
      );

      return () => {
        authUnsubscribe();
        usersUnsubscribe?.();
      };
    } else {
      // localStorage check
      const storedUser = localStorage.getItem("renteazy_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const storedUsers = localStorage.getItem("renteazy_users");
      if (storedUsers) {
        setAllUsers(JSON.parse(storedUsers));
      }

      setLoading(false);
    }
  }, []);

  const signup = async (data: SignupData) => {
    if (USE_FIREBASE) {
      try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const uid = userCredential.user.uid;

        // Create user profile in Firestore
        const userProfileData = {
          uid: uid,
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          address: data.address || "",
          createdAt: new Date().toISOString(),
        };

        await UserService.create({ ...userProfileData, id: uid });

        // Create role in separate user_roles collection
        await UserRolesService.create(uid, data.role);

        // Update local state
        const newUser: User = {
          ...userProfileData,
          role: data.role,
        };
        setUser(newUser);
      } catch (error: any) {
        const message = error.code === "auth/email-already-in-use" 
          ? "Email already in use. Please login instead."
          : error.message || "Signup failed";
        throw new Error(message);
      }
    } else {
      // localStorage signup
      const newUser: User = {
        uid: `user_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        address: data.address,
        createdAt: new Date().toISOString(),
      };

      const users = JSON.parse(localStorage.getItem("renteazy_users") || "[]");
      users.push(newUser);
      localStorage.setItem("renteazy_users", JSON.stringify(users));
      localStorage.setItem("renteazy_user", JSON.stringify(newUser));
      setUser(newUser);
      setAllUsers(users);
    }
  };

  const login = async (email: string, password: string) => {
    if (USE_FIREBASE) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const users = await UserService.getByEmail(email);
        if (users.length > 0) {
          const raw = users[0] as any;
          const lastLogin = new Date().toISOString();
          
          // Fetch role from separate collection
          const roleData = await UserRolesService.getRole(raw.uid || raw.id);
          
          if (!roleData?.role) {
            throw new Error("User role not found. Please contact administrator.");
          }
          
          const userRole = roleData.role as User["role"];
          
          const mappedUser: User = {
            uid: raw.uid || raw.id || "",
            name: raw.name || "",
            email: raw.email || "",
            role: userRole,
            phone: raw.phone,
            address: raw.address,
            createdAt: raw.createdAt || new Date().toISOString(),
            lastLogin: lastLogin,
          };
          
          await UserService.update(raw.uid || raw.id, { lastLogin });
          setUser(mappedUser);
        } else {
          throw new Error("User profile not found. Please contact administrator.");
        }
      } catch (error: any) {
        const message = error.code === "auth/invalid-credential" 
          ? "Invalid email or password."
          : error.message || "Login failed";
        throw new Error(message);
      }
    } else {
      // localStorage login
      const users = JSON.parse(localStorage.getItem("renteazy_users") || "[]");
      const existingUser = users.find((u: User) => u.email === email);

      if (existingUser) {
        localStorage.setItem("renteazy_user", JSON.stringify(existingUser));
        setUser(existingUser);
      } else {
        throw new Error("User not found. Please sign up first.");
      }
    }
  };

  const logout = () => {
    if (USE_FIREBASE) {
      signOut(auth);
    } else {
      localStorage.removeItem("renteazy_user");
    }
    setUser(null);
  };

  const getAllUsers = (): User[] => {
    if (USE_FIREBASE) {
      return allUsers;
    } else {
      return JSON.parse(localStorage.getItem("renteazy_users") || "[]");
    }
  };

  const deleteUser = async (uid: string) => {
    if (USE_FIREBASE) {
      try {
        await UserService.delete(uid);
        await UserRolesService.delete(uid);
        
        const updatedUsers = allUsers.filter((u) => u.uid !== uid);
        setAllUsers(updatedUsers);
      } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
      }
    } else {
      const users = getAllUsers();
      const updatedUsers = users.filter((u) => u.uid !== uid);
      localStorage.setItem("renteazy_users", JSON.stringify(updatedUsers));
      setAllUsers(updatedUsers);
    }

    if (user?.uid === uid) {
      logout();
    }
  };

  const updateUserRole = async (uid: string, role: User["role"]) => {
    if (USE_FIREBASE) {
      try {
        await UserRolesService.updateRole(uid, role, user?.uid || "admin");
        
        const updatedUsers = allUsers.map((u) => (u.uid === uid ? { ...u, role } : u));
        setAllUsers(updatedUsers);
      } catch (error) {
        console.error("Error updating role:", error);
        throw error;
      }
    } else {
      const users = getAllUsers();
      const updatedUsers = users.map((u) => (u.uid === uid ? { ...u, role } : u));
      localStorage.setItem("renteazy_users", JSON.stringify(updatedUsers));
      setAllUsers(updatedUsers);

      if (user?.uid === uid) {
        const updatedUser = { ...user, role };
        localStorage.setItem("renteazy_user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
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