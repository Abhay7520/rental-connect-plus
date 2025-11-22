import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/firebase/config";
import { UserService } from "@/services/firebaseService";

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
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("Auth state changed:", firebaseUser?.uid);

        if (firebaseUser) {
          try {
            // Get user data from Firestore
            const users = await UserService.getByEmail(firebaseUser.email || "");
            if (users.length > 0) {
              const raw = users[0] as any;
              const mappedUser: User = {
                uid: raw.uid || raw.id || "",
                name: raw.name || "",
                email: raw.email || "",
                role: (raw.role as User["role"]) || "tenant",
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

      return () => unsubscribe();
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

        // Step 2: Create user document in Firestore with EXPLICIT UID as ID
        const newUser: User = {
          uid: uid,
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone,
          address: data.address,
          createdAt: new Date().toISOString(),
        };

        // ✅ IMPORTANT: Pass id so UserService uses setDoc with explicit ID
        await UserService.create({ ...newUser, id: uid });
        console.log("User document created in Firestore with UID as ID");

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
          const mappedUser: User = {
            uid: raw.uid || raw.id || "",
            name: raw.name || "",
            email: raw.email || "",
            role: (raw.role as User["role"]) || "tenant",
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

  const deleteUser = (uid: string) => {
    const users = getAllUsers();
    const updatedUsers = users.filter((u) => u.uid !== uid);
    localStorage.setItem("renteazy_users", JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);

    if (user?.uid === uid) {
      logout();
    }
  };

  const updateUserRole = (uid: string, role: User["role"]) => {
    const users = getAllUsers();
    const updatedUsers = users.map((u) => (u.uid === uid ? { ...u, role } : u));
    localStorage.setItem("renteazy_users", JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);

    if (user?.uid === uid) {
      const updatedUser = { ...user, role };
      localStorage.setItem("renteazy_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
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