/**
 * Supabase Service - Real-Time Multi-Device Cloud Synchronization
 * Connects PostgreSQL to sync Phone and Desktop instances seamlessly.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'personal_expense_tracker_supabase_config';

/**
 * Get Supabase credentials from localStorage or Vite environment variables
 */
export function getSupabaseConfig() {
  try {
    const stored = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.url && parsed.key) {
        return {
          url: parsed.url.trim(),
          key: parsed.key.trim(),
          source: 'settings'
        };
      }
    }
  } catch (e) {
    console.error('Error reading supabase config from storage:', e);
  }

  const envUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_UR ||
    import.meta.env.VITE_SUPABASE_URI;

  const envKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KE ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_SUPABASE_KEY;

  if (envUrl && envKey && String(envUrl).trim() !== '' && String(envKey).trim() !== '') {
    return {
      url: String(envUrl).trim(),
      key: String(envKey).trim(),
      source: 'env'
    };
  }

  return { url: '', key: '', source: 'none' };
}

/**
 * Save Supabase credentials to localStorage
 */
export function saveSupabaseConfig(url, key) {
  try {
    localStorage.setItem(
      SUPABASE_CONFIG_KEY,
      JSON.stringify({ url: url.trim(), key: key.trim() })
    );
    // Reset cached client
    supabaseClientInstance = null;
    return true;
  } catch (e) {
    console.error('Error saving supabase config:', e);
    return false;
  }
}

/**
 * Clear Supabase credentials
 */
export function clearSupabaseConfig() {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
  supabaseClientInstance = null;
}

/**
 * Check if Supabase credentials are configured
 */
export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.key);
}

// Cached client instance
let supabaseClientInstance = null;

/**
 * Get or create Supabase client instance
 */
export function getSupabaseClient() {
  if (supabaseClientInstance) return supabaseClientInstance;

  const config = getSupabaseConfig();
  if (!config.url || !config.key) return null;

  try {
    supabaseClientInstance = createClient(config.url, config.key, {
      auth: { persistSession: false },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    return supabaseClientInstance;
  } catch (e) {
    console.error('Error initializing Supabase client:', e);
    return null;
  }
}

/**
 * Transform DB row (snake_case) to App Model (camelCase)
 */
export function formatFromSupabase(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    amount: Number(row.amount) || 0,
    category: row.category,
    paymentMode: row.payment_mode || 'Cash',
    date: row.date ? String(row.date) : new Date().toISOString().split('T')[0],
    time: row.time || '',
    notes: row.notes || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    isRecurring: Boolean(row.is_recurring),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString()
  };
}

/**
 * Transform App Model (camelCase) to DB row (snake_case)
 */
export function formatForSupabase(tx) {
  return {
    id: tx.id,
    type: tx.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
    amount: Math.abs(Number(tx.amount) || 0),
    category: tx.category || 'Other / Misc',
    payment_mode: tx.paymentMode || 'Cash',
    date: tx.date || new Date().toISOString().split('T')[0],
    time: tx.time || '',
    notes: tx.notes || '',
    tags: Array.isArray(tx.tags) ? tx.tags : (tx.tags ? [tx.tags] : []),
    is_recurring: Boolean(tx.isRecurring),
    created_at: tx.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Test Connection to Supabase database
 */
export async function testSupabaseConnection(customUrl, customKey) {
  let client;
  if (customUrl && customKey) {
    client = createClient(customUrl.trim(), customKey.trim(), { auth: { persistSession: false } });
  } else {
    client = getSupabaseClient();
  }

  if (!client) {
    return { success: false, message: 'Supabase URL and API Key are required.' };
  }

  try {
    const { error, count } = await client
      .from('transactions')
      .select('id', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          code: 'TABLE_MISSING',
          message: 'Connected to Supabase, but the "transactions" table has not been created yet. Please run the SQL schema in your Supabase SQL Editor.'
        };
      }
      return { success: false, message: error.message || 'Failed to query database.' };
    }

    return {
      success: true,
      message: 'Connection successful! Real-time synchronization active.',
      count: count || 0
    };
  } catch (err) {
    return { success: false, message: err.message || 'Network error connecting to Supabase.' };
  }
}

/**
 * Fetch all transactions from Supabase
 */
export async function fetchSupabaseTransactions() {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(formatFromSupabase);
  } catch (err) {
    console.error('Error fetching transactions from Supabase:', err);
    throw err;
  }
}

/**
 * Insert a transaction to Supabase
 */
export async function insertSupabaseTransaction(tx) {
  const client = getSupabaseClient();
  if (!client) return null;

  const row = formatForSupabase(tx);
  const { data, error } = await client
    .from('transactions')
    .insert([row])
    .select()
    .single();

  if (error) throw error;
  return formatFromSupabase(data);
}

/**
 * Update an existing transaction in Supabase
 */
export async function updateSupabaseTransaction(tx) {
  const client = getSupabaseClient();
  if (!client) return null;

  const row = formatForSupabase(tx);
  const { data, error } = await client
    .from('transactions')
    .update(row)
    .eq('id', tx.id)
    .select()
    .single();

  if (error) throw error;
  return formatFromSupabase(data);
}

/**
 * Delete a transaction from Supabase
 */
export async function deleteSupabaseTransaction(id) {
  const client = getSupabaseClient();
  if (!client) return null;

  const { error } = await client
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Bulk delete transactions from Supabase
 */
export async function deleteMultipleSupabaseTransactions(ids) {
  const client = getSupabaseClient();
  if (!client || !ids || ids.length === 0) return null;

  const { error } = await client
    .from('transactions')
    .delete()
    .in('id', ids);

  if (error) throw error;
  return true;
}

/**
 * Sync all local transactions to Supabase (Upsert)
 */
export async function syncAllLocalToSupabase(localTransactions = []) {
  const client = getSupabaseClient();
  if (!client || localTransactions.length === 0) return null;

  const rows = localTransactions.map(formatForSupabase);
  const { error } = await client
    .from('transactions')
    .upsert(rows, { onConflict: 'id' });

  if (error) throw error;
  return true;
}

/**
 * Subscribe to real-time changes on the transactions table
 */
export function subscribeToSupabaseRealtime(onInsert, onUpdate, onDelete) {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const channel = client
    .channel('realtime_transactions_sync')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transactions' },
      (payload) => {
        if (onInsert && payload.new) {
          onInsert(formatFromSupabase(payload.new));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'transactions' },
      (payload) => {
        if (onUpdate && payload.new) {
          onUpdate(formatFromSupabase(payload.new));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'transactions' },
      (payload) => {
        if (onDelete && payload.old) {
          onDelete(payload.old.id);
        }
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}
