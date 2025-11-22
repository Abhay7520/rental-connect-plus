import {
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase/config";

// ============ USER SERVICE ============
export const UserService = {
  async create(data) {
    try {
      console.log("🔵 [UserService] Creating user:", data.email);
      const userData = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      // If data has id, use setDoc (explicit ID), otherwise use addDoc
      if (data.id) {
        const userRef = doc(db, "users", data.id);
        await setDoc(userRef, userData);
        console.log("✅ [UserService] User created with ID:", data.id);
        return { id: data.id, ...userData };
      } else {
        const docRef = await addDoc(collection(db, "users"), userData);
        console.log("✅ [UserService] User created with ID:", docRef.id);
        return { id: docRef.id, ...userData };
      }
    } catch (error) {
      console.error("❌ [UserService] Create error:", error);
      throw error;
    }
  },

  async getByEmail(email) {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error("❌ [UserService] GetByEmail error:", error);
      return [];
    }
  },

  async update(uid, data) {
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, data);
      console.log("✅ [UserService] User updated");
    } catch (error) {
      console.error("❌ [UserService] Update error:", error);
      throw error;
    }
  },

  async delete(uid) {
    try {
      const userRef = doc(db, "users", uid);
      await deleteDoc(userRef);
      console.log("✅ [UserService] User deleted");
    } catch (error) {
      console.error("❌ [UserService] Delete error:", error);
      throw error;
    }
  },

  onSnapshot(callback, errorCallback) {
    try {
      const q = query(collection(db, "users"));
      return onSnapshot(
        q,
        (snapshot) => {
          const results = [];
          snapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
          });
          callback(results);
        },
        errorCallback
      );
    } catch (error) {
      console.error("❌ [UserService] onSnapshot error:", error);
      if (errorCallback) errorCallback(error);
    }
  },
};

// ============ PROPERTY SERVICE ============
export const PropertyService = {
  async create(data) {
    try {
      console.log("🔵 [PropertyService] Creating property:", data.title);
      const propertyData = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
      };

      if (data.id) {
        const propRef = doc(db, "properties", data.id);
        await setDoc(propRef, propertyData);
        console.log("✅ [PropertyService] Property created with ID:", data.id);
        return { id: data.id, ...propertyData };
      } else {
        const docRef = await addDoc(collection(db, "properties"), propertyData);
        console.log("✅ [PropertyService] Property created with ID:", docRef.id);
        return { id: docRef.id, ...propertyData };
      }
    } catch (error) {
      console.error("❌ [PropertyService] Create error:", error);
      throw error;
    }
  },

  async getByOwnerId(ownerId) {
    try {
      const q = query(
        collection(db, "properties"),
        where("owner_id", "==", ownerId)
      );
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error("❌ [PropertyService] GetByOwnerId error:", error);
      return [];
    }
  },

  async getAll() {
    try {
      const q = query(collection(db, "properties"));
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error("❌ [PropertyService] GetAll error:", error);
      return [];
    }
  },

  async update(id, data) {
    try {
      const propRef = doc(db, "properties", id);
      await updateDoc(propRef, data);
      console.log("✅ [PropertyService] Property updated");
    } catch (error) {
      console.error("❌ [PropertyService] Update error:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const propRef = doc(db, "properties", id);
      await deleteDoc(propRef);
      console.log("✅ [PropertyService] Property deleted");
    } catch (error) {
      console.error("❌ [PropertyService] Delete error:", error);
      throw error;
    }
  },

  async onSnapshot(callback, errorCallback) {
    try {
      const q = query(collection(db, "properties"));
      return onSnapshot(
        q,
        (snapshot) => {
          const results = [];
          snapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
          });
          callback(results);
        },
        errorCallback
      );
    } catch (error) {
      console.error("❌ [PropertyService] onSnapshot error:", error);
      errorCallback(error);
    }
  },
};

// ============ BOOKING SERVICE ============
export const BookingService = {
  async create(data) {
    try {
      console.log("🔵 [BookingService] Creating booking:", data);

      const bookingData = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Use addDoc for auto ID generation
      const docRef = await addDoc(collection(db, "bookings"), bookingData);

      console.log("✅ [BookingService] Booking created with ID:", docRef.id);
      return { id: docRef.id, ...bookingData };
    } catch (error) {
      console.error("❌ [BookingService] Create error:", error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      console.log("🔵 [BookingService] Updating booking:", id, data);

      const bookingRef = doc(db, "bookings", id);
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      };

      await updateDoc(bookingRef, updateData);

      console.log("✅ [BookingService] Booking updated");
      return { id, ...updateData };
    } catch (error) {
      console.error("❌ [BookingService] Update error:", error);
      throw error;
    }
  },

  async getByTenantId(tenantId) {
    try {
      console.log("🔵 [BookingService] Fetching bookings for tenant:", tenantId);

      const q = query(
        collection(db, "bookings"),
        where("tenant_id", "==", tenantId)
      );

      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      console.log("✅ [BookingService] Got tenant bookings:", results.length);
      return results;
    } catch (error) {
      console.error("❌ [BookingService] GetByTenantId error:", error);
      return [];
    }
  },

  async getByPropertyId(propertyId) {
    try {
      const q = query(
        collection(db, "bookings"),
        where("property_id", "==", propertyId)
      );

      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      return results;
    } catch (error) {
      console.error("❌ [BookingService] GetByPropertyId error:", error);
      return [];
    }
  },

  async delete(id) {
    try {
      console.log("🔵 [BookingService] Deleting booking:", id);

      const bookingRef = doc(db, "bookings", id);
      await deleteDoc(bookingRef);

      console.log("✅ [BookingService] Booking deleted");
    } catch (error) {
      console.error("❌ [BookingService] Delete error:", error);
      throw error;
    }
  },

  async getAll() {
    try {
      const q = query(collection(db, "bookings"));
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error("❌ [BookingService] GetAll error:", error);
      return [];
    }
  },

  async onSnapshot(callback, errorCallback) {
    try {
      const q = query(collection(db, "bookings"));
      return onSnapshot(
        q,
        (snapshot) => {
          const results = [];
          snapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
          });
          callback(results);
        },
        errorCallback
      );
    } catch (error) {
      console.error("❌ [BookingService] onSnapshot error:", error);
      errorCallback(error);
    }
  },
};

