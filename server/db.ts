import fs from "fs";
import path from "path";
import { isSupabaseConfigured, supabase } from "./supabase.js";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: "Admin" | "User";
  created_at: string;
}

export interface Product {
  id: string;
  product_name: string;
  quantity: number;
  sold_quantity: number;
  purchase_date: string; // "YYYY-MM-DD"
  payment_method: "CBE Birr" | "Telebirr" | "Cash";
  total_price: number;
  product_image?: string; // base64 or file path
  receipt_image?: string;
  created_by: string; // user id
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

export interface Sale {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sale_date: string;
  payment_method: "CBE Birr" | "Telebirr" | "Cash";
  receipt_image?: string;
  created_by: string;
  created_by_name: string;
  created_at: string;
}

export interface DBState {
  users: User[];
  products: Product[];
  audit_logs: AuditLog[];
  sales: Sale[];
}

let DB_DIR = path.join(process.cwd(), "data");
let DB_FILE = path.join(DB_DIR, "db.json");

// Helper to ensure database directory and file exist
function initDb() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  } catch (err: any) {
    // If we are in a read-only filesystem (like Netlify Functions), fallback to /tmp
    DB_DIR = path.join("/tmp", "data");
    DB_FILE = path.join(DB_DIR, "db.json");
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  // Initialize empty DB if it doesn't exist
  if (!fs.existsSync(DB_FILE)) {
    const defaultState: DBState = {
      users: [],
      products: [],
      audit_logs: [],
      sales: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultState, null, 2), "utf-8");
  }
}

initDb();

export function readDbLocal(): DBState {
  initDb();
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(data) as DBState;
    if (parsed) {
      let changed = false;
      if (Array.isArray(parsed.products)) {
        if (parsed.products.length === 0) {
          parsed.products = [
            {
              id: "prod_1",
              product_name: "MacBook Pro M3 Max",
              quantity: 15,
              sold_quantity: 5,
              purchase_date: "2026-06-10",
              payment_method: "CBE Birr",
              total_price: 180000,
              created_by: "usr_admin",
              created_by_name: "Manager",
              created_at: "2026-06-10T11:00:00.000Z",
              updated_at: "2026-06-10T11:00:00.000Z"
            },
            {
              id: "prod_2",
              product_name: "iPhone 16 Pro Max",
              quantity: 34,
              sold_quantity: 12,
              purchase_date: "2026-05-15",
              payment_method: "Telebirr",
              total_price: 125000,
              created_by: "usr_admin",
              created_by_name: "Manager",
              created_at: "2026-05-15T09:30:00.000Z",
              updated_at: "2026-05-15T09:30:00.000Z"
            },
            {
              id: "prod_3",
              product_name: "Samsung Galaxy S24 Ultra",
              quantity: 21,
              sold_quantity: 8,
              purchase_date: "2026-06-01",
              payment_method: "Cash",
              total_price: 98000,
              created_by: "usr_admin",
              created_by_name: "Manager",
              created_at: "2026-06-01T14:20:00.000Z",
              updated_at: "2026-06-01T14:20:00.000Z"
            },
            {
              id: "prod_4",
              product_name: "Dell XPS 15 Laptop",
              quantity: 8,
              sold_quantity: 2,
              purchase_date: "2026-04-20",
              payment_method: "CBE Birr",
              total_price: 140000,
              created_by: "usr_guest",
              created_by_name: "Guest Employee",
              created_at: "2026-04-20T10:15:00.000Z",
              updated_at: "2026-04-20T10:15:00.000Z"
            },
            {
              id: "prod_5",
              product_name: "Sony WH-1000XM5",
              quantity: 50,
              sold_quantity: 15,
              purchase_date: "2026-06-13",
              payment_method: "Telebirr",
              total_price: 26000,
              created_by: "usr_guest",
              created_by_name: "Guest Employee",
              created_at: "2026-06-13T16:00:00.000Z",
              updated_at: "2026-06-13T16:00:00.000Z"
            }
          ];
          changed = true;
        }
        parsed.products = parsed.products.map(p => ({
          ...p,
          sold_quantity: typeof p.sold_quantity === "number" ? p.sold_quantity : 0
        }));
      }
      // No default users enforced — users register their own accounts
      if (Array.isArray(parsed.audit_logs)) {
        parsed.audit_logs = parsed.audit_logs.map(log => {
          if (!log.user_name) {
            const user = parsed.users?.find(u => u.id === log.user_id);
            changed = true;
            return {
              ...log,
              user_name: user ? user.name : (log.user_id || "System")
            };
          }
          return log;
        });
      }
      if (!Array.isArray(parsed.sales)) {
        parsed.sales = [];
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
      }
    }
    return parsed;
  } catch (err) {
    console.error("Error reading DB locally", err);
    return { users: [], products: [], audit_logs: [], sales: [] };
  }
}

export function writeDbLocal(state: DBState): void {
  initDb();
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
}

