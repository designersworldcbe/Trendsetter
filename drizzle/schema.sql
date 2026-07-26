-- Trendsetter Database Schema for Cloudflare D1 (SQLite)
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    email_verified INTEGER DEFAULT 0,
    password TEXT,
    name TEXT,
    image TEXT,
    phone TEXT,
    phone_verified INTEGER DEFAULT 0,
    organization_id TEXT,
    role TEXT DEFAULT 'USER',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Accounts (OAuth providers)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(provider, provider_account_id)
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    expires TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Organizations (Multi-tenancy)
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    website TEXT,
    phone TEXT,
    address TEXT,
    plan TEXT DEFAULT 'FREE',
    paypal_id TEXT,
    owner_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Machines database
CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    hourly_rate REAL NOT NULL,
    setup_cost REAL NOT NULL,
    tooling_cost_rate REAL DEFAULT 0,
    material_removal_rate REAL,
    power_consumption REAL,
    accuracy TEXT,
    work_envelope_x REAL,
    work_envelope_y REAL,
    work_envelope_z REAL,
    spindle_speed_min INTEGER,
    spindle_speed_max INTEGER,
    efficiency_factor REAL DEFAULT 0.85,
    is_active INTEGER DEFAULT 1,
    organization_id TEXT NOT NULL,
    created_by_id TEXT NOT NULL,
    machine_image TEXT,
    specs TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Calculations
CREATE TABLE IF NOT EXISTS calculations (
    id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    model_image_url TEXT,
    multi_view_images TEXT,
    volume REAL,
    surface_area REAL,
    bounding_box TEXT,
    stock_type TEXT DEFAULT 'CALCULATED',
    stock_file_url TEXT,
    stock_material TEXT,
    stock_dimensions TEXT,
    recognized_features TEXT NOT NULL,
    material_cost REAL DEFAULT 0,
    machining_cost REAL DEFAULT 0,
    secondary_cost REAL DEFAULT 0,
    tooling_cost REAL DEFAULT 0,
    subtotal REAL DEFAULT 0,
    overhead_percent REAL DEFAULT 15,
    overhead_amount REAL DEFAULT 0,
    profit_percent REAL DEFAULT 10,
    profit_amount REAL DEFAULT 0,
    total_cost REAL DEFAULT 0,
    status TEXT DEFAULT 'PENDING',
    organization_id TEXT NOT NULL,
    created_by_id TEXT NOT NULL,
    quote_number TEXT,
    customer_name TEXT,
    customer_email TEXT,
    valid_until TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Operations (per calculation)
CREATE TABLE IF NOT EXISTS operations (
    id TEXT PRIMARY KEY,
    feature_id TEXT,
    feature_type TEXT NOT NULL,
    feature_params TEXT,
    machine_id TEXT,
    setup_time INTEGER DEFAULT 0,
    machining_time INTEGER DEFAULT 0,
    tool_change_time INTEGER DEFAULT 0,
    total_time INTEGER DEFAULT 0,
    setup_cost REAL DEFAULT 0,
    machining_cost REAL DEFAULT 0,
    tooling_cost REAL DEFAULT 0,
    total_cost REAL DEFAULT 0,
    setup_group INTEGER DEFAULT 1,
    sequence INTEGER DEFAULT 1,
    calculation_id TEXT NOT NULL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (calculation_id) REFERENCES calculations(id) ON DELETE CASCADE
);

-- Secondary processes
CREATE TABLE IF NOT EXISTS secondary_processes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    unit_price REAL NOT NULL,
    price_unit TEXT DEFAULT 'PER_PIECE',
    min_quantity INTEGER DEFAULT 1,
    per_unit_weight REAL,
    applies_to TEXT,
    surface_area_factor INTEGER DEFAULT 0,
    weight_factor INTEGER DEFAULT 0,
    organization_id TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Markup settings
CREATE TABLE IF NOT EXISTS markup_settings (
    id TEXT PRIMARY KEY,
    overhead_percent REAL DEFAULT 15,
    profit_percent REAL DEFAULT 10,
    sales_percent REAL DEFAULT 5,
    quick_quote_adjustment REAL DEFAULT 0,
    organization_id TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Materials
CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    grade TEXT,
    density REAL NOT NULL,
    cost_per_kg REAL NOT NULL,
    hardness TEXT,
    machinability_rating REAL,
    tool_wear_factor REAL DEFAULT 1.0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    plan TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    paypal_subscription_id TEXT,
    paypal_customer_id TEXT,
    max_calculations INTEGER DEFAULT 10,
    max_machines INTEGER DEFAULT 5,
    max_users INTEGER DEFAULT 2,
    current_period_start TEXT,
    current_period_end TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Machine templates
CREATE TABLE IF NOT EXISTS machine_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    default_hourly_rate REAL NOT NULL,
    default_setup_cost REAL NOT NULL,
    default_tooling_cost_rate REAL DEFAULT 0,
    default_mrr REAL,
    default_efficiency REAL DEFAULT 0.85,
    organization_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_org ON calculations(organization_id);
CREATE INDEX IF NOT EXISTS idx_calculations_status ON calculations(status);
CREATE INDEX IF NOT EXISTS idx_calculations_created ON calculations(created_at);
CREATE INDEX IF NOT EXISTS idx_machines_org ON machines(organization_id);
CREATE INDEX IF NOT EXISTS idx_machines_active ON machines(is_active);
CREATE INDEX IF NOT EXISTS idx_operations_calc ON operations(calculation_id);
CREATE INDEX IF NOT EXISTS idx_secondary_org ON secondary_processes(organization_id);

-- ============================================================
-- DEFAULT DATA
-- ============================================================

-- Default materials
INSERT INTO materials (id, name, category, density, cost_per_kg, machinability_rating) VALUES
    (lower(hex(randomblob(16))), 'Mild Steel', 'STEEL', 0.00785, 80, 70),
    (lower(hex(randomblob(16))), 'Aluminum 6061', 'ALUMINUM', 0.00270, 250, 90),
    (lower(hex(randomblob(16))), 'Stainless Steel 304', 'STAINLESS_STEEL', 0.00800, 180, 55),
    (lower(hex(randomblob(16))), 'Cast Iron', 'CAST_IRON', 0.00720, 60, 50),
    (lower(hex(randomblob(16))), 'Brass', 'BRASS', 0.00850, 450, 85),
    (lower(hex(randomblob(16))), 'Nylon', 'PLASTIC', 0.00115, 300, 75)
ON CONFLICT DO NOTHING;

-- Default machine templates
INSERT INTO machine_templates (id, name, type, description, default_hourly_rate, default_setup_cost, default_tooling_cost_rate, default_mrr, default_efficiency) VALUES
    (lower(hex(randomblob(16))), 'Standard VMC', 'VMC', 'Vertical Machining Center - 3 Axis', 800, 4000, 2.5, 20, 0.85),
    (lower(hex(randomblob(16))), 'CNC Lathe', 'CNC_TURNING', 'CNC Turning Center', 600, 3000, 1.8, 15, 0.80),
    (lower(hex(randomblob(16))), 'HMC', 'HMC', 'Horizontal Machining Center', 1200, 6000, 3.5, 25, 0.90),
    (lower(hex(randomblob(16))), '5-Axis Mill', 'CNC_MILLING_5AXIS', '5-Axis CNC Milling Machine', 2000, 10000, 5.0, 18, 0.75)
ON CONFLICT DO NOTHING;
