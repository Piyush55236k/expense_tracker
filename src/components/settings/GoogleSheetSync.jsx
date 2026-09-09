import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  Smartphone,
  Check,
  QrCode,
  X,
  Layers,
  Zap
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import {
  getGoogleSheetConfig,
  saveGoogleSheetConfig,
  clearGoogleSheetConfig,
  testGoogleSheetConnection,
  generateSyncShareUrl,
  GOOGLE_APPS_SCRIPT_TEMPLATE
} from '../../services/googleSheets';

export default function GoogleSheetSync() {
  const {
    googleSheetStatus,
    googleSheetSyncInfo,
    syncWithGoogleSheet,
    pushLocalToGoogleSheet,
    transactions,
    showToast
  } = useExpense();

  const currentConfig = getGoogleSheetConfig();
  const [sheetUrl, setSheetUrl] = useState(currentConfig.url || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showPairModal, setShowPairModal] = useState(false);
  const [copiedPairUrl, setCopiedPairUrl] = useState(false);

  const handleSave = async () => {
    if (!sheetUrl.trim()) {
      clearGoogleSheetConfig();
      showToast({ type: 'info', title: 'Config Cleared', message: 'Google Sheet URL removed.' });
      return;
    }

    saveGoogleSheetConfig(sheetUrl);
    setTesting(true);
    setTestResult(null);

    const res = await testGoogleSheetConnection(sheetUrl);
    setTesting(false);
    setTestResult(res);

    if (res.success) {
      showToast({
        type: 'success',
        title: 'Connected to Google Sheet Database!',
        message: 'Reading and writing transactions & settings from your spreadsheet.'
      });
      syncWithGoogleSheet({ notify: true });
    } else {
      showToast({
        type: 'error',
        title: 'Connection Failed',
        message: res.message
      });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testGoogleSheetConnection(sheetUrl);
    setTesting(false);
    setTestResult(res);
  };

  const copyScriptToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
      setCopiedScript(true);
      showToast({
        type: 'success',
        title: 'V2 Database Script Copied!',
        message: 'Paste it in Google Sheets > Extensions > Apps Script and Deploy as Web App.'
      });
      setTimeout(() => setCopiedScript(false), 3000);
    } catch (err) {
      console.error('Copy error:', err);
      showToast({ type: 'error', title: 'Copy Failed', message: 'Please copy the script manually below.' });
    }
  };

  const pairUrl = generateSyncShareUrl(sheetUrl);

  const copyPairUrlToClipboard = async () => {
    if (!pairUrl) return;
    try {
      await navigator.clipboard.writeText(pairUrl);
      setCopiedPairUrl(true);
      showToast({
        type: 'success',
        title: 'Pairing Link Copied!',
        message: 'Send it to your phone or someone else via WhatsApp or email.'
      });
      setTimeout(() => setCopiedPairUrl(false), 3000);
    } catch (err) {
      console.error('Error copying pair URL:', err);
    }
  };

  const pendingCount = googleSheetSyncInfo?.pendingCount || 0;
  const lastSynced = googleSheetSyncInfo?.lastSyncedAt
    ? new Date(googleSheetSyncInfo.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-income)'
            }}
          >
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Google Spreadsheet Database
              </h3>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: 'var(--color-primary-light)',
                  fontWeight: 700
                }}
              >
                Transactions + Settings
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Read & write transactions and all preferences directly to your Google Spreadsheet with zero latency.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {pendingCount > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(234, 179, 8, 0.15)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#eab308'
              }}
            >
              <RefreshCw size={12} className="animate-spin" />
              <span>Queue: {pendingCount} writing...</span>
            </span>
          )}

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: googleSheetStatus === 'connected' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-input)',
              border: `1px solid ${googleSheetStatus === 'connected' ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-card)'}`,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: googleSheetStatus === 'connected' ? 'var(--color-income)' : 'var(--text-dim)'
            }}
          >
            {googleSheetStatus === 'connected' ? (
              <>
                <CheckCircle2 size={13} color="var(--color-income)" />
                <span>Connected & Database Active</span>
              </>
            ) : googleSheetStatus === 'syncing' ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Syncing Database...</span>
              </>
            ) : googleSheetStatus === 'error' ? (
              <>
                <AlertCircle size={13} color="var(--color-expense)" />
                <span style={{ color: 'var(--color-expense)' }}>Sync Error</span>
              </>
            ) : (
              <>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--text-dim)' }} />
                <span>Not Connected</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Latency Reducer Feature Callout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}
      >
        <Zap size={15} color="var(--color-primary-light)" style={{ flexShrink: 0 }} />
        <span>
          <strong style={{ color: 'var(--color-primary-light)' }}>Instant Zero-Lag Performance:</strong> All additions, edits, deletes, and settings changes update the UI in <strong>0ms</strong> immediately, while synchronization with your Google Sheet happens smoothly in the background.
        </span>
      </div>

      {/* URL Input Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div className="input-group">
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Google Apps Script Web App Deployment URL</span>
            {currentConfig.source === 'env' && (
              <span style={{ color: 'var(--color-primary-light)', fontSize: '0.72rem' }}>Configured via .env</span>
            )}
          </label>
          <input
            type="url"
            value={sheetUrl}
            onChange={e => setSheetUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="form-input"
            style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
          />
        </div>

        {/* Buttons Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={testing}
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem' }}
          >
            {testing ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
            <span>Save & Connect DB</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleTest}
            disabled={testing || !sheetUrl.trim()}
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          >
            {testing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            <span>Test Connection</span>
          </button>

          {/* Pair Mobile / Share Button */}
          {sheetUrl.trim() && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowPairModal(true)}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                gap: '6px',
                color: 'var(--color-primary-light)',
                borderColor: 'var(--color-primary-light)'
              }}
              title="Pair with Mobile Phone or share with someone"
            >
              <Smartphone size={15} />
              <span>Sync to Mobile</span>
            </button>
          )}

          {googleSheetStatus === 'connected' && (
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={pushLocalToGoogleSheet}
                title="Write all local transactions and settings to your Google Spreadsheet"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', gap: '5px' }}
              >
                <UploadCloud size={14} />
                <span>Upload Database ({transactions.length} txs)</span>
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => syncWithGoogleSheet({ notify: true })}
                title="Fetch latest transactions and settings from your Google Spreadsheet"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', gap: '5px' }}
              >
                <DownloadCloud size={14} />
                <span>Fetch Latest DB</span>
              </button>
            </>
          )}
        </div>

        {/* Sync Info / Last Synced Timestamp */}
        {lastSynced && (
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            Last synchronized with Google Sheet at: <strong>{lastSynced}</strong>
          </div>
        )}

        {/* Connection Test Result */}
        {testResult && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: testResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              fontSize: '0.82rem',
              color: testResult.success ? 'var(--color-income)' : 'var(--color-expense)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {testResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>
              {testResult.message}
              {testResult.count !== undefined && ` (${testResult.count} transactions in sheet)`}
            </span>
          </div>
        )}
      </div>

      {/* 1-Minute Setup Guide */}
      <div
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={16} color="var(--color-primary-light)" />
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
              Setup Guide: Full Google Sheet Database (v2.0)
            </span>
          </div>
          <button
            type="button"
            onClick={copyScriptToClipboard}
            className="btn btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '4px' }}
          >
            {copiedScript ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedScript ? 'Copied v2.0 Script!' : 'Copy Apps Script Code'}</span>
          </button>
        </div>

        <ol style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
          <li>
            Open or create a Google Sheet at{' '}
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--color-primary-light)', textDecoration: 'underline' }}
            >
              sheets.new <ExternalLink size={11} style={{ display: 'inline' }} />
            </a>
          </li>
          <li>In the top menu bar, click <strong>Extensions &gt; Apps Script</strong>.</li>
          <li>Delete any existing code in the editor, and click <strong>Copy Apps Script Code</strong> above to paste.</li>
          <li>Click <strong>Deploy &gt; New deployment</strong> (blue button, top right).</li>
          <li>Click the gear icon next to "Select type" &gt; choose <strong>Web app</strong>.</li>
          <li>Set Description: "Expense Tracker Database", <em>Execute as: "Me"</em>, and <em>Who has access: "Anyone"</em>.</li>
          <li>Click <strong>Deploy</strong>, grant Google permissions, and paste the <strong>Web app URL</strong> above!</li>
        </ol>

        <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          💡 <strong>What gets created in your spreadsheet:</strong> The script will automatically maintain two neat tabs: <strong>Transactions</strong> (all income & expense entries) and <strong>Settings</strong> (currency, monthly budget, alert thresholds, categories, and theme).
        </div>

        {/* Mobile Sync Tip */}
        <div
          style={{
            marginTop: '0.85rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.65rem',
            fontSize: '0.78rem',
            color: 'var(--text-dim)',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={16} color="var(--color-primary-light)" style={{ flexShrink: 0 }} />
            <span>
              <strong>Multi-Device Zero-Login:</strong> Open <strong>Sync to Mobile</strong> to scan the QR code or send a 1-click link to your phone!
            </span>
          </div>

          {sheetUrl.trim() && (
            <button
              onClick={() => setShowPairModal(true)}
              className="btn btn-ghost"
              style={{ fontSize: '0.78rem', padding: '2px 6px', color: 'var(--color-primary-light)' }}
            >
              Open Mobile QR Code →
            </button>
          )}
        </div>
      </div>

      {/* Mobile Pairing & Share Modal */}
      {showPairModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowPairModal(false)}
        >
          <div
            className="glass-card animate-scale-in"
            style={{
              maxWidth: '440px',
              width: '100%',
              padding: '1.5rem',
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-card)',
              textAlign: 'center'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <QrCode size={20} color="var(--color-primary-light)" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', textAlign: 'left' }}>
                  Sync Mobile & Laptop
                </h3>
              </div>
              <button onClick={() => setShowPairModal(false)} className="btn-icon" style={{ width: '30px', height: '30px' }}>
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5, textAlign: 'left' }}>
              Scan this QR code with your phone camera, or send the 1-click link. Your phone will instantly connect to this exact Google Sheet database without needing any login!
            </p>

            {/* QR Code Container */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                background: '#ffffff',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '1.25rem'
              }}
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pairUrl)}`}
                alt="Mobile Pairing QR Code"
                width={180}
                height={180}
                style={{ display: 'block' }}
              />
            </div>

            {/* Copy Pairing Link Button */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={copyPairUrlToClipboard}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.6rem', gap: '6px' }}
              >
                {copiedPairUrl ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedPairUrl ? 'Link Copied to Clipboard!' : 'Copy 1-Click Mobile Pairing Link'}</span>
              </button>

              <p style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Both devices will read and write to the same spreadsheet database in real time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
