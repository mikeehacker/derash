import fetch from "node-fetch"; // wait, node-fetch might not be installed, we can use global fetch in Node 18+

const API_BASE = "http://localhost:3001/api";

async function run() {
  console.log("Starting API flow test...");

  // 1. Register a test user
  const email = `test_${Date.now()}@example.com`;
  const password = "password123";
  console.log("Registering user:", email);
  
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email,
      password,
      role: "Admin"
    })
  });

  const regData = (await regRes.json()) as any;
  if (!regRes.ok) {
    console.error("Registration failed:", regData);
    return;
  }
  console.log("Registration success:", regData.user.id);
  const token = regData.token;

  // 2. Create a test product
  console.log("Creating product...");
  const prodRes = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      product_name: "Test Product",
      quantity: 10,
      sold_quantity: 0,
      purchase_date: "2026-06-21",
      payment_method: "Cash",
      total_price: 1000
    })
  });

  const prodData = (await prodRes.json()) as any;
  if (!prodRes.ok) {
    console.error("Product creation failed:", prodData);
    return;
  }
  console.log("Product created:", prodData.id);

  // 3. Record a sale
  console.log("Recording sale...");
  const saleRes = await fetch(`${API_BASE}/sales`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      product_id: prodData.id,
      quantity: 2,
      unit_price: 100,
      total_price: 200,
      sale_date: "2026-06-21",
      payment_method: "Cash"
    })
  });

  const saleData = (await saleRes.json()) as any;
  if (!saleRes.ok) {
    console.error("Sale recording failed:", saleData);
    return;
  }
  console.log("Sale recorded success:", saleData);

  // 4. Fetch sales
  console.log("Fetching sales...");
  const getSalesRes = await fetch(`${API_BASE}/sales`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  const salesList = await getSalesRes.json();
  console.log("Sales list:", salesList);
}

run().catch(console.error);
