import React from 'react';
import { Sparkles, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

export default function SmartInsights() {
  const { smartInsights } = useExpense();

  if (!smartInsights || smartInsights.length === 0) return null;

  const getIcon = (iconName, type) => {
    switch (type) {
      case 'danger': return <AlertTriangle size={18} color="var(--color-expense)" />;
      case 'warning': return <AlertCircle size={18} color="var(--color-warning)" />;
      case 'success': return <CheckCircle2 size={18} color="var(--color-income)" />;
      default: return <Sparkles size={18} color="var(--color-primary-light)" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'danger': return 'rgba(244, 63, 94, 0.35)';
      case 'warning': return 'rgba(245, 158, 11, 0.35)';
      case 'success': return 'rgba(16, 185, 129, 0.35)';
      default: return 'rgba(99, 102, 241, 0.35)';
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Sparkles size={18} color="#fbbf24" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Smart Financial Insights
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
        {smartInsights.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: `1px solid ${getBorderColor(item.type)}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getIcon(item.icon, item.type)}
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {item.title}
              </h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '2px' }}>
              {item.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
