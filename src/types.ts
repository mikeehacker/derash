export interface User {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "User";
}

export interface Product {
  id: string;
  product_name: string;
  quantity: number;
  sold_quantity: number;
  purchase_date: string; // ISO format: "YYYY-MM-DD"
  payment_method: "CBE Birr" | "Telebirr" | "Cash";
  total_price: number;
  product_image?: string; // base64 encoded
  receipt_image?: string; // base64 encoded receipt photo
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: string;
  created_at: string;
}

export interface DashboardTotals {
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
}

export interface PaymentBreakdown {
  cbe: number;
  telebirr: number;
  cash: number;
  cbe_qty: number;
  telebirr_qty: number;
  cash_qty: number;
}

export interface TimeStatsSummary {
  day: { count: number; qty: number; val: number };
  week: { count: number; qty: number; val: number };
  month: { count: number; qty: number; val: number };
}

export interface TrendDataPoint {
  month: string;
  value: number;
  qty: number;
  count: number;
}

export interface AnalyticsResponse {
  totals: DashboardTotals;
  payment: PaymentBreakdown;
  timeStats: TimeStatsSummary;
  trends: TrendDataPoint[];
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface Sale {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sale_date: string; // YYYY-MM-DD
  payment_method: "CBE Birr" | "Telebirr" | "Cash";
  receipt_image?: string; // base64 encoded receipt photo
  created_by: string;
  created_by_name: string;
  created_at: string;
}

