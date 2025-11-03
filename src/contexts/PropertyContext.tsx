import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  rent_price: number;
  location: string;
  amenities: string[];
  images: string[];
  status: "active" | "inactive";
  createdAt: string;
}

export interface Booking {
  id: string;
  tenant_id: string;
  property_id: string;
  start_date: string;
  end_date: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  tenant_id: string;
  amount: number;
  date: string;
  status: "completed" | "failed" | "pending";
  razorpay_payment_id?: string;
}

export interface Issue {
  id: string;
  tenant_id: string;
  property_id: string;
  title: string;
  description: string;
  attachments: string[];
  status: "reported" | "investigating" | "resolved" | "closed";
  created_at: string;
}

interface PropertyContextType {
  properties: Property[];
  bookings: Booking[];
  payments: Payment[];
  issues: Issue[];
  addProperty: (property: Omit<Property, "id" | "owner_id" | "createdAt">) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  getOwnerProperties: (ownerId: string) => Property[];
  getActiveProperties: () => Property[];
  getPropertyById: (id: string) => Property | undefined;
  addBooking: (booking: Omit<Booking, "id" | "createdAt">) => string;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  getTenantBookings: (tenantId: string) => Booking[];
  addPayment: (payment: Omit<Payment, "id">) => void;
  getTenantPayments: (tenantId: string) => Payment[];
  addIssue: (issue: Omit<Issue, "id" | "created_at">) => void;
  updateIssue: (id: string, issue: Partial<Issue>) => void;
  getTenantIssues: (tenantId: string) => Issue[];
  getOwnerIssues: (ownerId: string) => Issue[];
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("renteazy_properties");
    if (stored) {
      setProperties(JSON.parse(stored));
    }
    
    const storedBookings = localStorage.getItem("renteazy_bookings");
    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }
    
    const storedPayments = localStorage.getItem("renteazy_payments");
    if (storedPayments) {
      setPayments(JSON.parse(storedPayments));
    }
    
    const storedIssues = localStorage.getItem("renteazy_issues");
    if (storedIssues) {
      setIssues(JSON.parse(storedIssues));
    }
  }, []);

  const saveToStorage = (props: Property[]) => {
    localStorage.setItem("renteazy_properties", JSON.stringify(props));
    setProperties(props);
  };

  const addProperty = (property: Omit<Property, "id" | "owner_id" | "createdAt">) => {
    if (!user) return;
    
    const newProperty: Property = {
      ...property,
      id: `prop_${Date.now()}`,
      owner_id: user.uid,
      createdAt: new Date().toISOString(),
    };

    saveToStorage([...properties, newProperty]);
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    const updated = properties.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    saveToStorage(updated);
  };

  const deleteProperty = (id: string) => {
    const filtered = properties.filter((p) => p.id !== id);
    saveToStorage(filtered);
  };

  const getOwnerProperties = (ownerId: string) => {
    return properties.filter((p) => p.owner_id === ownerId);
  };

  const getActiveProperties = () => {
    return properties.filter((p) => p.status === "active");
  };

  const getPropertyById = (id: string) => {
    return properties.find((p) => p.id === id);
  };

  const addBooking = (booking: Omit<Booking, "id" | "createdAt">) => {
    const newBooking: Booking = {
      ...booking,
      id: `booking_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    const updated = [...bookings, newBooking];
    localStorage.setItem("renteazy_bookings", JSON.stringify(updated));
    setBookings(updated);
    return newBooking.id;
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, ...updates } : b));
    localStorage.setItem("renteazy_bookings", JSON.stringify(updated));
    setBookings(updated);
  };

  const getTenantBookings = (tenantId: string) => {
    return bookings.filter((b) => b.tenant_id === tenantId);
  };

  const addPayment = (payment: Omit<Payment, "id">) => {
    const newPayment: Payment = {
      ...payment,
      id: `payment_${Date.now()}`,
    };
    
    const updated = [...payments, newPayment];
    localStorage.setItem("renteazy_payments", JSON.stringify(updated));
    setPayments(updated);
  };

  const getTenantPayments = (tenantId: string) => {
    return payments.filter((p) => p.tenant_id === tenantId);
  };

  const addIssue = (issue: Omit<Issue, "id" | "created_at">) => {
    const newIssue: Issue = {
      ...issue,
      id: `issue_${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    
    const updated = [...issues, newIssue];
    localStorage.setItem("renteazy_issues", JSON.stringify(updated));
    setIssues(updated);
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    const updated = issues.map((i) => (i.id === id ? { ...i, ...updates } : i));
    localStorage.setItem("renteazy_issues", JSON.stringify(updated));
    setIssues(updated);
  };

  const getTenantIssues = (tenantId: string) => {
    return issues.filter((i) => i.tenant_id === tenantId);
  };

  const getOwnerIssues = (ownerId: string) => {
    const ownerPropertyIds = properties
      .filter((p) => p.owner_id === ownerId)
      .map((p) => p.id);
    return issues.filter((i) => ownerPropertyIds.includes(i.property_id));
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        bookings,
        payments,
        issues,
        addProperty,
        updateProperty,
        deleteProperty,
        getOwnerProperties,
        getActiveProperties,
        getPropertyById,
        addBooking,
        updateBooking,
        getTenantBookings,
        addPayment,
        getTenantPayments,
        addIssue,
        updateIssue,
        getTenantIssues,
        getOwnerIssues,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error("useProperty must be used within a PropertyProvider");
  }
  return context;
};
