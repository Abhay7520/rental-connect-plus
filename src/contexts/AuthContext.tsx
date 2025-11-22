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
        console.log("Auth state changed:", firebaseUser?.uid);

        if (firebaseUser) {
          try {
            // Get user data from Firestore (WITHOUT role)
            const users = await UserService.getByEmail(firebaseUser.email || "");
            if (users.length > 0) {
              const raw = users[0] as any;
              
              // ✅ SECURITY: Fetch role from separate user_roles collection
              const roleData = await UserRolesService.getRole(raw.uid || raw.id);
              const userRole = (roleData?.role as User["role"]) || "tenant";
              
              const mappedUser: User = {
                uid: raw.uid || raw.id || "",
                name: raw.name || "",
                email: raw.email || "",
                role: userRole, // ✅ Role from secure collection
                phone: raw.phone,
                address: raw.address,
                createdAt: raw.createdAt || new Date().toISOString(),
                lastLogin: raw.lastLogin,
              };
              setUser(mappedUser);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      // Set up real-time listener for ALL users AND their roles (for admin dashboard)
      const usersUnsubscribe = UserService.onSnapshot(
        async (users) => {
          // ✅ SECURITY: Fetch roles separately for each user
          const usersWithRoles = await Promise.all(
            users.map(async (raw: any) => {
              const roleData = await UserRolesService.getRole(raw.uid || raw.id);
              return {
                uid: raw.uid || raw.id || "",
                name: raw.name || "",
                email: raw.email || "",
                role: (roleData?.role as User["role"]) || "tenant", // ✅ Role from secure collection
                phone: raw.phone,
                address: raw.address,
                createdAt: raw.createdAt || new Date().toISOString(),
                lastLogin: raw.lastLogin,
              };
            })
          );
          setAllUsers(usersWithRoles);
          console.log("✅ Loaded all users with secure roles:", usersWithRoles.length);
        },
        (error) => {
          console.error("❌ Error in users listener:", error);
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
        console.log("Starting Firebase signup...");

        // Step 1: Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);

        const uid = userCredential.user.uid;
        console.log("Firebase user created:", uid);

        // Step 2: Create user profile in Firestore (WITHOUT role)
        const userProfileData = {
          uid: uid,
          name: data.name,
          email: data.email,
          phone: data.phone || "",
          address: data.address || "",
          createdAt: new Date().toISOString(),
        };

        await UserService.create({ ...userProfileData, id: uid });
        console.log("User profile created in Firestore");

        // Step 3: ✅ SECURITY: Create role in separate user_roles collection
        await UserRolesService.create(uid, data.role);
        console.log("✅ User role created in secure collection");

        // Update local state with complete user object
        const newUser: User = {
          ...userProfileData,
          role: data.role,
        };
        setUser(newUser);
      } catch (error: any) {
        console.error("Signup error:", error);
        throw new Error(error.message || "Signup failed");
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
        console.log("Starting Firebase login...");

        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Firebase login successful:", userCredential.user.uid);

        const users = await UserService.getByEmail(email);
        if (users.length > 0) {
          const raw = users[0] as any;
          const lastLogin = new Date().toISOString();
          
          // ✅ SECURITY: Fetch role from separate collection
          const roleData = await UserRolesService.getRole(raw.uid || raw.id);
          const userRole = (roleData?.role as User["role"]) || "tenant";
          
          const mappedUser: User = {
            uid: raw.uid || raw.id || "",
            name: raw.name || "",
            email: raw.email || "",
            role: userRole, // ✅ Role from secure collection
            phone: raw.phone,
            address: raw.address,
            createdAt: raw.createdAt || new Date().toISOString(),
            lastLogin: lastLogin,
          };
          
          // Update lastLogin in Firebase
          await UserService.update(raw.uid || raw.id, { lastLogin });
          
          setUser(mappedUser);
        }
      } catch (error: any) {
        console.error("Login error:", error);
        throw new Error(error.message || "Login failed");
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
        // Delete from both collections
        await UserService.delete(uid);
        await UserRolesService.delete(uid);
        console.log("✅ User and role deleted from Firestore");
        
        // Update local state
        const updatedUsers = allUsers.filter((u) => u.uid !== uid);
        setAllUsers(updatedUsers);
      } catch (error) {
        console.error("❌ Delete user error:", error);
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
        // ✅ SECURITY: Update role in secure user_roles collection only
        await UserRolesService.updateRole(uid, role, user?.uid || "admin");
        console.log("✅ User role updated in secure collection");
        
        // Update local state
        const updatedUsers = allUsers.map((u) => (u.uid === uid ? { ...u, role } : u));
        setAllUsers(updatedUsers);
      } catch (error) {
        console.error("❌ Update role error:", error);
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