export async function readDb(): Promise<DBState> {
  if (isSupabaseConfigured() && supabase) {
    try {
      // Query all tables in parallel to prevent sequential database roundtrip bottlenecks
      const [usersRes, productsRes, logsRes, salesRes] = await Promise.all([
        supabase.from("users").select("*"),
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("audit_logs").select("*").order("created_at", { ascending: false }),
        supabase.from("sales").select("*").order("created_at", { ascending: false })
      ]);

      const { data: users, error: uErr } = usersRes;
      const { data: products, error: pErr } = productsRes;
      const { data: audit_logs, error: lErr } = logsRes;
      const { data: sales, error: sErr } = salesRes;

      if (uErr || pErr || lErr || sErr) {
        throw new Error(`Supabase query issue: ${uErr?.message || pErr?.message || lErr?.message || sErr?.message}`);
      }

      if (Array.isArray(users) && Array.isArray(products) && Array.isArray(audit_logs) && Array.isArray(sales)) {
        return {
          users,
          products: products.map(p => ({
            ...p,
            sold_quantity: typeof p.sold_quantity === "number" ? p.sold_quantity : 0
          })),
          audit_logs,
          sales
        };
      }
    } catch (err) {
      console.warn("Supabase fetch failed (possibly tables aren't created yet). Falling back to JSON DB: ", err);
    }
  }

  return readDbLocal();
}

export async function writeDb(state: DBState): Promise<void> {
  const oldState = readDbLocal();
  
  // 1. Always keep local JSON updated
  writeDbLocal(state);

  if (isSupabaseConfigured() && supabase) {
    try {
      // Handle deletions for products (compare old and new states)
      const oldProductIds = oldState.products.map(p => p.id);
      const newProductIds = new Set(state.products.map(p => p.id));
      const deletedIds = oldProductIds.filter(id => !newProductIds.has(id));

      if (deletedIds.length > 0) {
        await supabase.from("products").delete().in("id", deletedIds);
      }

      // Handle deletions for sales
      const oldSaleIds = oldState.sales?.map(s => s.id) || [];
      const newSaleIds = new Set(state.sales?.map(s => s.id) || []);
      const deletedSaleIds = oldSaleIds.filter(id => !newSaleIds.has(id));

      if (deletedSaleIds.length > 0) {
        await supabase.from("sales").delete().in("id", deletedSaleIds);
      }

      // 1. Delta-upsert changed products
      const changedProducts = state.products.filter(p => {
        const oldP = oldState.products?.find(op => op.id === p.id);
        if (!oldP) return true;
        return JSON.stringify(p) !== JSON.stringify(oldP);
      });
      if (changedProducts.length > 0) {
        const { error: pErr } = await supabase.from("products").upsert(changedProducts, { onConflict: "id" });
        if (pErr) throw pErr;
      }

      // 2. Delta-upsert changed users
      const changedUsers = state.users.filter(u => {
        const oldU = oldState.users?.find(ou => ou.id === u.id);
        if (!oldU) return true;
        return JSON.stringify(u) !== JSON.stringify(oldU);
      });
      if (changedUsers.length > 0) {
        const { error: uErr } = await supabase.from("users").upsert(changedUsers, { onConflict: "id" });
        if (uErr) throw uErr;
      }

      // 3. Delta-upsert changed audit logs
      const changedLogs = state.audit_logs.filter(log => {
        const oldLog = oldState.audit_logs?.find(ol => ol.id === log.id);
        if (!oldLog) return true;
        return JSON.stringify(log) !== JSON.stringify(oldLog);
      });
      if (changedLogs.length > 0) {
        const sanitizedLogs = changedLogs.map(log => {
          if (!log.user_name) {
            const user = state.users?.find(u => u.id === log.user_id);
            return {
              ...log,
              user_name: user ? user.name : (log.user_id || "System")
            };
          }
          return log;
        });
        const { error: lErr } = await supabase.from("audit_logs").upsert(sanitizedLogs, { onConflict: "id" });
        if (lErr) throw lErr;
      }

      // 4. Delta-upsert changed sales
      const changedSales = state.sales?.filter(s => {
        const oldS = oldState.sales?.find(os => os.id === s.id);
        if (!oldS) return true;
        return JSON.stringify(s) !== JSON.stringify(oldS);
      }) || [];
      if (changedSales.length > 0) {
        const { error: sErr } = await supabase.from("sales").upsert(changedSales, { onConflict: "id" });
        if (sErr) throw sErr;
      }
    } catch (err: any) {
      console.error("Supabase write sync error: ", err.message || err);
      throw new Error(`Database sync issue: ${err.message || err}`);
    }
  }
}

/**
 * Log action async
 */
export async function logAudit(user_id: string, user_name: string, action: string, entity_type: string, entity_id: string, metadata: string = "") {
  const db = await readDb();
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id,
    user_name,
    action,
    entity_type,
    entity_id,
    metadata,
    created_at: new Date().toISOString()
  };
  db.audit_logs.unshift(newLog);
  await writeDb(db);
}
