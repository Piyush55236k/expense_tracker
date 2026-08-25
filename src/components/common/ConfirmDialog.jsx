import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import Modal from './Modal';

export default function ConfirmDialog() {
  const { confirmDialog, closeConfirmDialog } = useExpense();
  const { isOpen, title, message, confirmText, cancelText, isDanger, onConfirm } = confirmDialog;

  return (
    <Modal isOpen={isOpen} onClose={closeConfirmDialog} title={title || 'Confirm Action'} maxWidth="420px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: isDanger ? 'var(--color-expense-subtle)' : 'var(--color-primary-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {isDanger ? <AlertTriangle size={22} color="var(--color-expense)" /> : <Info size={22} color="var(--color-primary)" />}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5, marginTop: '4px' }}>
            {message}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-outline" onClick={closeConfirmDialog}>
            {cancelText || 'Cancel'}
          </button>
          <button
            type="button"
            className={`btn ${isDanger ? 'btn-expense' : 'btn-primary'}`}
            onClick={() => {
              if (onConfirm) onConfirm();
              closeConfirmDialog();
            }}
          >
            {confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
