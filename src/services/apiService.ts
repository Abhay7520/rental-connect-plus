// Services using REST API (MongoDB backend)

const API_BASE = "/api";

async function fetchJson(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || res.statusText);
  }
  const data = await res.json();
  return normalizeId(data);
}

function normalizeId(data: any): any {
  if (Array.isArray(data)) {
    return data.map(normalizeId);
  }
  if (data && typeof data === 'object') {
    if (data._id && !data.id) {
      data.id = data._id;
    }
    // Recursively normalize nested objects if needed
  }
  return data;
}

// Helper to simulate real-time updates via polling
function createPoller(url: string, callback: (data: any[]) => void, errorCallback?: (error: any) => void) {
  const fetchData = () => {
    fetchJson(url)
      .then(data => callback(Array.isArray(data) ? data : []))
      .catch(err => errorCallback && errorCallback(err));
  };
  fetchData(); // Initial fetch
  const intervalId = setInterval(fetchData, 2000); // Poll every 2 seconds
  return () => clearInterval(intervalId);
}

// ============ USER ROLES SERVICE ============
export const UserRolesService = {
  async create(userId: string, role: string) {
    try {
      console.log("🔵 [UserRolesService] Creating role for user:", userId, role);
      return await fetchJson(`${API_BASE}/user-roles`, {
        method: "POST",
        body: JSON.stringify({ userId, role }),
      });
    } catch (error) {
      console.error("❌ [UserRolesService] Create error:", error);
      throw error;
    }
  },

  async getRole(userId: string) {
    try {
      return await fetchJson(`${API_BASE}/user-roles/${userId}`);
    } catch (error) {
      console.error("❌ [UserRolesService] GetRole error:", error);
      return null;
    }
  },

  async updateRole(userId: string, newRole: string, assignedBy = "admin") {
    try {
      console.log("🔵 [UserRolesService] Updating role:", userId, newRole);
      return await fetchJson(`${API_BASE}/user-roles`, {
        method: "POST",
        body: JSON.stringify({ userId, role: newRole, assignedBy }),
      });
    } catch (error) {
      console.error("❌ [UserRolesService] Update error:", error);
      throw error;
    }
  },

  async delete(userId: string) {
    console.warn("⚠️ [UserRolesService] Delete not implemented in backend");
  },

  onSnapshot(callback: (data: any[]) => void, errorCallback?: (error: any) => void) {
    return createPoller(`${API_BASE}/user-roles`, callback, errorCallback);
  },
};

