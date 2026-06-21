import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "db.json");
if (!fs.existsSync(dbPath)) {
  console.log("Local db.json does not exist!");
  process.exit(0);
}

const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
console.log("LOCAL DATABASE STATUS:");
console.log("Users count:", db.users?.length);
db.users?.forEach(u => console.log(`  - User: ${u.name} (${u.email}), ID: ${u.id}, Role: ${u.role}`));

console.log("Products count:", db.products?.length);
db.products?.slice(0, 5).forEach(p => console.log(`  - Product: ${p.product_name}, ID: ${p.id}, Created By: ${p.created_by}`));

console.log("Sales count:", db.sales?.length);
db.sales?.forEach(s => console.log(`  - Sale: ${s.product_name}, Qty: ${s.quantity}, ID: ${s.id}, Created By: ${s.created_by}`));
