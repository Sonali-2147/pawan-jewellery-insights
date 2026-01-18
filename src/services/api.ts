export const API_BASE_URL = "https://vksum1qvxl.execute-api.us-east-2.amazonaws.com";

// Helper function to make API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============ CUSTOMER ENDPOINTS ============

export const customerApi = {
  // Get paginated customers
  getAll: (page = 1, limit = 10, purposeId?: number) => {
    let url = `/customers?page=${page}&limit=${limit}`;
    if (purposeId) url += `&purpose_id=${purposeId}`;
    return apiCall<{
      status: string;
      page: number;
      limit: number;
      total: number;
      total_pages: number;
      data: import("@/types").Customer[];
    }>(url);
  },

  // Get single customer
  getById: (id: number) =>
    apiCall<{ status: string; data: import("@/types").Customer }>(`/customers/${id}`),

  // Add new customer
  create: (data: import("@/types").CustomerFormData) =>
    apiCall<{ status: string; message: string }>("/add_customer", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update customer
  update: (id: number, data: Partial<import("@/types").CustomerFormData>) =>
    apiCall<{ status: string; message: string }>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete customer
  delete: (id: number) =>
    apiCall<{ status: string; message: string }>(`/customers/${id}`, {
      method: "DELETE",
    }),
};

// ============ PURPOSE ENDPOINTS ============

export const purposeApi = {
  // Get all purposes
  getAll: () =>
    apiCall<{ status: string; count: number; data: import("@/types").Purpose[] }>("/purposes"),

  // Get single purpose
  getById: (id: number) =>
    apiCall<{ status: string; data: import("@/types").Purpose }>(`/purpose/${id}`),

  // Create purpose
  create: (data: import("@/types").PurposeFormData) =>
    apiCall<{ status: string; message: string }>("/purpose", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Update purpose
  update: (id: number, data: Partial<import("@/types").PurposeFormData>) =>
    apiCall<{ status: string; message: string }>(`/purpose/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Delete purpose
  delete: (id: number) =>
    apiCall<{ status: string; message: string }>(`/purpose/${id}`, {
      method: "DELETE",
    }),
};

// ============ STAFF ENDPOINTS ============

export const staffApi = {
  // Get staff by mobile number
  getByMobile: (mobNo: string) =>
    apiCall<{ status: string; message: string; data: import("@/types").Staff }>(
      `/staff_by_mobile/${mobNo}`
    ),
};

// ============ ANALYTICS ENDPOINTS ============

export const analyticsApi = {
  // Get customer count for last N days
  getLastNDays: (days = 7) =>
    apiCall<{ status: string; days: number; data: import("@/types").AnalyticsLastNDays[] }>(
      `/analytics/last-n-days?days=${days}`
    ),

  // Get customer count by staff
  getStaffCount: (days?: number) => {
    let url = "/analytics/staff-count";
    if (days) url += `?days=${days}`;
    return apiCall<{ status: string; days?: number; data: import("@/types").StaffCount[] }>(url);
  },
};

// ============ HEALTH ENDPOINTS ============

export const healthApi = {
  check: () => apiCall<{ status: string }>("/health"),
  root: () => apiCall<{ message: string; version: string }>("/"),
};