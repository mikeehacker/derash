import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_ANON_KEY starts with:", supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + "..." : "undefined");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing env vars!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Testing Connection...");

  console.log("1. Testing 'users' table...");
  const { data: users, error: uErr } = await supabase.from("users").select("*").limit(5);
  if (uErr) console.error("users error:", uErr);
  else console.log("users count:", users.length, users);

  console.log("2. Testing 'products' table...");
  const { data: products, error: pErr } = await supabase.from("products").select("*").limit(5);
  if (pErr) console.error("products error:", pErr);
  else console.log("products count:", products.length);

  console.log("3. Testing 'audit_logs' table...");
  const { data: logs, error: lErr } = await supabase.from("audit_logs").select("*").limit(5);
  if (lErr) console.error("audit_logs error:", lErr);
  else console.log("audit_logs count:", logs.length);

  console.log("4. Testing 'sales' table...");
  const { data: sales, error: sErr } = await supabase.from("sales").select("*").limit(5);
  if (sErr) console.error("sales error:", sErr);
  else console.log("sales count:", sales.length, sales);
}

run();
