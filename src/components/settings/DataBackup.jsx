import React, { useRef } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Trash2,
  Database,
  Sparkles
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

export default function DataBackup() {
  const {
    exportCSV,
    exportJSONBackup,
    importJSONBackup,
    loadDemo,
    wipeAllData,
    openConfirmDialog,
    transactions
  } = useExpense();

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        importJSONBackup(content, 'replace');
      } catch (err) {
        console.error('File parsing error:', err);
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleWipe = () => {
    openConfirmDialog({
      title: 'Wipe All Data',
      message: 'This will permanently remove all transactions from your browser. Are you sure? We recommend downloading a backup first.',
      confirmText: 'Wipe All Data',
      isDanger: true,
      onConfirm: () => wipeAllData()
    });
  };

  const handleReloadDemo = () => {
    openConfirmDialog({
      title: 'Load Demo Data',
      message: 'This will replace your current data with sample expenses & income spanning recent months. Continue?',
      confirmText: 'Load Demo',
      onConfirm: () => loadDemo()
    });
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Database size={18} color="var(--color-primary-light)" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Data Backup & Management
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Hidden File Input for Import */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Row 1: Export JSON & CSV */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <button
            className="btn btn-outline"
            onClick={exportJSONBackup}
            style={{ padding: '0.75rem', justifyContent: 'flex-start' }}
          >
            <Download size={16} color="var(--color-primary-light)" />
            <span>Export JSON Backup</span>
          </button>

          <button
            className="btn btn-outline"
            onClick={exportCSV}
            style={{ padding: '0.75rem', justifyContent: 'flex-start' }}
          >
            <FileSpreadsheet size={16} color="var(--color-income)" />
            <span>Export CSV History</span>
          </button>
        </div>

        {/* Row 2: Import Backup */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <button
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
            style={{ padding: '0.75rem', justifyContent: 'flex-start' }}
          >
            <Upload size={16} color="var(--color-warning)" />
            <span>Restore / Import Backup</span>
          </button>

          <button
            className="btn btn-outline"
            onClick={handleReloadDemo}
            style={{ padding: '0.75rem', justifyContent: 'flex-start' }}
          >
            <Sparkles size={16} color="#38bdf8" />
            <span>Load Sample Demo Data</span>
          </button>
        </div>

        {/* Row 3: Danger Wipe */}
        <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            className="btn btn-expense"
            onClick={handleWipe}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            <Trash2 size={16} />
            <span>Clear All Data ({transactions.length} records)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
