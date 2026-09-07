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
  X
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
        title: 'Connected to Google Sheet!',
        message: 'Mobile and laptop can now sync entries without login.'
      });
      syncWithGoogleSheet();
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
        title: 'Script Copied!',
        message: 'Paste it in Google Sheets > Extensions > Apps Script.'
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

  return (
    <div className="glass-card" style={{ padding: '1.5rem', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-income)'
            }}
          >
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Google Spreadsheet Database (Zero Login)
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Sync Mobile phone and Laptop seamlessly to a single Google Sheet without requiring any account login.
            </p>
          </div>
        </div>

        {/* Status Badge */}
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
              <span>Connected & Synchronized</span>
            </>
          ) : googleSheetStatus === 'syncing' ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Syncing Data...</span>
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

      {/* URL Input Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div className="input-group">
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Google Apps Script Web App URL</span>
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
            <span>Save & Connect</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleTest}
            disabled={testing || !sheetUrl.trim()}
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          >
            {testing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            <span>Test Ping</span>
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
                title="Upload all local transactions to your Google Sheet"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', gap: '5px' }}
              >
                <UploadCloud size={14} />
                <span>Upload ({transactions.length})</span>
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={syncWithGoogleSheet}
                title="Pull latest transactions from Google Sheet"
                style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', gap: '5px' }}
              >
                <DownloadCloud size={14} />
                <span>Fetch Latest</span>
              </button>
            </>
          )}
        </div>

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
            <span>{testResult.message}</span>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
            Setup Guide: Free Google Sheet DB in 1 Minute
          </span>
          <button
            type="button"
            onClick={copyScriptToClipboard}
            className="btn btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', gap: '4px' }}
          >
            {copiedScript ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedScript ? 'Copied Script!' : 'Copy Apps Script Code'}</span>
          </button>
        </div>

        <ol style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
          <li>
            Create a new Google Sheet at{' '}
            <a
              href="https://sheets.new"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--color-primary-light)', textDecoration: 'underline' }}
            >
              sheets.new <ExternalLink size={11} style={{ display: 'inline' }} />
            </a>
          </li>
          <li>In the menu bar, click <strong>Extensions &gt; Apps Script</strong>.</li>
          <li>Delete any code in the editor, and click <strong>Copy Apps Script Code</strong> above to paste the script.</li>
          <li>Click <strong>Deploy &gt; New deployment</strong> (top right).</li>
          <li>Select type: <strong>Web app</strong>, set <em>Execute as: "Me"</em> and <em>Who has access: "Anyone"</em>.</li>
          <li>Click <strong>Deploy</strong> and copy the <strong>Web app URL</strong> into the field above!</li>
        </ol>

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
              <strong>Mobile & Laptop Sync:</strong> Click <strong>Sync to Mobile</strong> above to scan the QR code or share a 1-click link!
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
              Open your phone camera to scan this QR code, or send the 1-click pairing link via WhatsApp. Your mobile phone will automatically connect to this exact Google Sheet!
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
                Zero login required. Both devices will read and record to the same sheet in real time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
