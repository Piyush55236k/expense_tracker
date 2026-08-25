import React, { useState } from 'react';
import {
  Cloud,
  RefreshCw,
  Copy,
  Check,
  Code2,
  Database,
  Smartphone,
  Laptop,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection
} from '../../services/supabase';

const SCHEMA_SQL = `-- 1. Create Transactions Table
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

-- 2. Create Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- 3. Enable RLS and Permissive Anon Policy
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public anonymous access to transactions" ON public.transactions;
CREATE POLICY "Allow public anonymous access to transactions"
    ON public.transactions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 4. Enable Realtime Replication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.transactions;
COMMIT;`;

export default function SupabaseSync() {
  const { syncWithSupabase, supabaseStatus, pushLocalToSupabase, showToast } = useExpense();
  
  const currentConfig = getSupabaseConfig();
  const isEnvConfigured = currentConfig.source === 'env';
  
  const [url, setUrl] = useState(isEnvConfigured ? '' : (currentConfig.url || ''));
  const [key, setKey] = useState(isEnvConfigured ? '' : (currentConfig.key || ''));
  const [showKey, setShowKey] = useState(false);
  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  const handleSaveAndConnect = async (e) => {
    e?.preventDefault();
    if (!url.trim() || !key.trim()) {
      showToast({ type: 'warning', title: 'Missing Fields', message: 'Please enter both Supabase URL and Publishable/Anon Key.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    saveSupabaseConfig(url.trim(), key.trim());
    const result = await testSupabaseConnection(url.trim(), key.trim());
    setIsTesting(false);
    setTestResult(result);

    if (result.success) {
      showToast({ type: 'success', title: 'Cloud Connected!', message: 'Supabase real-time sync is now active.' });
      setIsEditingCustom(false);
      syncWithSupabase();
    } else {
      showToast({ type: 'error', title: 'Connection Failed', message: result.message });
    }
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setKey('');
    setTestResult(null);
    setIsEditingCustom(false);
    showToast({ type: 'info', title: 'Disconnected', message: 'Custom Supabase credentials cleared.' });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
    showToast({ type: 'info', title: 'SQL Copied', message: 'Schema script copied to clipboard.' });
  };

  const handleManualSync = async () => {
    setIsSyncingNow(true);
    await syncWithSupabase();
    setIsSyncingNow(false);
  };

  const handlePushLocal = async () => {
    setIsSyncingNow(true);
    await pushLocalToSupabase();
    setIsSyncingNow(false);
  };

  const isConfigured = Boolean(currentConfig.url && currentConfig.key);

  // Masked helper
  const maskUrl = (rawUrl) => {
    if (!rawUrl) return '';
    try {
      const u = new URL(rawUrl);
      const hostParts = u.hostname.split('.');
      if (hostParts.length > 0) {
        return `https://${hostParts[0].slice(0, 5)}••••.${hostParts.slice(1).join('.')}`;
      }
    } catch {
      return 'https://••••••••••••.supabase.co';
    }
    return 'https://••••••••••••.supabase.co';
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: supabaseStatus === 'connected' ? 'var(--color-income-subtle)' : 'var(--color-primary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: supabaseStatus === 'connected' ? 'var(--color-income)' : 'var(--color-primary-light)'
            }}
          >
            <Cloud size={20} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Phone & Desktop Live Cloud Sync
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Real-time multi-device database sync powered by Supabase (PostgreSQL).
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {supabaseStatus === 'connected' ? (
            <span className="badge badge-income" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-income)', animation: 'pulseGlow 2s infinite' }} />
              Live Sync Active
            </span>
          ) : supabaseStatus === 'syncing' ? (
            <span className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '6px' }}>
              <RefreshCw size={12} className="animate-spin" />
              Syncing...
            </span>
          ) : (
            <span className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              Offline / Local Only
            </span>
          )}
        </div>
      </div>

      {/* Multi-Device Highlight Banner */}
      <div
        style={{
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-card)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary-light)' }}>
            <Smartphone size={18} />
            <span>+</span>
            <Laptop size={18} />
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Changes made on your <strong>Phone</strong> appear on your <strong>Desktop</strong> in real-time.
          </span>
        </div>

        {isConfigured && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-outline"
              onClick={handleManualSync}
              disabled={isSyncingNow}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              <RefreshCw size={13} className={isSyncingNow ? 'animate-spin' : ''} />
              Sync Now
            </button>
            <button
              className="btn btn-ghost"
              onClick={handlePushLocal}
              disabled={isSyncingNow}
              style={{ padding: '4px 10px', fontSize: '0.78rem', color: 'var(--color-primary-light)' }}
              title="Upload any local records to Supabase"
            >
              Upload Local Records
            </button>
          </div>
        )}
      </div>

      {/* Secure Connection Details View (When Configured via .env or Saved) */}
      {isConfigured && !isEditingCustom ? (
        <div
          style={{
            padding: '1.1rem',
            borderRadius: 'var(--radius-lg)',
            background: 'rgba(16, 185, 129, 0.05)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} color="var(--color-income)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {isEnvConfigured ? 'Secured via System Environment (.env)' : 'Secured via Browser Storage'}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Credentials Protected & Masked
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
            <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>PROJECT ENDPOINT</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{maskUrl(currentConfig.url)}</span>
            </div>
            <div style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>PUBLISHABLE KEY</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>••••••••••••••••••••••••••••</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowSqlGuide(prev => !prev)}
              style={{ fontSize: '0.78rem', padding: '4px 6px', color: 'var(--color-primary-light)' }}
            >
              <Code2 size={15} />
              {showSqlGuide ? 'Hide SQL Schema' : 'View SQL Schema'}
            </button>

            {!isEnvConfigured && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsEditingCustom(true)}
                style={{ fontSize: '0.78rem', padding: '4px 8px' }}
              >
                Change Key
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Form for entering keys if not in .env */
        <form onSubmit={handleSaveAndConnect} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Supabase Project URL</label>
            <input
              type="url"
              placeholder="https://your-project-id.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>Supabase Publishable / Anon Key</label>
              <button
                type="button"
                onClick={() => setShowKey(prev => !prev)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="sb_publishable_... or eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="form-input"
              required
            />
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: testResult.success ? 'var(--color-income-subtle)' : 'var(--color-expense-subtle)',
                border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                color: testResult.success ? 'var(--color-income)' : 'var(--color-expense)',
                fontSize: '0.85rem',
                lineHeight: 1.5
              }}
            >
              {testResult.message}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowSqlGuide(prev => !prev)}
              style={{ fontSize: '0.82rem', padding: '6px 8px', color: 'var(--color-primary-light)' }}
            >
              <Code2 size={16} />
              {showSqlGuide ? 'Hide SQL Setup Guide' : 'View SQL Setup Guide'}
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isConfigured && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleDisconnect}
                  style={{ color: 'var(--color-expense)' }}
                >
                  Disconnect
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save & Connect
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* SQL Setup Drawer */}
      {showSqlGuide && (
        <div
          className="animate-scale-in"
          style={{
            marginTop: '1.25rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={16} color="var(--color-primary-light)" />
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Step 1: Run SQL in Supabase SQL Editor
              </span>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleCopySql}
              style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            >
              {copiedSql ? <Check size={14} /> : <Copy size={14} />}
              {copiedSql ? 'Copied!' : 'Copy SQL Schema'}
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            Go to your <strong>Supabase Dashboard &gt; SQL Editor &gt; New query</strong>, paste the script below, and click <strong>Run</strong>.
          </p>

          <pre
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: '#090d16',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: '#93c5fd',
              overflowX: 'auto',
              maxHeight: '200px',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {SCHEMA_SQL}
          </pre>
        </div>
      )}
    </div>
  );
}
