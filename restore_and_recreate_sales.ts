import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else {
  dotenv.config();
}

const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "");
const checkFile = path.join(process.cwd(), 'data', 'db_check.json');
const dbFile = path.join(process.cwd(), 'data', 'db.json');

function readJsonFile(filePath: string): any {
  const buffer = fs.readFileSync(filePath);
  if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
    let content = buffer.toString("utf16le").trim();
    const firstBrace = content.indexOf('{');
    if (firstBrace > 0) {
      content = content.substring(firstBrace);
    }
    return JSON.parse(content);
  }
  let content = buffer.toString("utf-8").trim();
  const firstBrace = content.indexOf('{');
  if (firstBrace > 0) {
    content = content.substring(firstBrace);
  }
  return JSON.parse(content);
}

async function run() {
  console.log("Starting sales restoration & recreation...");

  // 1. Fetch live products from Supabase
  const { data: liveProducts, error: pErr } = await supabase.from('products').select('*');
  if (pErr || !liveProducts) {
    console.error("Failed to fetch live products from Supabase:", pErr);
    return;
  }
  console.log(`Loaded ${liveProducts.length} live products from Supabase.`);

  // 2. Fetch live sales from Supabase
  const { data: liveSales, error: sErr } = await supabase.from('sales').select('*');
  if (sErr || !liveSales) {
    console.error("Failed to fetch live sales from Supabase:", sErr);
    return;
  }
  console.log(`Loaded ${liveSales.length} live sales from Supabase.`);

  // 3. Load backup sales from db_check.json
  let backupSales: any[] = [];
  if (fs.existsSync(checkFile)) {
    try {
      const backupDb = readJsonFile(checkFile);
      backupSales = backupDb.sales || [];
      console.log(`Loaded ${backupSales.length} backup sales from db_check.json.`);
    } catch (e: any) {
      console.error("Failed to read backup sales from db_check.json:", e.message);
    }
  }

  // 4. Create lists for restoration
  const salesToUpsert: any[] = [];

  // Add backup sales if not already in live sales
  for (const bSale of backupSales) {
    const exists = liveSales.some(s => s.id === bSale.id);
    if (!exists) {
      salesToUpsert.push(bSale);
    }
  }

  // 5. Scan products to find missing sales transactions
  for (const product of liveProducts) {
    const sq = product.sold_quantity || 0;
    if (sq > 0) {
      // Calculate how many sales of this product are already in liveSales + backupSales
      const existingProductSales = [
        ...liveSales.filter(s => s.product_id === product.id),
        ...salesToUpsert.filter(s => s.product_id === product.id)
      ];
      const totalSoldInSales = existingProductSales.reduce((acc, s) => acc + s.quantity, 0);

      const diff = sq - totalSoldInSales;
      if (diff > 0) {
        console.log(`Product "${product.product_name}" (owned by ${product.created_by_name || product.created_by}) has sold_quantity=${sq} but sales sum is ${totalSoldInSales}. Recreating sale entry for ${diff} units.`);
        
        const unitPrice = product.quantity > 0 ? Math.round(product.total_price / product.quantity) : 0;
        const newSale = {
          id: `sale_recreated_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          product_id: product.id,
          product_name: product.product_name,
          quantity: diff,
          unit_price: unitPrice,
          total_price: diff * unitPrice,
          sale_date: product.purchase_date || new Date().toISOString().split('T')[0],
          payment_method: product.payment_method || 'Cash',
          created_by: product.created_by,
          created_by_name: product.created_by_name || 'Manager',
          created_at: new Date().toISOString()
        };
        salesToUpsert.push(newSale);
      }
    }
  }

  console.log(`Total sales to upsert to Supabase: ${salesToUpsert.length}`);

  if (salesToUpsert.length > 0) {
    // Upsert into Supabase
    const { error: upsertErr } = await supabase.from('sales').upsert(salesToUpsert, { onConflict: 'id' });
    if (upsertErr) {
      console.error("Failed to upsert sales into Supabase:", upsertErr);
    } else {
      console.log("Successfully upserted sales into Supabase!");
    }
  }

  // 6. Sync local db.json
  if (fs.existsSync(dbFile)) {
    const localDb = readJsonFile(dbFile);
    const mergedSales = [...(localDb.sales || [])];
    
    // Add restored sales to local JSON
    for (const sale of salesToUpsert) {
      if (!mergedSales.some(s => s.id === sale.id)) {
        mergedSales.push(sale);
      }
    }
    localDb.sales = mergedSales;
    
    // Make sure product sold quantities match
    for (const p of localDb.products || []) {
      const liveP = liveProducts.find(lp => lp.id === p.id);
      if (liveP) {
        p.sold_quantity = liveP.sold_quantity;
      }
    }

    fs.writeFileSync(dbFile, JSON.stringify(localDb, null, 2), "utf-8");
    console.log("Successfully updated local db.json!");
  }
}
run();
