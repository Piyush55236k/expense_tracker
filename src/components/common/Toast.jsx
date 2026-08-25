import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

export default function ToastContainer() {
  const { toasts, dismissToast } = useExpense();

  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 size={20} color="#10b981" />;
      case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
      case 'error': return <AlertCircle size={20} color="#f43f5e" />;
      default: return <Info size={20} color="#6366f1" />;
    }
  };

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
            <div style={{ flexShrink: 0 }}>{getIcon(toast.type)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {toast.message}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            {toast.actionText && toast.onAction && (
              <button
                onClick={() => {
                  toast.onAction();
                  dismissToast(toast.id);
                }}
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--color-primary-light)',
                  border: '1px solid var(--border-card)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                {toast.actionText}
              </button>
            )}
            <button
              onClick={() => dismissToast(toast.id)}
              style={{
                color: 'var(--text-dim)',
                padding: '4px',
                borderRadius: 'var(--radius-xs)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
