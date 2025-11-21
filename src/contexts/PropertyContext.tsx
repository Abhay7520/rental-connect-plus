import React, { createContext, useContext, useState, useEffect } from "react";
import { BookingService, IssueService, PropertyService, PaymentService } from "@/services/firebaseService";

// Types
interface Booking {
  id: string;
  tenant_id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  status: "pending" | "confirmed" | "cancelled";
  amount?: number;
  created_at: string;
  updated_at: string;
}

interface Issue {
  id: string;
  property_id: string;
  tenant_id: string;
  title: string;
  description: string;
  status: "reported" | "investigating" | "resolved" | "closed";
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

interface Property {
  id: string;
  owner_id: string;
  title: string;
  description?: string;
  location: string;
  rent_price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  amenities?: string[];
  images?: string[];
  available: boolean;
  status?: "active" | "inactive";
  createdAt: string;
}

interface Payment {
  id: string;
  tenant_id: string;
  booking_id: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
  date?: string;
  razorpay_payment_id?: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "festival" | "maintenance" | "event" | "general";
  created_by: string;
  created_at: string;
  date: string;
}

interface PropertyContextType {
  // Properties
  properties: Property[];
  loading: boolean;
  getPropertyById: (id: string) => Property | undefined;
  getActiveProperties: () => Property[];
  getOwnerProperties: (ownerId: string) => Property[];
  addProperty: (data: any) => Promise<void>;
  updateProperty: (id: string, data: any) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  
  // Bookings
  bookings: Booking[];
  createBooking: (data: any) => Promise<Booking>;
  updateBooking: (id: string, data: any) => Promise<void>;
  getTenantBookings: (tenantId: string) => Booking[];
  getOwnerBookings: (ownerId: string) => Booking[];
  
  // Issues
  addIssue: (data: any) => Promise<void>;
  updateIssue: (id: string, data: any) => Promise<void>;
  getTenantIssues: (tenantId: string) => Issue[];
  getOwnerIssues: (ownerId: string) => Issue[];
  
  // Payments
  payments: Payment[];
  addPayment: (data: any) => Promise<void>;
  getTenantPayments: (tenantId: string) => Payment[];
  getOwnerPayments: (ownerId: string) => Payment[];
  
  // Announcements
  getAnnouncements: () => Announcement[];
  addAnnouncement: (data: any) => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // ============ PROPERTIES ============
  const getPropertyById = (id: string) => {
    return properties.find(p => p.id === id);
  };

  const getActiveProperties = () => {
    return properties.filter(p => p.available === true);
  };

  const getOwnerProperties = (ownerId: string) => {
    return properties.filter(p => p.owner_id === ownerId);
  };

  const addProperty = async (data: any) => {
    try {
      const newProperty = await PropertyService.create(data);
      setProperties([...properties, newProperty as Property]);
    } catch (error) {
      console.error("Error adding property:", error);
      throw error;
    }
  };

