-- Mosque Management & Ledger Web App - initial schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- users: admin & caretaker accounts (email + password login)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'caretaker')),
  full_name TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

-- ============================================================
-- households: resident accounts (phone + password login)
-- ============================================================
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL UNIQUE,
  address TEXT,
  password_hash TEXT NOT NULL,
  monthly_contribution NUMERIC(10,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(10,2) NOT NULL DEFAULT 0,
  next_due_date DATE,
  notification_prefs JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS households_active_idx ON households (active);
CREATE INDEX IF NOT EXISTS households_balance_idx ON households (current_balance) WHERE current_balance > 0;

-- ============================================================
-- charges: monthly dues levied against a household
-- ============================================================
CREATE TABLE IF NOT EXISTS charges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  charge_date DATE NOT NULL,
  description TEXT NOT NULL DEFAULT 'Monthly contribution',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS charges_household_date_idx ON charges (household_id, charge_date);

-- ============================================================
-- payments: money received from a household
-- ============================================================
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE RESTRICT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  method TEXT NOT NULL CHECK (method IN ('cash', 'bank_transfer', 'online', 'cheque', 'other')),
  notes TEXT,
  previous_balance NUMERIC(10,2) NOT NULL,
  new_balance NUMERIC(10,2) NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payments_household_date_idx ON payments (household_id, payment_date);

-- ============================================================
-- announcements
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('event', 'maintenance', 'fund', 'general')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  publish_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS announcements_active_publish_idx ON announcements (active, publish_at);

-- ============================================================
-- prayer_times
-- ============================================================
CREATE TABLE IF NOT EXISTS prayer_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  fajr TIME NOT NULL,
  zuhr TIME NOT NULL,
  asr TIME NOT NULL,
  maghrib TIME NOT NULL,
  isha TIME NOT NULL,
  notes TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- feedback
-- ============================================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('event', 'maintenance', 'fund', 'general', 'other')),
  message TEXT NOT NULL,
  name TEXT,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback (status);

-- ============================================================
-- reminder_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('bulk', 'selective')),
  message_snapshot TEXT NOT NULL,
  filter_criteria JSONB,
  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS reminder_logs_generated_at_idx ON reminder_logs (generated_at);

CREATE TABLE IF NOT EXISTS reminder_log_households (
  reminder_log_id UUID NOT NULL REFERENCES reminder_logs(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  PRIMARY KEY (reminder_log_id, household_id)
);

-- ============================================================
-- settings (single row)
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mosque_name TEXT NOT NULL DEFAULT 'Mosque',
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  message_templates JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO settings (id, mosque_name, address, phone, email, message_templates)
VALUES (
  1,
  'Masjid Abu Bakr',
  'Effendi Bagh, Sanat Nagar, Srinagar, Jammu and Kashmir 190005',
  '+10000000000',
  'info@example.com',
  '{
    "payment_confirmation": "Assalamu Alaikum {{name}},\n\nWe have received your payment of ₹{{amount}} on {{date}}.\n\nPayment Method: {{method}}\nRemaining Balance: ₹{{balance}}\n\nPlease keep this message for your records.\n\nBaarak Allaahu feekum!\nMosque Management Team",
    "bulk_reminder": "Assalamu Alaikum,\n\nThis is a friendly reminder that your pending mosque contribution of ₹{{amount}} is due.\n\nPlease clear your dues at your earliest convenience.\n\nContact: {{mosquePhone}}\n\nJazakallahu Khairun!",
    "selective_reminder": "Assalamu Alaikum {{name}},\n\nThis is a friendly reminder that your pending mosque contribution of ₹{{amount}} ({{daysOverdue}} days overdue) is due.\n\nPlease clear your dues at your earliest convenience.\n\nContact: {{mosquePhone}}\n\nJazakallahu Khairun!"
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- migration tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS _migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
