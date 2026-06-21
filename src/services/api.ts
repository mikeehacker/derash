import { User, Product, AuditLog, AnalyticsResponse, Sale } from "../types";

const API_BASE = "/api";

function getHeaders(token: string | null = null): HeadersInit {
  const activeToken = token || localStorage.getItem("derash_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (activeToken) {
    headers["Authorization"] = `Bearer ${activeToken}`;
  }
  return headers;
}

export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth API
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return fetchWithAuth<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name: string, email: string, password: string, role: "Admin" | "User"): Promise<{ token: string; user: User }> {
    return fetchWithAuth<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  async getMe(): Promise<{ user: User }> {
    return fetchWithAuth<{ user: User }>("/auth/me");
  },

  // Products API
  async getProducts(params?: {
    search?: string;
    payment_method?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params) {
      if (params.search) query.append("search", params.search);
      if (params.payment_method) query.append("payment_method", params.payment_method);
      if (params.sort_by) query.append("sort_by", params.sort_by);
      if (params.sort_order) query.append("sort_order", params.sort_order);
    }
    const queryString = query.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";
    return fetchWithAuth<Product[]>(endpoint);
  },

  async getProduct(id: string): Promise<Product> {
    return fetchWithAuth<Product>(`/products/${id}`);
  },

  async createProduct(payload: Omit<Product, "id" | "created_by" | "created_by_name" | "created_at" | "updated_at">): Promise<Product> {
    return fetchWithAuth<Product>("/products", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateProduct(id: string, payload: Partial<Product> & { clear_image?: boolean }): Promise<Product> {
    return fetchWithAuth<Product>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth<{ success: boolean; message: string }>(`/products/${id}`, {
      method: "DELETE",
    });
  },

  // Audit Logs API
  async getAuditLogs(): Promise<AuditLog[]> {
    return fetchWithAuth<AuditLog[]>("/audit-logs");
  },

  async logEvent(action: string, entity_type: string, entity_id: string, metadata: string = ""): Promise<{ success: boolean }> {
    return fetchWithAuth<{ success: boolean }>("/audit-logs/log", {
      method: "POST",
      body: JSON.stringify({ action, entity_type, entity_id, metadata }),
    });
  },

  // Analytics API
  async getAnalytics(): Promise<AnalyticsResponse> {
    return fetchWithAuth<AnalyticsResponse>("/analytics");
  },

  // Supabase API
  async getSupabaseStatus(): Promise<{
    isConfigured: boolean;
    supabaseUrl?: string;
    success: boolean;
    message: string;
    tablesFound: string[];
  }> {
    return fetchWithAuth<{
      isConfigured: boolean;
      supabaseUrl?: string;
      success: boolean;
      message: string;
      tablesFound: string[];
    }>("/supabase/status");
  },

  async syncSupabase(): Promise<{
    success: boolean;
    syncedUsers: number;
    syncedProducts: number;
    syncedLogs: number;
    message: string;
  }> {
    return fetchWithAuth<{
      success: boolean;
      syncedUsers: number;
      syncedProducts: number;
      syncedLogs: number;
      message: string;
    }>("/supabase/sync", {
      method: "POST"
    });
  },

  // Sales API
  async getSales(): Promise<Sale[]> {
    return fetchWithAuth<Sale[]>("/sales");
  },

  async createSale(payload: Omit<Sale, "id" | "created_by" | "created_by_name" | "created_at">): Promise<Sale> {
    return fetchWithAuth<Sale>("/sales", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async deleteSale(id: string): Promise<{ success: boolean; message: string }> {
    return fetchWithAuth<{ success: boolean; message: string }>(`/sales/${id}`, {
      method: "DELETE",
    });
  },
};

