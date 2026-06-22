import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

let supabaseUrl = process.env.SUPABASE_URL;
if (supabaseUrl) {
  // Sanitize the URL in case the restful endpoint suffix was attached
  if (supabaseUrl.endsWith("/rest/v1/")) {
    supabaseUrl = supabaseUrl.substring(0, supabaseUrl.length - 9);
  } else if (supabaseUrl.endsWith("/rest/v1")) {
    supabaseUrl = supabaseUrl.substring(0, supabaseUrl.length - 8);
  }
}
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Create Supabase client lazily if configured
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/**
 * Test connectivity and check if the expected tables exist.
 */
export async function testConnection(): Promise<{ success: boolean; message: string; tablesFound: string[] }> {
  if (!supabase) {
    return {
      success: false,
      message: "Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) are not set.",
      tablesFound: []
    };
  }

  const tablesFound: string[] = [];
  try {
    // 1. Test users table
    const { error: usersError } = await supabase.from("users").select("id").limit(1);
    if (!usersError) tablesFound.push("users");

    // 2. Test products table
    const { error: productsError } = await supabase.from("products").select("id").limit(1);
    if (!productsError) tablesFound.push("products");

    // 3. Test audit_logs table
    const { error: logsError } = await supabase.from("audit_logs").select("id").limit(1);
    if (!logsError) tablesFound.push("audit_logs");

    // 4. Test sales table
    const { error: salesError } = await supabase.from("sales").select("id").limit(1);
    if (!salesError) tablesFound.push("sales");

    if (tablesFound.length === 4) {
      return {
        success: true,
        message: "Successfully connected to Supabase! All tables are active and configured.",
        tablesFound
      };
    } else if (tablesFound.length > 0) {
      return {
        success: false,
        message: `Partially connected. Found tables: ${tablesFound.join(", ")}. Please run the SQL initialization script to create the missing tables.`,
        tablesFound
      };
    } else {
      return {
        success: false,
        message: "Connected to Supabase, but the tables (users, products, audit_logs, sales) do not exist. Please run the provided SQL setup script in your Supabase SQL Editor.",
        tablesFound
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect: ${err.message || err}`,
      tablesFound
    };
  }
}

/**
 * Product CRUD helpers for Supabase
 */
export async function fetchSupabaseProducts(): Promise<any[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products from Supabase:", error.message);
    throw new Error(`Supabase query error: ${error.message}`);
  }
  return data;
}

export async function insertSupabaseProduct(product: any): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("products").insert([product]);
  if (error) {
    console.error("Error inserting product into Supabase:", error.message);
    throw new Error(`Supabase insert error: ${error.message}`);
  }
}

export async function updateSupabaseProduct(id: string, product: any): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("products").update(product).eq("id", id);
  if (error) {
    console.error("Error updating product in Supabase:", error.message);
    throw new Error(`Supabase update error: ${error.message}`);
  }
}

export async function deleteSupabaseProduct(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("Error deleting product from Supabase:", error.message);
    throw new Error(`Supabase delete error: ${error.message}`);
  }
}

/**
 * User helpers for Supabase
 */
export async function fetchSupabaseUsers(): Promise<any[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("users").select("*");
  if (error) {
    console.error("Error fetching users from Supabase:", error.message);
    throw new Error(`Supabase query error: ${error.message}`);
  }
  return data;
}

export async function insertSupabaseUser(user: any): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("users").insert([user]);
  if (error) {
    console.error("Error inserting user into Supabase:", error.message);
    throw new Error(`Supabase insert error: ${error.message}`);
  }
}

/**
 * Audit log helpers for Supabase
 */
export async function fetchSupabaseAuditLogs(): Promise<any[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching audit logs from Supabase:", error.message);
    throw new Error(`Supabase query error: ${error.message}`);
  }
  return data;
}

export async function insertSupabaseAuditLog(log: any): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("audit_logs").insert([log]);
  if (error) {
    console.error("Error inserting audit log into Supabase:", error.message);
    throw new Error(`Supabase insert error: ${error.message}`);
  }
}

/**
 * Sync all local data from JSON database into Supabase.
 * Upsert is used to prevent duplicate rows.
 */
export async function syncLocalDataToSupabase(localDb: { users: any[]; products: any[]; audit_logs: any[]; sales: any[] }): Promise<{
  success: boolean;
  syncedUsers: number;
  syncedProducts: number;
  syncedLogs: number;
  syncedSales: number;
  message: string;
}> {
  if (!supabase) {
    return { success: false, syncedUsers: 0, syncedProducts: 0, syncedLogs: 0, syncedSales: 0, message: "Supabase client is not initialized." };
  }

  try {
    let syncedUsers = 0;
    let syncedProducts = 0;
    let syncedLogs = 0;
    let syncedSales = 0;

    // 1. Sync Users
    if (localDb.users.length > 0) {
      const { error: usersError } = await supabase
        .from("users")
        .upsert(localDb.users, { onConflict: "id" });
      if (usersError) throw new Error(`Users sync error: ${usersError.message}`);
      syncedUsers = localDb.users.length;
    }

    // 2. Sync Products
    if (localDb.products.length > 0) {
      let { error: productsError } = await supabase
        .from("products")
        .upsert(localDb.products, { onConflict: "id" });
      if (productsError) {
        if (productsError.message?.includes("receipt_image") || productsError.message?.includes("column")) {
          console.warn("Retrying products sync without receipt_image column...");
          const sanitized = localDb.products.map(({ receipt_image, ...rest }) => rest);
          const { error: retryErr } = await supabase.from("products").upsert(sanitized, { onConflict: "id" });
          if (retryErr) throw new Error(`Products sync error: ${retryErr.message}`);
        } else {
          throw new Error(`Products sync error: ${productsError.message}`);
        }
      }
      syncedProducts = localDb.products.length;
    }

    // 3. Sync Audit Logs
    if (localDb.audit_logs.length > 0) {
      const sanitizedLogs = localDb.audit_logs.map(log => {
        if (!log.user_name) {
          const user = localDb.users?.find(u => u.id === log.user_id);
          return {
            ...log,
            user_name: user ? user.name : (log.user_id || "System")
          };
        }
        return log;
      });

      const { error: logsError } = await supabase
        .from("audit_logs")
        .upsert(sanitizedLogs, { onConflict: "id" });
      if (logsError) throw new Error(`Audit logs sync error: ${logsError.message}`);
      syncedLogs = localDb.audit_logs.length;
    }

    // 4. Sync Sales
    if (localDb.sales && localDb.sales.length > 0) {
      let { error: salesError } = await supabase
        .from("sales")
        .upsert(localDb.sales, { onConflict: "id" });
      if (salesError) {
        if (salesError.message?.includes("receipt_image") || salesError.message?.includes("column")) {
          console.warn("Retrying sales sync without receipt_image column...");
          const sanitized = localDb.sales.map(({ receipt_image, ...rest }) => rest);
          const { error: retryErr } = await supabase.from("sales").upsert(sanitized, { onConflict: "id" });
          if (retryErr) throw new Error(`Sales sync error: ${retryErr.message}`);
        } else {
          throw new Error(`Sales sync error: ${salesError.message}`);
        }
      }
      syncedSales = localDb.sales.length;
    }

    return {
      success: true,
      syncedUsers,
      syncedProducts,
      syncedLogs,
      syncedSales,
      message: `Successfully synchronized ${syncedUsers} users, ${syncedProducts} products, ${syncedLogs} audit logs, and ${syncedSales} sales transactions to Supabase!`
    };
  } catch (err: any) {
    return {
      success: false,
      syncedUsers: 0,
      syncedProducts: 0,
      syncedLogs: 0,
      syncedSales: 0,
      message: `Sync failed: ${err.message || err}`
    };
  }
}
