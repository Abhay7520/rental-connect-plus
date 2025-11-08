import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp,
  onSnapshot
} from "firebase/firestore";
import { db } from "../../firebase/config";

// Collections
const COLLECTIONS = {
  USERS: "users",
  PROPERTIES: "properties",
  BOOKINGS: "bookings",
  PAYMENTS: "payments",
  ISSUES: "issues",
  ANNOUNCEMENTS: "announcements",
  POLLS: "polls",
  MESSAGES: "messages",
  EVENTS: "events"
};

// Generic CRUD operations
export class FirebaseService {
  // CREATE
  static async create(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // READ ALL
  static async getAll(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  // READ WITH QUERY
  static async getWhere(collectionName: string, field: string, operator: any, value: any) {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  }

  // UPDATE
  static async update(collectionName: string, id: string, data: any) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // DELETE
  static async delete(collectionName: string, id: string) {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return id;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  // REAL-TIME LISTENER
  static onSnapshot(collectionName: string, callback: (data: any[]) => void) {
    return onSnapshot(collection(db, collectionName), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(data);
    });
  }
}

// Specific service methods
export const PropertyService = {
  create: (data: any) => FirebaseService.create(COLLECTIONS.PROPERTIES, data),
  getAll: () => FirebaseService.getAll(COLLECTIONS.PROPERTIES),
  getByOwner: (ownerId: string) => FirebaseService.getWhere(COLLECTIONS.PROPERTIES, "owner_id", "==", ownerId),
  update: (id: string, data: any) => FirebaseService.update(COLLECTIONS.PROPERTIES, id, data),
  delete: (id: string) => FirebaseService.delete(COLLECTIONS.PROPERTIES, id),
  onSnapshot: (callback: (data: any[]) => void) => FirebaseService.onSnapshot(COLLECTIONS.PROPERTIES, callback),
};

export const BookingService = {
  create: (data: any) => FirebaseService.create(COLLECTIONS.BOOKINGS, data),
  getAll: () => FirebaseService.getAll(COLLECTIONS.BOOKINGS),
  getByTenant: (tenantId: string) => FirebaseService.getWhere(COLLECTIONS.BOOKINGS, "tenant_id", "==", tenantId),
  getByProperty: (propertyId: string) => FirebaseService.getWhere(COLLECTIONS.BOOKINGS, "property_id", "==", propertyId),
  update: (id: string, data: any) => FirebaseService.update(COLLECTIONS.BOOKINGS, id, data),
  onSnapshot: (callback: (data: any[]) => void) => FirebaseService.onSnapshot(COLLECTIONS.BOOKINGS, callback),
};

export const PaymentService = {
  create: (data: any) => FirebaseService.create(COLLECTIONS.PAYMENTS, data),
  getAll: () => FirebaseService.getAll(COLLECTIONS.PAYMENTS),
  getByTenant: (tenantId: string) => FirebaseService.getWhere(COLLECTIONS.PAYMENTS, "tenant_id", "==", tenantId),
  getByBooking: (bookingId: string) => FirebaseService.getWhere(COLLECTIONS.PAYMENTS, "booking_id", "==", bookingId),
  update: (id: string, data: any) => FirebaseService.update(COLLECTIONS.PAYMENTS, id, data),
  onSnapshot: (callback: (data: any[]) => void) => FirebaseService.onSnapshot(COLLECTIONS.PAYMENTS, callback),
};

export const IssueService = {
  create: (data: any) => FirebaseService.create(COLLECTIONS.ISSUES, data),
  getAll: () => FirebaseService.getAll(COLLECTIONS.ISSUES),
  getByTenant: (tenantId: string) => FirebaseService.getWhere(COLLECTIONS.ISSUES, "tenant_id", "==", tenantId),
  getByProperty: (propertyId: string) => FirebaseService.getWhere(COLLECTIONS.ISSUES, "property_id", "==", propertyId),
  update: (id: string, data: any) => FirebaseService.update(COLLECTIONS.ISSUES, id, data),
  onSnapshot: (callback: (data: any[]) => void) => FirebaseService.onSnapshot(COLLECTIONS.ISSUES, callback),
};

export const AnnouncementService = {
  create: (data: any) => FirebaseService.create(COLLECTIONS.ANNOUNCEMENTS, data),
  getAll: () => FirebaseService.getAll(COLLECTIONS.ANNOUNCEMENTS),
  onSnapshot: (callback: (data: any[]) => void) => FirebaseService.onSnapshot(COLLECTIONS.ANNOUNCEMENTS, callback),
};

export const UserService = {
  create: (data: any) => FirebaseService.create(COLLECTIONS.USERS, data),
  getAll: () => FirebaseService.getAll(COLLECTIONS.USERS),
  getByEmail: (email: string) => FirebaseService.getWhere(COLLECTIONS.USERS, "email", "==", email),
  update: (id: string, data: any) => FirebaseService.update(COLLECTIONS.USERS, id, data),
  delete: (id: string) => FirebaseService.delete(COLLECTIONS.USERS, id),
};