// ============ ISSUE SERVICE ============
export const IssueService = {
  async create(data) {
    try {
      console.log("🔵 [IssueService] Creating issue:", data);

      const issueData = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "issues"), issueData);

      console.log("✅ [IssueService] Issue created with ID:", docRef.id);
      return { id: docRef.id, ...issueData };
    } catch (error) {
      console.error("❌ [IssueService] Create error:", error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      console.log("🔵 [IssueService] Updating issue:", id);

      const issueRef = doc(db, "issues", id);
      await updateDoc(issueRef, {
        ...data,
        updated_at: new Date().toISOString(),
      });

      console.log("✅ [IssueService] Issue updated");
    } catch (error) {
      console.error("❌ [IssueService] Update error:", error);
      throw error;
    }
  },

  async getByTenantId(tenantId) {
    try {
      const q = query(
        collection(db, "issues"),
        where("tenant_id", "==", tenantId)
      );

      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      return results;
    } catch (error) {
      console.error("❌ Error getting tenant issues:", error);
      return [];
    }
  },

  async getByPropertyId(propertyId) {
    try {
      const q = query(
        collection(db, "issues"),
        where("property_id", "==", propertyId)
      );

      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      return results;
    } catch (error) {
      console.error("❌ Error getting property issues:", error);
      return [];
    }
  },

  async delete(id) {
    try {
      const issueRef = doc(db, "issues", id);
      await deleteDoc(issueRef);
      console.log("✅ [IssueService] Issue deleted");
    } catch (error) {
      console.error("❌ [IssueService] Delete error:", error);
      throw error;
    }
  },

  async getAll() {
    try {
      const q = query(collection(db, "issues"));
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error("❌ [IssueService] GetAll error:", error);
      return [];
    }
  },

  async onSnapshot(callback, errorCallback) {
    try {
      const q = query(collection(db, "issues"));
      return onSnapshot(
        q,
        (snapshot) => {
          const results = [];
          snapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
          });
          callback(results);
        },
        errorCallback
      );
    } catch (error) {
      console.error("❌ [IssueService] onSnapshot error:", error);
      errorCallback(error);
    }
  },
};

// ============ PAYMENT SERVICE ============
export const PaymentService = {
  async create(data) {
    try {
      const paymentData = {
        ...data,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "payments"), paymentData);
      return { id: docRef.id, ...paymentData };
    } catch (error) {
      console.error("❌ [PaymentService] Create error:", error);
      throw error;
    }
  },

  async getByTenantId(tenantId) {
    try {
      const q = query(
        collection(db, "payments"),
        where("tenant_id", "==", tenantId)
      );

      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      return results;
    } catch (error) {
      console.error("❌ [PaymentService] GetByTenantId error:", error);
      return [];
    }
  },

  async update(id, data) {
    try {
      const paymentRef = doc(db, "payments", id);
      await updateDoc(paymentRef, data);
      console.log("✅ [PaymentService] Payment updated");
    } catch (error) {
      console.error("❌ [PaymentService] Update error:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const paymentRef = doc(db, "payments", id);
      await deleteDoc(paymentRef);
      console.log("✅ [PaymentService] Payment deleted");
    } catch (error) {
      console.error("❌ [PaymentService] Delete error:", error);
      throw error;
    }
  },

  async getAll() {
    try {
      const q = query(collection(db, "payments"));
      const snapshot = await getDocs(q);
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      return results;
    } catch (error) {
      console.error("❌ [PaymentService] GetAll error:", error);
      return [];
    }
  },

  async onSnapshot(callback, errorCallback) {
    try {
      const q = query(collection(db, "payments"));
      return onSnapshot(
        q,
        (snapshot) => {
          const results = [];
          snapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
          });
          callback(results);
        },
        errorCallback
      );
    } catch (error) {
      console.error("❌ [PaymentService] onSnapshot error:", error);
      errorCallback(error);
    }
  },
};