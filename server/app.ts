import express from "express";
import path from "path";
import { readDb, writeDb, logAudit, Product, User, Sale, readDbLocal } from "./db.js";
import { hashPassword, comparePassword, generateToken, verifyToken } from "./auth.js";
import { isSupabaseConfigured, testConnection, syncLocalDataToSupabase } from "./supabase.js";

const app = express();

// Set request size limit to support image base64 uploads securely
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

app.use((req, res, next) => {
  console.log(`[HTTP REQUEST] ${req.method} ${req.url}`);
  next();
});

// Express authentication middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Please attach a valid token." });
  }
  const token = authHeader.substring(7);
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized. Session expired or invalid." });
  }
  req.user = user;
  next();
}

// Admin only middleware
function requireAdmin(req: any, res: any, next: any) {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ error: "Forbidden. Admin access required." });
  }
  next();
}

// ======================== API ROUTES ========================

// 1. Health & Meta Status
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", service: "Derash Inventory API", timestamp: new Date().toISOString() });
});

// 2. Authentication: Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(`[LOGIN ATTEMPT] Email: ${email}`);
  if (!email || !password) {
    return res.status(400).json({ error: "Please enter both email and password." });
  }

  let db;
  try {
    db = await readDb();
    console.log(`[LOGIN DB LOADED] Total users in DB: ${db.users?.length}`);
  } catch (dbErr: any) {
    console.error(`[LOGIN DB ERROR] Failed to load DB:`, dbErr.message || dbErr);
    return res.status(500).json({ error: "Internal database read error." });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    console.warn(`[LOGIN FAILED] User not found for email: ${email}`);
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const isPasswordMatch = comparePassword(password, user.password_hash);
  console.log(`[LOGIN PASSWORD COMPARE] User: ${user.email}, Role: ${user.role}, Matched: ${isPasswordMatch}`);

  if (!isPasswordMatch) {
    console.warn(`[LOGIN FAILED] Password mismatch for user: ${email}`);
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = generateToken(user);
  await logAudit(user.id, user.name, "USER_LOGIN", "USER", user.id, `Logged in successfully from IP`);

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// 3. Authentication: Register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields (name, email, password) are required." });
  }

  const db = await readDb();
  const exists = db.users.some((u) => u.email.toLowerCase() === email.toLowerCase());
  
  if (exists) {
    return res.status(400).json({ error: "An account with this email already exists." });
  }

  // First user to register automatically becomes Admin
  const isFirstUser = db.users.length === 0;
  const assignedRole: "Admin" | "User" = isFirstUser ? "Admin" : (role === "Admin" ? "Admin" : "User");

  const newUser: User = {
    id: `usr_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password_hash: hashPassword(password),
    role: assignedRole,
    created_at: new Date().toISOString(),
  };

  db.users.push(newUser);
  await writeDb(db);

  await logAudit(newUser.id, newUser.name, "USER_REGISTER", "USER", newUser.id, `Registered as role: ${assignedRole}${isFirstUser ? " (first user — auto-assigned Admin)" : ""}`);

  const token = generateToken(newUser);
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

// 4. Validate Token & Get User Profile
app.get("/api/auth/me", authenticate, async (req: any, res) => {
  const db = await readDb();
  const user = db.users.find((u) => u.id === req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: "User profile not found." });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// 5. Product Management CRUD: READ (Products list)
app.get("/api/products", authenticate, async (req: any, res) => {
  const { search, payment_method, sort_by, sort_order } = req.query;
  const db = await readDb();
  let result = db.products.filter((p) => p.created_by === req.user.id);

  // Search by product name
  if (search) {
    const q = (search as string).toLowerCase().trim();
    result = result.filter((p) => p.product_name.toLowerCase().includes(q));
  }

  // Filter by payment method
  if (payment_method && payment_method !== "All") {
    result = result.filter((p) => p.payment_method === payment_method);
  }

  // Sorting
  if (sort_by) {
    const field = sort_by as keyof Product;
    const order = sort_order === "desc" ? -1 : 1;
    result.sort((a: any, b: any) => {
      if (a[field] == null) return order;
      if (b[field] == null) return -order;
      if (a[field] < b[field]) return -1 * order;
      if (a[field] > b[field]) return 1 * order;
      return 0;
    });
  } else {
    // Default sorting: most recently added first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  res.json(result);
});

// 6. Product Management CRUD: READ (Single Product Lookup)
app.get("/api/products/:id", authenticate, async (req: any, res) => {
  const db = await readDb();
  const product = db.products.find((p) => p.id === req.params.id);
  
  if (!product || product.created_by !== req.user.id) {
    return res.status(404).json({ error: "Product not found." });
  }
  res.json(product);
});

// 7. Product Management CRUD: CREATE
app.post("/api/products", authenticate, async (req: any, res) => {
  const { product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, receipt_image } = req.body;

  // Validation rules
  if (!product_name || !product_name.trim()) {
    return res.status(400).json({ error: "Product name is required." });
  }
  
  if (quantity == null || isNaN(Number(quantity)) || Number(quantity) < 0) {
    return res.status(400).json({ error: "Quantity must be a valid integer greater than or equal to 0." });
  }

  const soldQty = sold_quantity == null ? 0 : Number(sold_quantity);
  if (isNaN(soldQty) || soldQty < 0) {
    return res.status(400).json({ error: "Sold quantity must be a valid integer greater than or equal to 0." });
  }

  if (soldQty > Number(quantity)) {
    return res.status(400).json({ error: "Sold quantity cannot exceed total quantity in stock." });
  }

  if (!purchase_date) {
    return res.status(400).json({ error: "Purchase date is required." });
  }

  const validPaymentMethods = ["CBE Birr", "Telebirr", "Cash"];
  if (!payment_method || !validPaymentMethods.includes(payment_method)) {
    return res.status(400).json({ error: "Please select a valid payment method (CBE Birr, Telebirr, or Cash)." });
  }

  // Secure Image Type/Size Validation
  if (product_image) {
    if (product_image.startsWith("data:image/")) {
      const isOkFormat = product_image.includes("image/jpeg") || product_image.includes("image/png") || product_image.includes("image/jpg") || product_image.includes("image/webp");
      if (!isOkFormat) {
        return res.status(400).json({ error: "Invalid image format. Only WebP, JPEG, and PNG formats are allowed." });
      }

      // Check approx base64 size (1 base64 char ≈ 0.75 byte)
      const sizeBytes = product_image.length * 0.75;
      if (sizeBytes > 7 * 1024 * 1024) {
        return res.status(400).json({ error: "Selected image exceeds maximum size limit of 7MB." });
      }
    } else {
      return res.status(400).json({ error: "Invalid image upload request." });
    }
  }

  // Secure Receipt Image Type/Size Validation
  if (receipt_image) {
    if (receipt_image.startsWith("data:image/")) {
      const isOkFormat = receipt_image.includes("image/jpeg") || receipt_image.includes("image/png") || receipt_image.includes("image/jpg") || receipt_image.includes("image/webp");
      if (!isOkFormat) {
        return res.status(400).json({ error: "Invalid receipt image format. Only WebP, JPEG, and PNG formats are allowed." });
      }

      const sizeBytes = receipt_image.length * 0.75;
      if (sizeBytes > 7 * 1024 * 1024) {
        return res.status(400).json({ error: "Selected receipt image exceeds maximum size limit of 7MB." });
      }
    } else {
      return res.status(400).json({ error: "Invalid receipt image upload request." });
    }
  }

  const db = await readDb();
  // Resolve user name: use token name if available, fall back to DB lookup
  const creatorName = req.user.name || db.users.find((u: any) => u.id === req.user.id)?.name || "Unknown";
  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    product_name: product_name.trim(),
    quantity: Math.floor(Number(quantity)),
    sold_quantity: Math.floor(soldQty),
    purchase_date,
    payment_method,
    total_price: isNaN(Number(total_price)) ? 0 : Number(total_price),
    product_image: product_image || undefined,
    receipt_image: receipt_image || undefined,
    created_by: req.user.id,
    created_by_name: creatorName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.products.push(newProduct);
  await writeDb(db);

  await logAudit(
    req.user.id,
    creatorName,
    "PRODUCT_CREATE",
    "PRODUCT",
    newProduct.id,
    `Added product: ${newProduct.product_name} (Qty: ${newProduct.quantity}, Sold: ${newProduct.sold_quantity}, Pay: ${newProduct.payment_method})`
  );

  res.status(201).json(newProduct);
});

// 8. Product Management CRUD: UPDATE
app.put("/api/products/:id", authenticate, async (req: any, res) => {
  const { product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, clear_image, receipt_image, clear_receipt_image } = req.body;
  const db = await readDb();
  const productIndex = db.products.findIndex((p) => p.id === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ error: "Product not found." });
  }

  if (db.products[productIndex].created_by !== req.user.id) {
    return res.status(403).json({ error: "Forbidden. You can only edit your own products." });
  }

  // Validation rules
  if (!product_name || !product_name.trim()) {
    return res.status(400).json({ error: "Product name cannot be empty." });
  }
  
  if (quantity == null || isNaN(Number(quantity)) || Number(quantity) < 0) {
    return res.status(400).json({ error: "Quantity must be a valid integer greater than or equal to 0." });
  }

  const soldQty = sold_quantity == null ? 0 : Number(sold_quantity);
  if (isNaN(soldQty) || soldQty < 0) {
    return res.status(400).json({ error: "Sold quantity must be a valid integer greater than or equal to 0." });
  }

  if (soldQty > Number(quantity)) {
    return res.status(400).json({ error: "Sold quantity cannot exceed total quantity in stock." });
  }

  if (!purchase_date) {
    return res.status(400).json({ error: "Purchase date is required." });
  }

  const validPaymentMethods = ["CBE Birr", "Telebirr", "Cash"];
  if (!payment_method || !validPaymentMethods.includes(payment_method)) {
    return res.status(400).json({ error: "Please select a valid payment method." });
  }

  // Validation image
  if (product_image && !clear_image) {
    if (product_image.startsWith("data:image/")) {
      const isOkFormat = product_image.includes("image/jpeg") || product_image.includes("image/png") || product_image.includes("image/jpg") || product_image.includes("image/webp");
      if (!isOkFormat) {
        return res.status(400).json({ error: "Invalid image format. Only WebP, JPEG, and PNG formats are allowed." });
      }
      const sizeBytes = product_image.length * 0.75;
      if (sizeBytes > 7 * 1024 * 1024) {
        return res.status(400).json({ error: "Selected image exceeds maximum size limit of 7MB." });
      }
    }
  }

  // Validation receipt image
  if (receipt_image && !clear_receipt_image) {
    if (receipt_image.startsWith("data:image/")) {
      const isOkFormat = receipt_image.includes("image/jpeg") || receipt_image.includes("image/png") || receipt_image.includes("image/jpg") || receipt_image.includes("image/webp");
      if (!isOkFormat) {
        return res.status(400).json({ error: "Invalid receipt image format. Only WebP, JPEG, and PNG formats are allowed." });
      }
      const sizeBytes = receipt_image.length * 0.75;
      if (sizeBytes > 7 * 1024 * 1024) {
        return res.status(400).json({ error: "Selected receipt image exceeds maximum size limit of 7MB." });
      }
    }
  }

  const existingProduct = db.products[productIndex];
  const oldName = existingProduct.product_name;
  const editorName = req.user.name || db.users.find((u: any) => u.id === req.user.id)?.name || "Unknown";

  // Preserve image or assign new one
  let finalImage = existingProduct.product_image;
  if (clear_image) {
    finalImage = undefined;
  } else if (product_image) {
    finalImage = product_image;
  }

  // Preserve receipt image or assign new one
  let finalReceiptImage = existingProduct.receipt_image;
  if (clear_receipt_image) {
    finalReceiptImage = undefined;
  } else if (receipt_image) {
    finalReceiptImage = receipt_image;
  }

  const updatedProduct: Product = {
    ...existingProduct,
    product_name: product_name.trim(),
    quantity: Math.floor(Number(quantity)),
    sold_quantity: Math.floor(soldQty),
    purchase_date,
    payment_method,
    total_price: isNaN(Number(total_price)) ? 0 : Number(total_price),
    product_image: finalImage,
    receipt_image: finalReceiptImage,
    updated_at: new Date().toISOString(),
  };

  db.products[productIndex] = updatedProduct;
  await writeDb(db);

  await logAudit(
    req.user.id,
    editorName,
    "PRODUCT_UPDATE",
    "PRODUCT",
    updatedProduct.id,
    `Updated product ${oldName} -> ${updatedProduct.product_name} (Qty: ${updatedProduct.quantity}, Sold: ${updatedProduct.sold_quantity}, Pay: ${updatedProduct.payment_method})`
  );

  res.json(updatedProduct);
});

// 9. Product Management CRUD: DELETE
app.delete("/api/products/:id", authenticate, async (req: any, res) => {
  const db = await readDb();
  const product = db.products.find((p) => p.id === req.params.id);

  if (!product) {
    return res.status(404).json({ error: "Product not found." });
  }

  if (product.created_by !== req.user.id) {
    return res.status(403).json({ error: "Forbidden. You can only delete your own products." });
  }

  const deleterName = req.user.name || db.users.find((u: any) => u.id === req.user.id)?.name || "Unknown";

  db.products = db.products.filter((p) => p.id !== req.params.id);
  await writeDb(db);

  await logAudit(
    req.user.id,
    deleterName,
    "PRODUCT_DELETE",
    "PRODUCT",
    req.params.id,
    `Deleted product: ${product.product_name}`
  );

  res.json({ success: true, message: `Product ${product.product_name} deleted successfully.` });
});

// 10. Audit Logs List
app.get("/api/audit-logs", authenticate, requireAdmin, async (req: any, res) => {
  const db = await readDb();
  // Admins see ALL audit logs across all users
  res.json(db.audit_logs);
});

// 11. Custom Audit Logger (for operations like PDF exports)
app.post("/api/audit-logs/log", authenticate, async (req: any, res) => {
  const { action, entity_type, entity_id, metadata } = req.body;
  if (!action || !entity_type || !entity_id) {
    return res.status(400).json({ error: "Action, type, and ID are required to log events." });
  }

  await logAudit(req.user.id, req.user.name, action, entity_type, entity_id, metadata || "");
  res.json({ success: true });
});

// 12. Complete Dashboard Analytics API
app.get("/api/analytics", authenticate, async (req: any, res) => {
  const db = await readDb();
  const products = db.products.filter((p) => p.created_by === req.user.id);
  const sales = db.sales.filter((s) => s.created_by === req.user.id);

  // Summary counts
  const totalProducts = products.length;
  const totalQuantity = products.reduce((acc, p) => acc + p.quantity, 0);
  const totalValue = products.reduce((acc, p) => acc + (p.total_price || 0), 0);

  // Payment Breakdown - calculated from individual sales
  const paymentBreakdown = {
    cbe: sales.filter((s) => s.payment_method === "CBE Birr").reduce((acc, s) => acc + (s.total_price || 0), 0),
    telebirr: sales.filter((s) => s.payment_method === "Telebirr").reduce((acc, s) => acc + (s.total_price || 0), 0),
    cash: sales.filter((s) => s.payment_method === "Cash").reduce((acc, s) => acc + (s.total_price || 0), 0),
    
    // Qty based breakdown
    cbe_qty: sales.filter((s) => s.payment_method === "CBE Birr").reduce((acc, s) => acc + s.quantity, 0),
    telebirr_qty: sales.filter((s) => s.payment_method === "Telebirr").reduce((acc, s) => acc + s.quantity, 0),
    cash_qty: sales.filter((s) => s.payment_method === "Cash").reduce((acc, s) => acc + s.quantity, 0),
  };

  // Time Series Summarization (Day, Week, Month totals based on sale_date)
  const now = new Date();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  
  const todayStr = now.toISOString().split("T")[0];
  const startOfWeek = new Date(now.getTime() - 7 * MS_PER_DAY);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const statsByTime = {
    day: { count: 0, qty: 0, val: 0 },
    week: { count: 0, qty: 0, val: 0 },
    month: { count: 0, qty: 0, val: 0 }
  };

  sales.forEach(s => {
    const sDate = new Date(s.sale_date);
    const sDateStr = s.sale_date;

    // Day matches today
    if (sDateStr === todayStr) {
      statsByTime.day.count++;
      statsByTime.day.qty += s.quantity;
      statsByTime.day.val += (s.total_price || 0);
    }

    // Week matches within 7 days
    if (sDate >= startOfWeek) {
      statsByTime.week.count++;
      statsByTime.week.qty += s.quantity;
      statsByTime.week.val += (s.total_price || 0);
    }

    // Month matches current calendar month
    if (sDate >= startOfMonth) {
      statsByTime.month.count++;
      statsByTime.month.qty += s.quantity;
      statsByTime.month.val += (s.total_price || 0);
    }
  });

  // Product Growth Trend based on sale_date sorts
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const trendsMap: { [key: string]: { value: number; count: number; qty: number } } = {};
  
  // Pre-populate last 6 calendar months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(now.getMonth() - i);
    const mName = months[d.getMonth()] + " " + d.getFullYear().toString().substr(-2);
    trendsMap[mName] = { value: 0, count: 0, qty: 0 };
  }

  sales.forEach(s => {
    const sDate = new Date(s.sale_date);
    const mName = months[sDate.getMonth()] + " " + sDate.getFullYear().toString().substr(-2);
    if (trendsMap[mName]) {
      trendsMap[mName].value += (s.total_price || 0);
      trendsMap[mName].count++;
      trendsMap[mName].qty += s.quantity;
    }
  });

  const trends = Object.keys(trendsMap).map(key => ({
    month: key,
    value: trendsMap[key].value,
    qty: trendsMap[key].qty,
    count: trendsMap[key].count
  }));

  res.json({
    totals: {
      totalProducts,
      totalQuantity,
      totalValue,
    },
    payment: paymentBreakdown,
    timeStats: statsByTime,
    trends
  });
});

// ======================== SALES TRANSACTION API ========================

// 12a. Fetch Sales Ledger (GET /api/sales)
app.get("/api/sales", authenticate, async (req: any, res) => {
  const db = await readDb();
  // Admins/Users see only their own sales
  const result = db.sales.filter((s) => s.created_by === req.user.id);
  res.json(result);
});

// 12b. Record Sale Transaction (POST /api/sales)
app.post("/api/sales", authenticate, async (req: any, res) => {
  try {
    const { product_id, quantity, unit_price, total_price, sale_date, payment_method, receipt_image } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "Product ID is required." });
    }
    if (quantity == null || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({ error: "Quantity must be greater than 0." });
    }
    if (unit_price == null || isNaN(Number(unit_price)) || Number(unit_price) < 0) {
      return res.status(400).json({ error: "Unit price must be a valid positive number." });
    }

    const db = await readDb();
    const productIndex = db.products.findIndex((p) => p.id === product_id);
    if (productIndex === -1) {
      return res.status(404).json({ error: "Product not found." });
    }

    const product = db.products[productIndex];
    
    if (product.created_by !== req.user.id) {
      return res.status(403).json({ error: "Forbidden. You do not own this product." });
    }

    const remaining = product.quantity - (product.sold_quantity ?? 0);
    const qtyToSell = Math.floor(Number(quantity));
    if (qtyToSell > remaining) {
      return res.status(400).json({ error: `Not enough stock. Remaining: ${remaining}, Requested: ${qtyToSell}` });
    }

    // Update product's sold_quantity
    product.sold_quantity = (product.sold_quantity ?? 0) + qtyToSell;
    product.updated_at = new Date().toISOString();

    // Create new Sale
    const creatorName = req.user.name || db.users.find((u: any) => u.id === req.user.id)?.name || "Unknown";
    const newSale: Sale = {
      id: `sale_${Date.now()}`,
      product_id,
      product_name: product.product_name,
      quantity: qtyToSell,
      unit_price: Number(unit_price),
      total_price: Number(total_price) || (qtyToSell * Number(unit_price)),
      sale_date: sale_date || new Date().toISOString().split("T")[0],
      payment_method,
      receipt_image: receipt_image || undefined,
      created_by: req.user.id,
      created_by_name: creatorName,
      created_at: new Date().toISOString(),
    };

    db.sales.push(newSale);
    await writeDb(db);

    await logAudit(
      req.user.id,
      creatorName,
      "PRODUCT_SALE_RECORD",
      "PRODUCT",
      product_id,
      `Recorded sale transaction: ${qtyToSell} pcs of ${product.product_name} at unit price ETB ${newSale.unit_price} via ${payment_method}`
    );

    res.status(201).json(newSale);
  } catch (err: any) {
    console.error("Error recording sale:", err);
    res.status(500).json({ error: err.message || "Failed to record sale transaction." });
  }
});

// 12c. Delete Sale Transaction (DELETE /api/sales/:id)
app.delete("/api/sales/:id", authenticate, async (req: any, res) => {
  const db = await readDb();
  const saleIndex = db.sales.findIndex((s) => s.id === req.params.id);
  if (saleIndex === -1) {
    return res.status(404).json({ error: "Sale transaction not found." });
  }

  const sale = db.sales[saleIndex];
 
  if (sale.created_by !== req.user.id) {
    return res.status(403).json({ error: "Forbidden. You do not own this transaction." });
  }

  // Adjust product's sold_quantity down
  const productIndex = db.products.findIndex((p) => p.id === sale.product_id);
  if (productIndex !== -1) {
    const product = db.products[productIndex];
    product.sold_quantity = Math.max(0, (product.sold_quantity ?? 0) - sale.quantity);
    product.updated_at = new Date().toISOString();
  }

  // Delete sale
  db.sales.splice(saleIndex, 1);
  await writeDb(db);

  const operatorName = req.user.name || db.users.find((u: any) => u.id === req.user.id)?.name || "Unknown";
  await logAudit(
    req.user.id,
    operatorName,
    "PRODUCT_SALE_DELETE",
    "PRODUCT",
    sale.product_id,
    `Deleted sale transaction ${sale.id} (${sale.quantity} pcs of ${sale.product_name})`
  );

  res.json({ success: true, message: "Sale transaction deleted successfully." });
});

// ======================== SUPABASE API ENDPOINTS ========================

// 13. Get Supabase Configuration and Tables status
app.get("/api/supabase/status", authenticate, async (req, res) => {
  const isConfigured = isSupabaseConfigured();
  const connectionTest = await testConnection();
  
  res.json({
    isConfigured,
    supabaseUrl: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.substring(0, 15)}...` : undefined,
    ...connectionTest
  });
});

// 14. Migrate/Sync all local DB.JSON data rows into Supabase
app.post("/api/supabase/sync", authenticate, requireAdmin, async (req: any, res) => {
  const localDb = readDbLocal();
  const syncResult = await syncLocalDataToSupabase(localDb);
  
  if (syncResult.success) {
    await logAudit(
      req.user.id,
      req.user.name,
      "SUPABASE_SYNC",
      "SYSTEM",
      "SYSTEM",
      `Migrated local database state to Supabase: ${syncResult.syncedUsers} users, ${syncResult.syncedProducts} products, ${syncResult.syncedLogs} logs`
    );
  }
  
  res.json(syncResult);
});

export default app;
