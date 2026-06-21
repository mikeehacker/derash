-- ============================================================
--  DERASH INVENTORY MANAGEMENT — SUPABASE SCHEMA & LIVE DATA
--  Generated on: 2026-06-20T22:56:42.269Z
--  Mode: LITE (Excludes Images to avoid paste/execution size limits)
-- ============================================================

-- ============================================================
-- 1. SCHEMA DEFINITIONS (Tables, Indexes, Views, Constraints)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('Admin', 'User')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS products (
  id              TEXT PRIMARY KEY,
  product_name    TEXT NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  sold_quantity   INTEGER NOT NULL DEFAULT 0 CHECK (sold_quantity >= 0),
  purchase_date   TEXT NOT NULL,
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('CBE Birr', 'Telebirr', 'Cash')),
  total_price     DOUBLE PRECISION NOT NULL DEFAULT 0,
  product_image   TEXT,
  created_by      TEXT,
  created_by_name TEXT NOT NULL DEFAULT 'Unknown',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products (created_by);
CREATE INDEX IF NOT EXISTS idx_products_purchase_date ON products (purchase_date);
CREATE INDEX IF NOT EXISTS idx_products_payment_method ON products (payment_method);
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS audit_logs (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  user_name   TEXT NOT NULL,
  action      TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id   TEXT NOT NULL,
  metadata    TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. DATA POPULATION (Live records from production)
-- ============================================================

-- --- POPULATING users (5 rows) ---
INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES ('usr_1781574295660', 'Mikiyas', 'kakaker485@dyleris.com', 'bb6b273d6ad93ddb43b0f6e4f12b9779ffcb67868ccb37447ce97a6b88784585', 'Admin', '2026-06-16T01:44:55.66+00:00')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, created_at = EXCLUDED.created_at;

INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES ('usr_1781640868777', 'Bemnet', 'bemnetyabatalj@gmail.com', '12b637dd6a40e81118a123a7dde7d54c584569c273c31ed71ef33fcaa373112a', 'Admin', '2026-06-16T20:14:28.777+00:00')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, created_at = EXCLUDED.created_at;

INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES ('usr_1781655618415', 'Mikiyas', 'test_mcp_operator@derash.com', 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea', 'Admin', '2026-06-17T00:20:18.415+00:00')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, created_at = EXCLUDED.created_at;

INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES ('usr_1781657211028', 'Auditor Two', 'auditortwo@derash.comrash.com', 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea', 'Admin', '2026-06-17T00:46:51.029+00:00')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, created_at = EXCLUDED.created_at;

INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES ('usr_1781659833626', 'Redacted Test Admin', 'test_admin_isolate_new@derash.com', 'a109e36947ad56de1dca1cc49f0ef8ac9ad9a7b1aa0df41fb3c4cb73c1ff01ea', 'Admin', '2026-06-17T01:30:33.626+00:00')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, created_at = EXCLUDED.created_at;

-- --- POPULATING products (46 rows) ---
INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781655666130', 'Sony WH-1000XM5', 5, 0, '2026-06-17', 'CBE Birr', 40000, NULL, 'usr_1781655618415', 'Mikiyas', '2026-06-17T00:21:06.13+00:00', '2026-06-17T00:21:06.13+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781725197931', 'Afri harbal', 1, 0, '2026-06-17', 'CBE Birr', 550, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-17T19:39:57.931+00:00', '2026-06-17T19:39:57.931+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781725281242', 'Carrot oil cerem', 1, 0, '2026-06-17', 'CBE Birr', 750, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-17T19:41:21.242+00:00', '2026-06-17T19:41:21.242+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781725387771', 'Dove shapoo', 3, 0, '2026-06-17', 'CBE Birr', 2100, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-17T19:43:07.771+00:00', '2026-06-17T19:43:07.771+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781725467920', 'Duru shampoo', 1, 0, '2026-06-17', 'CBE Birr', 800, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-17T19:44:27.92+00:00', '2026-06-17T19:44:27.92+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781725577891', 'Performe condishner', 1, 0, '2026-06-17', 'CBE Birr', 850, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-17T19:46:17.891+00:00', '2026-06-17T19:46:17.891+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781725648117', 'Perfume shampoo', 1, 0, '2026-06-17', 'CBE Birr', 850, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-17T19:47:28.117+00:00', '2026-06-17T19:47:28.117+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781725850328', 'Skala expelt conditioner', 1, 0, '2026-06-17', 'CBE Birr', 800, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-17T19:50:50.328+00:00', '2026-06-17T19:50:50.328+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781726001478', 'alora conditioner', 1, 0, '2026-06-17', 'CBE Birr', 800, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-17T19:53:21.478+00:00', '2026-06-17T19:54:47.583+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781767450213', 'Alora shampoo', 2, 0, '2026-06-17', 'CBE Birr', 800, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T07:24:10.213+00:00', '2026-06-18T07:24:10.213+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781769011132', 'Sunsik shaampoo', 1, 0, '2026-06-17', 'CBE Birr', 600, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T07:50:11.132+00:00', '2026-06-18T07:50:11.132+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781769387911', 'Organza shampoo', 1, 0, '2026-06-17', 'CBE Birr', 550, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T07:56:27.911+00:00', '2026-06-18T07:56:27.911+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781769589356', 'Cosmo charcoal', 1, 0, '2026-06-17', 'CBE Birr', 750, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T07:59:49.356+00:00', '2026-06-18T07:59:49.356+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781770542248', 'V.v love', 1, 0, '2026-06-17', 'CBE Birr', 0, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T08:15:42.248+00:00', '2026-06-18T08:15:42.248+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781770731021', 'Garnler color', 4, 0, '2026-06-17', 'CBE Birr', 2200, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T08:18:51.021+00:00', '2026-06-18T08:18:51.021+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781770835110', 'Papaya', 1, 0, '2026-06-17', 'CBE Birr', 900, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T08:20:35.11+00:00', '2026-06-18T08:20:35.11+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781771049394', 'Shadow ( fix derma)', 1, 0, '2026-06-17', 'CBE Birr', 2200, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T08:24:09.394+00:00', '2026-06-18T08:24:09.394+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781771487270', 'Black water mask', 1, 0, '2026-06-17', 'CBE Birr', 800, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T08:31:27.27+00:00', '2026-06-18T08:31:27.27+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781771552009', 'Cerave', 1, 0, '2026-06-17', 'CBE Birr', 3500, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T08:32:32.009+00:00', '2026-06-18T08:32:32.009+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781771668821', 'Nisa loshn', 2, 0, '2026-06-17', 'CBE Birr', 900, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T08:34:28.821+00:00', '2026-06-18T08:34:28.821+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781771827267', 'Clere', 1, 0, '2026-06-17', 'CBE Birr', 450, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T08:37:07.267+00:00', '2026-06-18T08:37:07.267+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781771937496', 'Vaseline loshn', 3, 0, '2026-06-17', 'CBE Birr', 1500, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T08:38:57.496+00:00', '2026-06-18T08:38:57.496+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781772133914', 'Afro chic', 12, 0, '2026-06-17', 'CBE Birr', 4800, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-18T08:42:13.914+00:00', '2026-06-18T08:42:13.914+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781879991801', 'clere ትንሹ', 2, 0, '2026-06-17', 'CBE Birr', 800, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-19T14:39:51.801+00:00', '2026-06-19T14:39:51.801+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781880110623', 'Clere ትልቁ', 2, 0, '2026-06-17', 'CBE Birr', 800, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-19T14:41:50.623+00:00', '2026-06-19T14:41:50.623+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781880735734', 'college', 1, 0, '2026-06-17', 'CBE Birr', 1600, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-19T14:52:15.734+00:00', '2026-06-19T14:52:15.734+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781880947397', 'Louis cardir (Illusion )', 4, 0, '2026-06-17', 'CBE Birr', 3200, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-19T14:55:47.397+00:00', '2026-06-20T06:26:36.523+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781881545849', 'Hayaati', 2, 0, '2026-06-17', 'CBE Birr', 2800, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-19T15:05:45.849+00:00', '2026-06-19T15:05:45.849+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781937036489', 'Royale doderant', 1, 0, '2026-06-17', 'CBE Birr', 800, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T06:30:36.489+00:00', '2026-06-20T06:30:36.489+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781937160088', 'Smart collection', 1, 0, '2026-06-17', 'CBE Birr', 1000, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T06:32:40.088+00:00', '2026-06-20T06:32:40.088+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781937269698', 'Island mal tar', 1, 0, '2026-06-17', 'CBE Birr', 850, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T06:34:29.698+00:00', '2026-06-20T06:34:29.698+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781937400536', 'Dear Body', 2, 0, '2026-06-17', 'CBE Birr', 2600, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T06:36:40.536+00:00', '2026-06-20T06:36:40.536+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781937535716', 'D₃ White amrij', 3, 0, '2026-06-17', 'CBE Birr', 1350, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T06:38:55.716+00:00', '2026-06-20T06:38:55.716+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781937606230', 'Sensodne', 3, 0, '2026-06-17', 'CBE Birr', 1350, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T06:40:06.23+00:00', '2026-06-20T06:40:06.23+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781937708579', 'Daabur Herbl', 2, 0, '2026-06-17', 'CBE Birr', 900, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T06:41:48.579+00:00', '2026-06-20T06:41:48.579+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781937776610', 'Daabur Herbl', 2, 0, '2026-06-17', 'CBE Birr', 900, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T06:42:56.61+00:00', '2026-06-20T06:42:56.61+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781938515281', 'Vaseline ትንሹን', 10, 0, '2026-06-17', 'CBE Birr', 5000, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T06:55:15.281+00:00', '2026-06-20T06:55:15.281+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781943957523', 'Vaseline ትልቁን', 3, 0, '2026-06-17', 'CBE Birr', 2100, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T08:25:57.523+00:00', '2026-06-20T08:25:57.523+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781944094977', 'Cocoa better ትልቁ', 2, 0, '2026-06-17', 'CBE Birr', 1800, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T08:28:14.977+00:00', '2026-06-20T08:32:42.726+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781944179346', 'Cocoa better ትንሹን', 1, 0, '2026-06-17', 'CBE Birr', 600, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T08:29:39.346+00:00', '2026-06-20T08:31:24.977+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781944825700', 'Vatika olive', 1, 0, '2026-06-17', 'CBE Birr', 550, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T08:40:25.7+00:00', '2026-06-20T08:40:25.7+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781944964435', 'Afro Chic Vaseline', 2, 0, '2026-06-17', 'CBE Birr', 500, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T08:42:44.435+00:00', '2026-06-20T08:42:44.435+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781945105646', 'Just for baby Vaseline', 1, 0, '2026-06-17', 'CBE Birr', 400, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T08:45:05.646+00:00', '2026-06-20T08:45:05.646+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781945252041', 'Vatika Henna', 6, 0, '2026-06-17', 'CBE Birr', 3000, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T08:47:32.041+00:00', '2026-06-20T08:47:32.041+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781945506344', 'Halr colouur (cruset)', 3, 0, '2026-06-17', 'CBE Birr', 1350, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T08:51:46.344+00:00', '2026-06-20T08:51:46.344+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

INSERT INTO products (id, product_name, quantity, sold_quantity, purchase_date, payment_method, total_price, product_image, created_by, created_by_name, created_at, updated_at)
VALUES ('prod_1781945786427', 'kojie son', 2, 0, '2026-06-17', 'CBE Birr', 1700, NULL, 'usr_1781640868777', 'Bemnet', '2026-06-20T08:56:26.427+00:00', '2026-06-20T08:56:26.427+00:00')
ON CONFLICT (id) DO UPDATE SET
  product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, sold_quantity = EXCLUDED.sold_quantity, purchase_date = EXCLUDED.purchase_date, payment_method = EXCLUDED.payment_method, total_price = EXCLUDED.total_price, product_image = EXCLUDED.product_image, created_by = EXCLUDED.created_by, created_by_name = EXCLUDED.created_by_name, created_at = EXCLUDED.created_at, updated_at = EXCLUDED.updated_at;

-- --- POPULATING audit_logs (191 rows) ---
INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781574085781_ohn8xt4z1', 'usr_1781574084690', 'teme', 'USER_REGISTER', 'USER', 'usr_1781574084690', 'Registered as role: Admin (first user — auto-assigned Admin)', '2026-06-16T01:41:25.781+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781574092452_whj5gkd09', 'usr_1781574084690', 'teme', 'USER_LOGIN', 'USER', 'usr_1781574084690', 'Logged in successfully from IP', '2026-06-16T01:41:32.452+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781574261356_8jgvxewvs', 'usr_1781574084690', 'teme', 'USER_LOGIN', 'USER', 'usr_1781574084690', 'Logged in successfully from IP', '2026-06-16T01:44:21.356+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781574296943_h926qxeje', 'usr_1781574295660', 'daw', 'USER_REGISTER', 'USER', 'usr_1781574295660', 'Registered as role: Admin', '2026-06-16T01:44:56.943+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781574302961_70wdri82a', 'usr_1781574295660', 'daw', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-16T01:45:02.961+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781574480622_nc81khk4k', 'usr_1781574295660', 'daw', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-16T01:48:00.622+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781574541983_f9ofcb9aj', 'usr_1781574295660', 'daw', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781574540951', 'Added product: chama (Qty: 5, Sold: 0, Pay: CBE Birr)', '2026-06-16T01:49:01.983+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781574811363_ha7yux2jb', 'usr_1781574295660', 'daw', 'USER_LOGOUT', 'USER', 'usr_1781574295660', 'Logged out successfully via user interaction', '2026-06-16T01:53:31.363+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781574812348_6h8gyy4cb', 'usr_1781574295660', 'daw', 'USER_LOGOUT', 'USER', 'usr_1781574295660', 'Logged out successfully via user interaction', '2026-06-16T01:53:32.348+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781574817435_9ks4znekw', 'usr_1781574295660', 'daw', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-16T01:53:37.435+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781575648160_79su28ksg', 'usr_1781574295660', 'daw', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781575645765', 'Added product: chama (Qty: 7, Sold: 0, Pay: CBE Birr)', '2026-06-16T02:07:28.16+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781575985666_ecnfhcw8a', 'usr_1781574295660', 'daw', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781575645765', 'Updated product chama -> chama (Qty: 7, Sold: 0, Pay: CBE Birr)', '2026-06-16T02:13:05.666+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781613919481_1pmpscec6', 'usr_1781574295660', 'daw', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-16T12:45:19.482+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781614109626_cofhbi56e', 'usr_1781574295660', 'daw', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-16T12:48:29.626+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781614295788_m55lk1xtq', 'usr_1781574295660', 'daw', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T12:51:35.788+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781635806368_0gub5uoyp', 'usr_1781574295660', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-16T18:50:06.368+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781640870051_apv5bpw5n', 'usr_1781640868777', 'Bemnet', 'USER_REGISTER', 'USER', 'usr_1781640868777', 'Registered as role: Admin', '2026-06-16T20:14:30.051+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781641161000_n27ixfr3u', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781641159151', 'Added product: dove (Qty: 10, Sold: 0, Pay: CBE Birr)', '2026-06-16T20:19:21+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781641384010_vrg37wxld', 'usr_1781640868777', 'Bemnet', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781641159151', 'Updated product dove -> dove (Qty: 10, Sold: 2, Pay: Cash)', '2026-06-16T20:23:04.01+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781641385967_e5i5dx9w8', 'usr_1781640868777', 'Bemnet', 'PRODUCT_SALE_RECORD', 'PRODUCT', 'prod_1781641159151', 'Recorded sale: 2 pcs of dove at unit price ETB 500 via Cash on 2026-06-16', '2026-06-16T20:23:05.967+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781642082416_oleynefj4', 'usr_1781640868777', 'Bemnet', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781641159151', 'Updated product dove -> dove (Qty: 10, Sold: 4, Pay: Cash)', '2026-06-16T20:34:42.416+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781642244395_ux17tz53p', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781642242689', 'Added product: ሱሪ (Qty: 10, Sold: 0, Pay: CBE Birr)', '2026-06-16T20:37:24.395+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781642373042_rb4c74usb', 'usr_1781640868777', 'Bemnet', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781642242689', 'Updated product ሱሪ -> ሱሪ (Qty: 10, Sold: 2, Pay: Telebirr)', '2026-06-16T20:39:33.042+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781642375514_9y7g9xak0', 'usr_1781640868777', 'Bemnet', 'PRODUCT_SALE_RECORD', 'PRODUCT', 'prod_1781642242689', 'Recorded sale: 2 pcs of ሱሪ at unit price ETB 4,000 via Telebirr on 2026-06-17', '2026-06-16T20:39:35.514+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781642901189_a7xt6q4ah', 'usr_1781640868777', 'Bemnet', 'PRODUCT_DELETE', 'PRODUCT', 'prod_1781642242689', 'Deleted product: ሱሪ', '2026-06-16T20:48:21.189+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781642932751_phzr529z1', 'usr_1781640868777', 'Bemnet', 'PRODUCT_DELETE', 'PRODUCT', 'prod_1781641159151', 'Deleted product: dove', '2026-06-16T20:48:52.751+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781642948490_bl09pnbdu', 'usr_1781640868777', 'Bemnet', 'PRODUCT_DELETE', 'PRODUCT', 'prod_1781641159151', 'Deleted product: dove', '2026-06-16T20:49:08.49+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781645368632_7ob37fk8t', 'usr_1781574295660', 'daw', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781645367010', 'Added product: sharp (Qty: 12, Sold: 0, Pay: CBE Birr)', '2026-06-16T21:29:28.633+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781645510803_yrf7lfr6c', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T21:31:50.803+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781645883160_owg3sazdu', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T21:38:03.16+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781645923935_pauvw7mt3', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T21:38:43.935+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781645925382_jnkdryqa7', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T21:38:45.382+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781646539735_r3ovy7sdu', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T21:48:59.735+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781646987030_sn3kq04p6', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T21:56:27.03+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781646991688_8vhb2ogg1', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T21:56:31.688+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781646993133_ezlzvz8e0', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T21:56:33.133+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781646993256_47t45fx6y', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T21:56:33.256+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781646993934_huxb9mi3x', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T21:56:33.934+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781646994185_xyjnpw0nw', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T21:56:34.185+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781647736810_o0c9zg6lr', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T22:08:56.811+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781647790775_7e4eh4sam', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T22:09:50.775+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781648490450_qbs5888u0', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 1 filtered stock line items', '2026-06-16T22:21:30.45+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781655620508_v8i10n7mg', 'usr_1781655618415', 'Mikiyas', 'USER_REGISTER', 'USER', 'usr_1781655618415', 'Registered as role: Admin', '2026-06-17T00:20:20.508+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781655667386_l66huz0ac', 'usr_1781655618415', 'Mikiyas', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781655666130', 'Added product: Sony WH-1000XM5 (Qty: 5, Sold: 0, Pay: CBE Birr)', '2026-06-17T00:21:07.386+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781657005142_0a7rwb6i1', 'usr_1781655618415', 'Mikiyas', 'USER_LOGOUT', 'USER', 'usr_1781655618415', 'Logged out successfully via user interaction', '2026-06-17T00:43:25.142+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781657100243_aauwg1yzz', 'usr_1781655618415', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781655618415', 'Logged in successfully from IP', '2026-06-17T00:45:00.243+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781657120987_ijtixbpt7', 'usr_1781655618415', 'Mikiyas', 'USER_LOGOUT', 'USER', 'usr_1781655618415', 'Logged out successfully via user interaction', '2026-06-17T00:45:20.987+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781657212517_z3yvgp58k', 'usr_1781657211028', 'Auditor Two', 'USER_REGISTER', 'USER', 'usr_1781657211028', 'Registered as role: Admin', '2026-06-17T00:46:52.517+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781659836664_74sd30laq', 'usr_1781659833626', 'Redacted Test Admin', 'USER_REGISTER', 'USER', 'usr_1781659833626', 'Registered as role: Admin', '2026-06-17T01:30:36.664+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781665272686_ddzhnejky', 'usr_1781574295660', 'daw', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781665271288', 'Added product: Shak (Qty: 12, Sold: 0, Pay: CBE Birr)', '2026-06-17T03:01:12.687+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781665371103_vvn9238j0', 'usr_1781574295660', 'daw', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781665271288', 'Updated product Shak -> Shak (Qty: 12, Sold: 12, Pay: Telebirr)', '2026-06-17T03:02:51.103+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781665372821_dj5yh60pn', 'usr_1781574295660', 'daw', 'PRODUCT_SALE_RECORD', 'PRODUCT', 'prod_1781665271288', 'Recorded sale: 12 pcs of Shak at unit price ETB 2,545 via Telebirr on 2026-06-18', '2026-06-17T03:02:52.821+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781665581072_hlxr1lckr', 'usr_1781574295660', 'daw', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T03:06:21.072+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781665734418_qzujpevwv', 'usr_1781574295660', 'daw', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T03:08:54.418+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781665737223_4ogktkcy2', 'usr_1781574295660', 'daw', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T03:08:57.223+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781665748690_06dkuhcjq', 'usr_1781574295660', 'daw', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T03:09:08.69+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781702480807_ngnstyo43', 'usr_1781574295660', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-17T13:21:20.808+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781702561670_ifmr2eihp', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T13:22:41.67+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781702563536_vf09qc1n1', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T13:22:43.536+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781709667302_rmqpjc4yz', 'usr_1781574295660', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-17T15:21:07.303+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781709715994_1advl66fl', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T15:21:55.994+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781709717601_gr5yei60g', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T15:21:57.601+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781711038819_rayfqa3f8', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T15:43:58.82+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781711040444_xn1bz9jah', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T15:44:00.444+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781711299239_42lpxlia4', 'usr_1781574295660', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-17T15:48:19.239+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781724781680_olh94pfwv', 'usr_1781640868777', 'Bemnet', 'USER_LOGIN', 'USER', 'usr_1781640868777', 'Logged in successfully from IP', '2026-06-17T19:33:01.68+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781725199822_bercky7kk', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781725197931', 'Added product: Afri harbal (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-17T19:39:59.822+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781725283095_n8sofudqv', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781725281242', 'Added product: Carrot oil cerem (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-17T19:41:23.095+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781725389483_ovd1mou45', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781725387771', 'Added product: Dove shapoo (Qty: 3, Sold: 0, Pay: CBE Birr)', '2026-06-17T19:43:09.483+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781725470116_6uczjhxf0', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781725467920', 'Added product: Duru shampoo (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-17T19:44:30.116+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781725579590_vyxvfuwp5', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781725577891', 'Added product: Performe condishner (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-17T19:46:19.59+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781725649903_0rxh6ysz9', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781725648117', 'Added product: Perfume shampoo (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-17T19:47:29.903+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781725852215_ir4nxm8vk', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781725850328', 'Added product: Skala expelt conditioner (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-17T19:50:52.215+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781726003721_iycytvqqk', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781726001478', 'Added product: alora conditioner (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-17T19:53:23.721+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781726089022_g6ycepeon', 'usr_1781640868777', 'Bemnet', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781726001478', 'Updated product alora conditioner -> alora conditioner (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-17T19:54:49.022+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781726185485_fnavbclmu', 'usr_1781640868777', 'Bemnet', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 8 filtered stock line items', '2026-06-17T19:56:25.485+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781726230776_o543bs191', 'usr_1781640868777', 'Bemnet', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 8 filtered stock line items', '2026-06-17T19:57:10.776+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781734073623_q8k6evffz', 'usr_1781574295660', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-17T22:07:53.623+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781734129185_lfcpxbubq', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T22:08:49.185+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781734637838_s2tl7sbf5', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781645367010', 'Updated product sharp -> sharp (Qty: 12, Sold: 1, Pay: Telebirr)', '2026-06-17T22:17:17.838+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781734641442_i3pzexek1', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_SALE_RECORD', 'PRODUCT', 'prod_1781645367010', 'Recorded sale: 1 pcs of sharp at unit price ETB 600 via Telebirr on 2026-06-18', '2026-06-17T22:17:21.442+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781734724497_4qdnbtd0i', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T22:18:44.497+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781734737184_qc8w3lrdy', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T22:18:57.184+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781734767938_zlz4qxh28', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 filtered stock line items', '2026-06-17T22:19:27.938+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781736428903_gnemfsmev', 'usr_1781574295660', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-17T22:47:08.903+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781736723702_j69c8s9du', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781645367010', 'Updated product sharp -> sharp (Qty: 12, Sold: 5, Pay: CBE Birr)', '2026-06-17T22:52:03.702+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781736735179_n9z3d2res', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_SALE_RECORD', 'PRODUCT', 'prod_1781645367010', 'Recorded sale: 4 pcs of sharp at unit price ETB 600 via CBE Birr on 2026-06-18', '2026-06-17T22:52:15.179+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781736902944_hlmmgew21', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781736895153', 'Added product: dell laptop (Qty: 10, Sold: 0, Pay: CBE Birr)', '2026-06-17T22:55:02.944+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781740785754_x4kgg8dha', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 2 stock line items', '2026-06-17T23:59:45.754+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781741013544_u9up9zndw', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 3 stock line items', '2026-06-18T00:03:33.544+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781741030301_03a0e0pek', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 3 stock line items', '2026-06-18T00:03:50.301+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781742523358_tevf59ys9', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 3 stock line items', '2026-06-18T00:28:43.358+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781742552492_a8wct6n7b', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 3 stock line items', '2026-06-18T00:29:12.492+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781742981486_uscq3hwpu', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 3 stock line items', '2026-06-18T00:36:21.486+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781743650040_wuz69b8sp', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 3 stock line items', '2026-06-18T00:47:30.04+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781745292340_l0sjr7f88', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 3 stock line items', '2026-06-18T01:14:52.34+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781745351279_rtjmtacmk', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 3 stock line items', '2026-06-18T01:15:51.279+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781745360004_r6qm178s7', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 3 stock line items', '2026-06-18T01:16:00.004+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781745566134_knwqwt6fv', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'INVENTORY_PORTFOLIO', 'Exported printable portfolio having 3 stock line items', '2026-06-18T01:19:26.134+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781746124322_j9dcy0ork', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-18T01:28:44.322+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781747015359_wotmsn9ve', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-18T01:43:35.359+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781747508746_8sn8eywgz', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-18T01:51:48.746+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781748211323_in9t0i4rt', 'usr_1781574295660', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-18T02:03:31.323+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781748263307_5bjrvnkxa', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-18T02:04:23.308+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781748271878_ahdo89s2m', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-18T02:04:31.878+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781748279726_tflqeg3kf', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-18T02:04:39.726+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781748281423_x56qeileu', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-18T02:04:41.423+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781748281750_prgnn4kkc', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-18T02:04:41.75+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781748283630_10z6p615h', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-18T02:04:43.63+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781748306738_qwo6rksf1', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-18T02:05:06.738+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781767319212_jt9wy86f5', 'usr_1781640868777', 'Bemnet', 'USER_LOGIN', 'USER', 'usr_1781640868777', 'Logged in successfully from IP', '2026-06-18T07:21:59.214+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781767452803_ywb7p77ny', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781767450213', 'Added product: Alora shampoo (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-18T07:24:12.803+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781767549323_hz13z3ral', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781767544588', 'Added product: Alora shampoo (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-18T07:25:49.323+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781768185527_v2a1voex1', 'usr_1781640868777', 'Bemnet', 'USER_LOGOUT', 'USER', 'usr_1781640868777', 'Logged out successfully via user interaction', '2026-06-18T07:36:25.527+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781768190957_j96x16mj9', 'usr_1781640868777', 'Bemnet', 'USER_LOGOUT', 'USER', 'usr_1781640868777', 'Logged out successfully via user interaction', '2026-06-18T07:36:30.957+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781768194688_j6lbtwp2f', 'usr_1781640868777', 'Bemnet', 'USER_LOGOUT', 'USER', 'usr_1781640868777', 'Logged out successfully via user interaction', '2026-06-18T07:36:34.688+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781768202406_c3emb9q7o', 'usr_1781640868777', 'Bemnet', 'USER_LOGIN', 'USER', 'usr_1781640868777', 'Logged in successfully from IP', '2026-06-18T07:36:42.406+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781768258759_28enmx5a8', 'usr_1781640868777', 'Bemnet', 'PRODUCT_DELETE', 'PRODUCT', 'prod_1781767544588', 'Deleted product: Alora shampoo', '2026-06-18T07:37:38.759+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781768263382_yub5jzd22', 'usr_1781640868777', 'Bemnet', 'PRODUCT_DELETE', 'PRODUCT', 'prod_1781767544588', 'Deleted product: Alora shampoo', '2026-06-18T07:37:43.382+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781769013443_d3nhxi7y1', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781769011132', 'Added product: Sunsik shaampoo (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-18T07:50:13.443+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781769390429_304q2ymri', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781769387911', 'Added product: Organza shampoo (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-18T07:56:30.429+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781769591952_5kdnl5gn1', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781769589356', 'Added product: Cosmo charcoal (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-18T07:59:51.952+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781770544357_xa9l41kld', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781770542248', 'Added product: V.v love (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-18T08:15:44.357+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781770733263_qrayca5m1', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781770731021', 'Added product: Garnler color (Qty: 4, Sold: 0, Pay: CBE Birr)', '2026-06-18T08:18:53.263+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781770837767_hasaryw12', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781770835110', 'Added product: Papaya (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-18T08:20:37.767+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781771052401_ervn73ppp', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781771049394', 'Added product: Shadow ( fix derma) (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-18T08:24:12.401+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781771490726_vmn9zcj4x', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781771487270', 'Added product: Black water mask (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-18T08:31:30.726+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781771554120_o32p1zft5', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781771552009', 'Added product: Cerave (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-18T08:32:34.12+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781771670986_iqb5ti5ig', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781771668821', 'Added product: Nisa loshn (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-18T08:34:30.986+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781771829284_syiygv8bb', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781771827267', 'Added product: Clere (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-18T08:37:09.284+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781771939924_ug60esw6j', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781771937496', 'Added product: Vaseline loshn (Qty: 3, Sold: 0, Pay: CBE Birr)', '2026-06-18T08:38:59.924+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781772137171_ct8toclbs', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781772133914', 'Added product: Afro chic (Qty: 12, Sold: 0, Pay: CBE Birr)', '2026-06-18T08:42:17.171+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781841830688_xdnccbsxr', 'usr_1781574295660', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-19T04:03:50.688+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781851706901_q8nebawxq', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-19T06:48:26.902+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781851717244_grqa1r7tz', 'usr_1781574295660', 'Mikiyas', 'PDF_REPORT_EXPORT', 'REPORT', 'FINANCIAL_CONSOLIDATED', 'Exported financial consolidated report having 3 filtered stock items', '2026-06-19T06:48:37.245+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781855230218_y8523qshb', 'usr_1781640868777', 'Bemnet', 'USER_LOGIN', 'USER', 'usr_1781640868777', 'Logged in successfully from IP', '2026-06-19T07:47:10.219+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781879995461_30zxdp7oa', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781879991801', 'Added product: clere ትንሹ (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-19T14:39:55.462+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781880114003_0w74oa983', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781880110623', 'Added product: Clere ትልቁ (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-19T14:41:54.003+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781880738980_bhsnqnd0x', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781880735734', 'Added product: college (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-19T14:52:18.98+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781880951265_ebrx0w3bm', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781880947397', 'Added product: doderant (Qty: 5, Sold: 0, Pay: CBE Birr)', '2026-06-19T14:55:51.265+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781881549255_zsuyuta77', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781881545849', 'Added product: Hayaati (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-19T15:05:49.256+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781909945135_55c1yd118', 'usr_1781574295660', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-19T22:59:05.136+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781910258962_6xkeyj05v', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781736895153', 'Updated product dell laptop -> dell laptop (Qty: 10, Sold: 1, Pay: Cash)', '2026-06-19T23:04:18.962+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781910278765_acnxemzn8', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_SALE_RECORD', 'PRODUCT', 'prod_1781736895153', 'Recorded sale: 1 pcs of dell laptop at unit price ETB 1,500 via Cash on 2026-06-20', '2026-06-19T23:04:38.765+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781910351287_58h9dndsr', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781736895153', 'Updated product dell laptop -> dell laptop (Qty: 10, Sold: 2, Pay: CBE Birr)', '2026-06-19T23:05:51.287+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781910370929_hrw6d5t3b', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_SALE_RECORD', 'PRODUCT', 'prod_1781736895153', 'Recorded sale: 1 pcs of dell laptop at unit price ETB 1,500 via CBE Birr on 2026-06-20', '2026-06-19T23:06:10.929+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781912044055_jhlmihlax', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781736895153', 'Updated product dell laptop -> dell laptop (Qty: 10, Sold: 4, Pay: Telebirr)', '2026-06-19T23:34:04.055+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781912064999_foo7x3xie', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_SALE_RECORD', 'PRODUCT', 'prod_1781736895153', 'Recorded sale: 2 pcs of dell laptop at unit price ETB 1,500 via Telebirr on 2026-06-20', '2026-06-19T23:34:24.999+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781936800426_u3i1ka3dy', 'usr_1781640868777', 'Bemnet', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781880947397', 'Updated product doderant -> Louis cardir (Illusion ) (Qty: 4, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:26:40.426+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781937041084_1dum1warp', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781937036489', 'Added product: Royale doderant (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:30:41.084+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781937163651_4pm4gz9bw', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781937160088', 'Added product: Smart collection (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:32:43.651+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781937272365_qbdapmo8x', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781937269698', 'Added product: Island mal tar (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:34:32.365+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781937404032_3kvwarzit', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781937400536', 'Added product: Dear Body (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:36:44.033+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781937538811_ifm9nma21', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781937535716', 'Added product: D₃ White amrij (Qty: 3, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:38:58.811+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781937608932_h6fjydl5g', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781937606230', 'Added product: Sensodne (Qty: 3, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:40:08.932+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781937711798_of8g9nz91', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781937708579', 'Added product: Daabur Herbl (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:41:51.798+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781937780641_e10g4qwhg', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781937776610', 'Added product: Daabur Herbl (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:43:00.641+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781938041002_rrw96omas', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781938034777', 'Added product: Daabur Herbl (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:47:21.002+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781938255632_nk4w58w9i', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781938252563', 'Added product: Daabur Herbl (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:50:55.632+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781938520427_n21obx0pc', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781938515281', 'Added product: Vaseline ትንሹን (Qty: 10, Sold: 0, Pay: CBE Birr)', '2026-06-20T06:55:20.427+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781943828703_ibw0k9djg', 'usr_1781640868777', 'Bemnet', 'USER_LOGIN', 'USER', 'usr_1781640868777', 'Logged in successfully from IP', '2026-06-20T08:23:48.704+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781943961310_zvludbif7', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781943957523', 'Added product: Vaseline ትልቁን (Qty: 3, Sold: 0, Pay: CBE Birr)', '2026-06-20T08:26:01.31+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781944099377_bhxvczxc6', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781944094977', 'Added product: Cocoa better ትልቁ (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-20T08:28:19.377+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781944182340_fjni7lckt', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781944179346', 'Added product: Cocoa better ትንሹን (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-20T08:29:42.34+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781944288913_m8qoe41en', 'usr_1781640868777', 'Bemnet', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781944179346', 'Updated product Cocoa better ትንሹን -> Cocoa better ትንሹን (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-20T08:31:28.913+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781944365930_wnwxhjnb5', 'usr_1781640868777', 'Bemnet', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781944094977', 'Updated product Cocoa better ትልቁ -> Cocoa better ትልቁ (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-20T08:32:45.93+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781944430191_j0h8ids5g', 'usr_1781640868777', 'Bemnet', 'PRODUCT_DELETE', 'PRODUCT', 'prod_1781938034777', 'Deleted product: Daabur Herbl', '2026-06-20T08:33:50.191+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781944545444_vhtf2jlpm', 'usr_1781640868777', 'Bemnet', 'PRODUCT_DELETE', 'PRODUCT', 'prod_1781938252563', 'Deleted product: Daabur Herbl', '2026-06-20T08:35:45.444+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781944831394_iis762g27', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781944825700', 'Added product: Vatika olive (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-20T08:40:31.394+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781944968700_83gulsw7b', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781944964435', 'Added product: Afro Chic Vaseline (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-20T08:42:48.7+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781945109064_hligvhjh2', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781945105646', 'Added product: Just for baby Vaseline (Qty: 1, Sold: 0, Pay: CBE Birr)', '2026-06-20T08:45:09.064+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781945255528_effasnpvk', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781945252041', 'Added product: Vatika Henna (Qty: 6, Sold: 0, Pay: CBE Birr)', '2026-06-20T08:47:35.528+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781945510212_pcrt5v6qv', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781945506344', 'Added product: Halr colouur (cruset) (Qty: 3, Sold: 0, Pay: CBE Birr)', '2026-06-20T08:51:50.212+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781945791056_ralmiazgs', 'usr_1781640868777', 'Bemnet', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781945786427', 'Added product: kojie son (Qty: 2, Sold: 0, Pay: CBE Birr)', '2026-06-20T08:56:31.056+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781965787340_1v63ioy5p', 'usr_1781640868777', 'Bemnet', 'USER_LOGIN', 'USER', 'usr_1781640868777', 'Logged in successfully from IP', '2026-06-20T14:29:47.341+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781968438171_xb6624cpg', 'usr_1781640868777', 'Bemnet', 'USER_LOGIN', 'USER', 'usr_1781640868777', 'Logged in successfully from IP', '2026-06-20T15:13:58.172+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781972594620_88e8u5jpm', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781736895153', 'Updated product dell laptop -> dell laptop (Qty: 10, Sold: 5, Pay: CBE Birr)', '2026-06-20T16:23:14.62+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781972651056_3kh1cn6b7', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_SALE_RECORD', 'PRODUCT', 'prod_1781736895153', 'Recorded sale: 1 pcs of dell laptop at unit price ETB 1,500 via CBE Birr on 2026-06-20', '2026-06-20T16:24:11.056+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781973461619_hjwwnwmfr', 'usr_1781574295660', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-20T16:37:41.619+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781973942061_hco4vt5l7', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781736895153', 'Updated product dell laptop -> dell laptop (Qty: 10, Sold: 4, Pay: Telebirr)', '2026-06-20T16:45:42.062+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781974846466_tdpta97ha', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781736895153', 'Updated product dell laptop -> dell laptop (Qty: 10, Sold: 4, Pay: Telebirr)', '2026-06-20T17:00:46.466+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781982286582_n6vb9dnk1', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_UPDATE', 'PRODUCT', 'prod_1781736895153', 'Updated product dell laptop -> dell laptop (Qty: 10, Sold: 4, Pay: Telebirr)', '2026-06-20T19:04:46.582+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781982795896_2mfdnitcy', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_DELETE', 'PRODUCT', 'prod_1781645367010', 'Deleted product: sharp', '2026-06-20T19:13:15.896+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781982802431_2dkzf87kc', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_DELETE', 'PRODUCT', 'prod_1781645367010', 'Deleted product: sharp', '2026-06-20T19:13:22.431+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781982819621_hx5c6uur1', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_DELETE', 'PRODUCT', 'prod_1781736895153', 'Deleted product: dell laptop', '2026-06-20T19:13:39.621+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781983061273_j0inw4wlh', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781983058504', 'Added product: Chama 1 (Qty: 5, Sold: 0, Pay: CBE Birr)', '2026-06-20T19:17:41.273+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781983308586_xma9wpu4h', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781983305648', 'Added product: Chama 2 (Qty: 10, Sold: 0, Pay: CBE Birr)', '2026-06-20T19:21:48.586+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781983554475_qedf5hap8', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781983550448', 'Added product: Chama 3 (Qty: 3, Sold: 0, Pay: CBE Birr)', '2026-06-20T19:25:54.475+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781987733244_gyynssw0o', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781987681685', 'Added product: chama 1 (Qty: 3, Sold: 0, Pay: CBE Birr)', '2026-06-20T20:35:33.244+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781988003410_tmrt0zqr2', 'usr_1781574295660', 'Mikiyas', 'PRODUCT_CREATE', 'PRODUCT', 'prod_1781987962284', 'Added product: chama 2 (Qty: 5, Sold: 0, Pay: CBE Birr)', '2026-06-20T20:40:03.41+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, metadata, created_at)
VALUES ('log_1781995940533_r1tlvw6hz', 'usr_1781574295660', 'Mikiyas', 'USER_LOGIN', 'USER', 'usr_1781574295660', 'Logged in successfully from IP', '2026-06-20T22:52:20.533+00:00')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id, user_name = EXCLUDED.user_name, action = EXCLUDED.action, entity_type = EXCLUDED.entity_type, entity_id = EXCLUDED.entity_id, metadata = EXCLUDED.metadata, created_at = EXCLUDED.created_at;

-- ============================================================
-- 3. ANALYTICS VIEWS & INTEGRITY CONSTRAINTS
-- ============================================================

-- 3a. SOLD TAB VIEW
CREATE OR REPLACE VIEW v_sold_products AS
SELECT
  id,
  product_name,
  quantity,
  sold_quantity,
  (quantity - sold_quantity)              AS remaining_quantity,
  purchase_date,
  payment_method,
  total_price,
  CASE
    WHEN quantity > 0 THEN ROUND((total_price / quantity)::numeric, 2)
    ELSE 0
  END                                     AS unit_price,
  CASE
    WHEN quantity > 0
      THEN ROUND(((sold_quantity * total_price) / quantity)::numeric, 2)
    ELSE 0
  END                                     AS sold_value,
  product_image,
  created_by,
  created_by_name,
  created_at,
  updated_at
FROM products
WHERE sold_quantity > 0;

-- 3b. UNSOLD TAB VIEW
CREATE OR REPLACE VIEW v_unsold_products AS
SELECT
  id,
  product_name,
  quantity,
  sold_quantity,
  (quantity - sold_quantity)              AS remaining_quantity,
  purchase_date,
  payment_method,
  total_price,
  CASE
    WHEN quantity > 0 THEN ROUND((total_price / quantity)::numeric, 2)
    ELSE 0
  END                                     AS unit_price,
  CASE
    WHEN quantity > 0
      THEN ROUND((((quantity - sold_quantity) * total_price) / quantity)::numeric, 2)
    ELSE 0
  END                                     AS remaining_value,
  product_image,
  created_by,
  created_by_name,
  created_at,
  updated_at
FROM products
WHERE (quantity - sold_quantity) > 0;

-- 3c. FINANCE TAB VIEW — Payment Channel Summary
CREATE OR REPLACE VIEW v_finance_by_payment AS
SELECT
  payment_method,
  COUNT(*)                                                    AS product_count,
  SUM(quantity)                                               AS total_stock_qty,
  SUM(sold_quantity)                                          AS total_sold_qty,
  SUM(quantity - sold_quantity)                               AS total_remaining_qty,
  ROUND(SUM(total_price)::numeric, 2)                        AS total_purchase_value,
  ROUND(SUM(
    CASE WHEN quantity > 0
      THEN (sold_quantity::float / quantity) * total_price
      ELSE 0
    END
  )::numeric, 2)                                              AS total_sold_value,
  ROUND(SUM(
    CASE WHEN quantity > 0
      THEN ((quantity - sold_quantity)::float / quantity) * total_price
      ELSE 0
    END
  )::numeric, 2)                                              AS total_remaining_value
FROM products
GROUP BY payment_method;

-- 3d. ANALYTICS TAB VIEW — Monthly Trend Data
CREATE OR REPLACE VIEW v_monthly_trends AS
SELECT
  TO_CHAR(purchase_date::date, 'Mon YY')  AS month_label,
  DATE_TRUNC('month', purchase_date::date) AS month_start,
  COUNT(*)                                 AS product_count,
  SUM(quantity)                            AS total_qty,
  ROUND(SUM(total_price)::numeric, 2)     AS total_value,
  SUM(sold_quantity)                       AS total_sold_qty,
  ROUND(SUM(
    CASE WHEN quantity > 0
      THEN (sold_quantity::float / quantity) * total_price
      ELSE 0
    END
  )::numeric, 2)                           AS total_sold_value
FROM products
WHERE purchase_date::date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY month_start, TO_CHAR(purchase_date::date, 'Mon YY')
ORDER BY month_start ASC;

-- 3e. DASHBOARD TOTALS VIEW — Main Features Tab KPI Cards
CREATE OR REPLACE VIEW v_dashboard_totals AS
SELECT
  COUNT(*)                                                         AS total_products,
  SUM(quantity)                                                    AS total_inflow_qty,
  SUM(sold_quantity)                                               AS total_sold_qty,
  SUM(quantity - sold_quantity)                                    AS total_unsold_qty,
  ROUND(SUM(total_price)::numeric, 2)                             AS total_inflow_value,
  ROUND(SUM(
    CASE WHEN quantity > 0
      THEN (sold_quantity::float / quantity) * total_price
      ELSE 0
    END
  )::numeric, 2)                                                   AS total_sold_value,
  ROUND(SUM(
    CASE WHEN quantity > 0
      THEN ((quantity - sold_quantity)::float / quantity) * total_price
      ELSE 0
    END
  )::numeric, 2)                                                   AS total_unsold_value,
  CASE
    WHEN SUM(quantity) > 0
      THEN ROUND((SUM(sold_quantity)::float / SUM(quantity) * 100)::numeric, 1)
    ELSE 0
  END                                                              AS sell_through_rate_pct
FROM products;

-- 4. INTEGRITY CONSTRAINT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_sold_lte_quantity'
      AND conrelid = 'products'::regclass
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT chk_sold_lte_quantity
      CHECK (sold_quantity <= quantity);
  END IF;
END
$$;

-- ============================================================
-- 5. VERIFICATION QUERIES
-- ============================================================

-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('users', 'products', 'audit_logs');
-- SELECT table_name FROM information_schema.views WHERE table_schema = 'public';
-- SELECT 'users' AS tbl, COUNT(*) FROM users UNION ALL SELECT 'products' AS tbl, COUNT(*) FROM products UNION ALL SELECT 'audit_logs' AS tbl, COUNT(*) FROM audit_logs;
-- SELECT * FROM v_finance_by_payment;
-- SELECT * FROM v_dashboard_totals;
-- SELECT * FROM v_monthly_trends;
