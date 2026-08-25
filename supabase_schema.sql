-- ==============================================================================
-- PERSONAL EXPENSE TRACKER - SUPABASE DATABASE SCHEMA
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New query)
-- ==============================================================================

-- 1. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('EXPENSE', 'INCOME')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    category TEXT NOT NULL,
    payment_mode TEXT NOT NULL DEFAULT 'Cash',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TEXT,
    notes TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Indexes for High Performance Querying & Sorting
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);

-- 3. Create Settings Table for App Preferences Sync
CREATE TABLE IF NOT EXISTS public.user_settings (
    id TEXT PRIMARY KEY DEFAULT 'default_settings',
    settings_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 5. Create Permissive Policies for Single User / Anon Key Access
DROP POLICY IF EXISTS "Allow public anonymous access to transactions" ON public.transactions;
CREATE POLICY "Allow public anonymous access to transactions"
    ON public.transactions
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public anonymous access to user_settings" ON public.user_settings;
CREATE POLICY "Allow public anonymous access to user_settings"
    ON public.user_settings
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 6. Enable Realtime Sync (Instant live sync between Phone and Desktop)
BEGIN;
  -- Add table to publication if not already included
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.transactions, public.user_settings;
COMMIT;