// ============ USER SERVICE ============
export const UserService = {
  async create(data: any) {
    try {
      console.log("🔵 [UserService] Creating user:", data.email);
      return await fetchJson(`${API_BASE}/users`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [UserService] Create error:", error);
      throw error;
    }
  },

  async getByEmail(email: string) {
    try {
      return await fetchJson(`${API_BASE}/users?email=${encodeURIComponent(email)}`);
    } catch (error) {
      console.error("❌ [UserService] GetByEmail error:", error);
      return [];
    }
  },

  async login(email: string, password: string) {
    try {
      return await fetchJson(`${API_BASE}/users/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      console.error("❌ [UserService] Login error:", error);
      throw error;
    }
  },

  async update(uid: string, data: any) {
    console.warn("⚠️ [UserService] Update not fully implemented in backend");
  },

  async delete(uid: string) {
    console.warn("⚠️ [UserService] Delete not implemented in backend");
  },

  onSnapshot(callback: (data: any[]) => void, errorCallback?: (error: any) => void) {
    return createPoller(`${API_BASE}/users`, callback, errorCallback);
  },
};

// ============ PROPERTY SERVICE ============
export const PropertyService = {
  async create(data: any) {
    try {
      console.log("🔵 [PropertyService] Creating property:", data.title);
      const payload = { ...data };
      if (payload.ownerId && !payload.owner_id) {
        payload.owner_id = payload.ownerId;
      }
      return await fetchJson(`${API_BASE}/properties`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("❌ [PropertyService] Create error:", error);
      throw error;
    }
  },

  async getByOwnerId(ownerId: string) {
    try {
      const all = await fetchJson(`${API_BASE}/properties`);
      return all.filter((p: any) => p.owner_id === ownerId || p.ownerId === ownerId);
    } catch (error) {
      console.error("❌ [PropertyService] GetByOwnerId error:", error);
      return [];
    }
  },

  async getAll() {
    try {
      return await fetchJson(`${API_BASE}/properties`);
    } catch (error) {
      console.error("❌ [PropertyService] GetAll error:", error);
      return [];
    }
  },

  async update(id: string, data: any) {
    try {
      return await fetchJson(`${API_BASE}/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [PropertyService] Update error:", error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      return await fetchJson(`${API_BASE}/properties/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("❌ [PropertyService] Delete error:", error);
      throw error;
    }
  },

  onSnapshot(callback: (data: any[]) => void, errorCallback?: (error: any) => void) {
    return createPoller(`${API_BASE}/properties`, callback, errorCallback);
  },
};

// ============ BOOKING SERVICE ============
export const BookingService = {
  async create(data: any) {
    try {
      console.log("🔵 [BookingService] Creating booking:", data);
      return await fetchJson(`${API_BASE}/bookings`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [BookingService] Create error:", error);
      throw error;
    }
  },

  async update(id: string, data: any) {
    try {
      return await fetchJson(`${API_BASE}/bookings/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [BookingService] Update error:", error);
      throw error;
    }
  },

  async getByTenantId(tenantId: string) {
    try {
      return await fetchJson(`${API_BASE}/bookings?tenant_id=${tenantId}`);
    } catch (error) {
      console.error("❌ [BookingService] GetByTenantId error:", error);
      return [];
    }
  },

  async getByPropertyId(propertyId: string) {
    try {
      return await fetchJson(`${API_BASE}/bookings?property_id=${propertyId}`);
    } catch (error) {
      console.error("❌ [BookingService] GetByPropertyId error:", error);
      return [];
    }
  },

  async delete(id: string) {
    try {
      await fetchJson(`${API_BASE}/bookings/${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("❌ [BookingService] Delete error:", error);
      throw error;
    }
  },

  async getAll() {
    try {
      return await fetchJson(`${API_BASE}/bookings`);
    } catch (error) {
      console.error("❌ [BookingService] GetAll error:", error);
      return [];
    }
  },

  onSnapshot(callback: (data: any[]) => void, errorCallback?: (error: any) => void) {
    return createPoller(`${API_BASE}/bookings`, callback, errorCallback);
  },
};

// ============ ISSUE SERVICE ============
export const IssueService = {
  async create(data: any) {
    try {
      return await fetchJson(`${API_BASE}/issues`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [IssueService] Create error:", error);
      throw error;
    }
  },

  async update(id: string, data: any) {
    try {
      return await fetchJson(`${API_BASE}/issues/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [IssueService] Update error:", error);
      throw error;
    }
  },

  async getByTenantId(tenantId: string) {
    try {
      return await fetchJson(`${API_BASE}/issues?tenant_id=${tenantId}`);
    } catch (error) {
      console.error("❌ Error getting tenant issues:", error);
      return [];
    }
  },

  async getByPropertyId(propertyId: string) {
    try {
      return await fetchJson(`${API_BASE}/issues?property_id=${propertyId}`);
    } catch (error) {
      console.error("❌ Error getting property issues:", error);
      return [];
    }
  },

  async delete(id: string) {
    console.warn("⚠️ [IssueService] Delete not implemented in backend");
  },

  async getAll() {
    try {
      return await fetchJson(`${API_BASE}/issues`);
    } catch (error) {
      console.error("❌ [IssueService] GetAll error:", error);
      return [];
    }
  },

  onSnapshot(callback: (data: any[]) => void, errorCallback?: (error: any) => void) {
    return createPoller(`${API_BASE}/issues`, callback, errorCallback);
  },
};

// ============ PAYMENT SERVICE ============
export const PaymentService = {
  async createOrder(amount: number, currency: string = "INR") {
    try {
      return await fetchJson(`${API_BASE}/payments/create-order`, {
        method: "POST",
        body: JSON.stringify({ amount, currency }),
      });
    } catch (error) {
      console.error("❌ [PaymentService] CreateOrder error:", error);
      throw error;
    }
  },

  async verifyPayment(data: any) {
    try {
      return await fetchJson(`${API_BASE}/payments/verify-payment`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [PaymentService] VerifyPayment error:", error);
      throw error;
    }
  },

  async create(data: any) {
    try {
      return await fetchJson(`${API_BASE}/payments`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [PaymentService] Create error:", error);
      throw error;
    }
  },

  async getByTenantId(tenantId: string) {
    try {
      return await fetchJson(`${API_BASE}/payments?tenant_id=${tenantId}`);
    } catch (error) {
      console.error("❌ [PaymentService] GetByTenantId error:", error);
      return [];
    }
  },

  async getByPropertyId(propertyId: string) {
    try {
      return await fetchJson(`${API_BASE}/payments?property_id=${propertyId}`);
    } catch (error) {
      console.error("❌ [PaymentService] GetByPropertyId error:", error);
      return [];
    }
  },

  async update(id: string, data: any) {
    try {
      return await fetchJson(`${API_BASE}/payments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [PaymentService] Update error:", error);
      throw error;
    }
  },

  async delete(id: string) {
    console.warn("⚠️ [PaymentService] Delete not implemented in backend");
  },

  async getAll() {
    try {
      return await fetchJson(`${API_BASE}/payments`);
    } catch (error) {
      console.error("❌ [PaymentService] GetAll error:", error);
      return [];
    }
  },

  onSnapshot(callback: (data: any[]) => void, errorCallback?: (error: any) => void) {
    return createPoller(`${API_BASE}/payments`, callback, errorCallback);
  },
};

// ============ ANNOUNCEMENT SERVICE ============
export const AnnouncementService = {
  async create(data: any) {
    try {
      return await fetchJson(`${API_BASE}/announcements`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [AnnouncementService] Create error:", error);
      throw error;
    }
  },

  async getAll() {
    try {
      return await fetchJson(`${API_BASE}/announcements`);
    } catch (error) {
      console.error("❌ [AnnouncementService] GetAll error:", error);
      return [];
    }
  },

  onSnapshot(callback: (data: any[]) => void, errorCallback?: (error: any) => void) {
    return createPoller(`${API_BASE}/announcements`, callback, errorCallback);
  },
};

// ============ POLL SERVICE ============
export const PollService = {
  async create(data: any) {
    try {
      return await fetchJson(`${API_BASE}/polls`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [PollService] Create error:", error);
      throw error;
    }
  },

  async vote(pollId: string, optionIndex: number, userId: string) {
    try {
      return await fetchJson(`${API_BASE}/polls/${pollId}/vote`, {
        method: "POST",
        body: JSON.stringify({ optionIndex, userId }),
      });
    } catch (error) {
      console.error("❌ [PollService] Vote error:", error);
      throw error;
    }
  },

  async getAll() {
    try {
      return await fetchJson(`${API_BASE}/polls`);
    } catch (error) {
      console.error("❌ [PollService] GetAll error:", error);
      return [];
    }
  },

  onSnapshot(callback: (data: any[]) => void, errorCallback?: (error: any) => void) {
    return createPoller(`${API_BASE}/polls`, callback, errorCallback);
  },
};

// ============ EVENT SERVICE ============
export const EventService = {
  async create(data: any) {
    try {
      return await fetchJson(`${API_BASE}/events`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("❌ [EventService] Create error:", error);
      throw error;
    }
  },

  async rsvp(eventId: string, userId: string, status: "yes" | "no") {
    try {
      return await fetchJson(`${API_BASE}/events/${eventId}/rsvp`, {
        method: "POST",
        body: JSON.stringify({ userId, status }),
      });
    } catch (error) {
      console.error("❌ [EventService] RSVP error:", error);
      throw error;
    }
  },

  async getAll() {
    try {
      return await fetchJson(`${API_BASE}/events`);
    } catch (error) {
      console.error("❌ [EventService] GetAll error:", error);
      return [];
    }
  },

  onSnapshot(callback: (data: any[]) => void, errorCallback?: (error: any) => void) {
    return createPoller(`${API_BASE}/events`, callback, errorCallback);
  },
};