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

interface PropertyContextType {
  properties: Property[];
  addProperty: (property: Omit<Property, "id" | "owner_id" | "createdAt">) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  getOwnerProperties: (ownerId: string) => Property[];
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem("renteazy_properties");
    if (stored) {
      setProperties(JSON.parse(stored));
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

  return (
    <PropertyContext.Provider
      value={{ properties, addProperty, updateProperty, deleteProperty, getOwnerProperties }}
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