  const updateProperty = async (id: string, data: any) => {
    try {
      await PropertyService.update(id, data);
      setProperties(properties.map(p => p.id === id ? { ...p, ...data } : p));
    } catch (error) {
      console.error("Error updating property:", error);
      throw error;
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      await PropertyService.delete(id);
      setProperties(properties.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting property:", error);
      throw error;
    }
  };

  // ============ BOOKINGS ============
  const createBooking = async (data: any) => {
    try {
      console.log("🔵 [PropertyContext] Creating booking:", data);
      const booking = await BookingService.create({
        tenant_id: data.tenant_id,
        property_id: data.property_id,
        start_date: data.start_date,
        end_date: data.end_date,
        status: "pending",
        amount: data.amount || 0,
      });
      setBookings([...bookings, booking as Booking]);
      console.log("✅ [PropertyContext] Booking created:", booking.id);
      return booking as Booking;
    } catch (error) {
      console.error("❌ [PropertyContext] Error creating booking:", error);
      throw error;
    }
  };

  const updateBooking = async (id: string, data: any) => {
    try {
      console.log("🔵 [PropertyContext] Updating booking:", id, data);
      await BookingService.update(id, data);
      setBookings(bookings.map(b => b.id === id ? { ...b, ...data } : b));
      console.log("✅ [PropertyContext] Booking updated");
    } catch (error) {
      console.error("❌ [PropertyContext] Error updating booking:", error);
      throw error;
    }
  };

  const getTenantBookings = (tenantId: string): Booking[] => {
    return bookings.filter(b => b.tenant_id === tenantId);
  };

  const getOwnerBookings = (ownerId: string): Booking[] => {
    try {
      const ownerProperties = properties.filter(p => p.owner_id === ownerId);
      const propertyIds = ownerProperties.map(p => p.id);
      return bookings.filter(b => propertyIds.includes(b.property_id));
    } catch (error) {
      console.error("❌ [PropertyContext] Error getting owner bookings:", error);
      return [];
    }
  };

  // ============ ISSUES ============
  const addIssue = async (data: any) => {
    try {
      console.log("🔵 [PropertyContext] Creating issue:", data);
      const issue = await IssueService.create(data);
      setIssues([...issues, issue as Issue]);
      console.log("✅ [PropertyContext] Issue created:", issue.id);
    } catch (error) {
      console.error("❌ [PropertyContext] Error creating issue:", error);
      throw error;
    }
  };

  const updateIssue = async (id: string, data: any) => {
    try {
      console.log("🔵 [PropertyContext] Updating issue:", id);
      await IssueService.update(id, data);
      setIssues(issues.map(i => i.id === id ? { ...i, ...data } : i));
      console.log("✅ [PropertyContext] Issue updated");
    } catch (error) {
      console.error("❌ [PropertyContext] Error updating issue:", error);
      throw error;
    }
  };

  const getTenantIssues = (tenantId: string): Issue[] => {
    return issues.filter(i => i.tenant_id === tenantId);
  };

  const getOwnerIssues = (ownerId: string): Issue[] => {
    try {
      const ownerProperties = properties.filter(p => p.owner_id === ownerId);
      const propertyIds = ownerProperties.map(p => p.id);
      return issues.filter(i => propertyIds.includes(i.property_id));
    } catch (error) {
      console.error("❌ [PropertyContext] Error getting owner issues:", error);
      return [];
    }
  };

  // ============ PAYMENTS ============
  const addPayment = async (data: any) => {
    try {
      const payment = await PaymentService.create(data);
      if (payment) {
        setPayments([...payments, payment as Payment]);
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  };

  const getTenantPayments = (tenantId: string): Payment[] => {
    return payments.filter(p => p.tenant_id === tenantId);
  };

  const getOwnerPayments = (ownerId: string): Payment[] => {
    try {
      const ownerProperties = properties.filter(p => p.owner_id === ownerId);
      const propertyIds = ownerProperties.map(p => p.id);
      
      const ownerBookings = bookings.filter(b => propertyIds.includes(b.property_id));
      const bookingIds = ownerBookings.map(b => b.id);
      
      return payments.filter(p => bookingIds.includes(p.booking_id));
    } catch (error) {
      console.error("❌ [PropertyContext] Error getting owner payments:", error);
      return [];
    }
  };

  // ============ ANNOUNCEMENTS ============
  const getAnnouncements = (): Announcement[] => {
    return announcements.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const addAnnouncement = async (data: any) => {
    try {
      const now = new Date().toISOString();
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title: data.title || "",
        message: data.message,
        type: data.type || "general",
        created_by: data.posted_by || data.created_by,
        created_at: now,
        date: now,
      };
      setAnnouncements([...announcements, newAnnouncement]);
    } catch (error) {
      console.error("Error adding announcement:", error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load properties
        const allProps = await PropertyService.getAll();
        setProperties(allProps as Property[]);

        // Subscribe to properties updates
        PropertyService.onSnapshot(
          (data) => setProperties(data as Property[]),
          (error) => console.error("Error loading properties:", error)
        );
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <PropertyContext.Provider
      value={{
        properties,
        loading,
        getPropertyById,
        getActiveProperties,
        getOwnerProperties,
        addProperty,
        updateProperty,
        deleteProperty,
        bookings,
        createBooking,
        updateBooking,
        getTenantBookings,
        getOwnerBookings,
        addIssue,
        updateIssue,
        getTenantIssues,
        getOwnerIssues,
        payments,
        addPayment,
        getTenantPayments,
        getOwnerPayments,
        getAnnouncements,
        addAnnouncement,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("useProperty must be used within PropertyProvider");
  }
  return context;
};

export default PropertyProvider;