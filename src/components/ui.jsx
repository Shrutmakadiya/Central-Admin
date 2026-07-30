import React from 'react';

export function Card({ title, sub, action, children }) {
  return (
    <div className="card">
      {(title || action) && (
        <div className="card-header">
          <div>
            {title && <div className="card-title">{title}</div>}
            {sub && <div className="card-sub">{sub}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function KpiCard({ label, value, icon, color, onClick }) {
  return (
    <div className="kpi-card" onClick={onClick}>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
      </div>
      <div className="kpi-icon" style={{ background: color }}>
        {icon}
      </div>
    </div>
  );
}

export function Badge({ children, color = 'gray' }) {
  return <span className={`badge badge-${color}`}>{children}</span>;
}

export function ScareLevel({ level }) {
  return <span className="scare" title={`Scare level ${level}/5`}>{'💀'.repeat(level)}</span>;
}

export function Spinner() {
  return <div className="muted" style={{ padding: 30 }}>Loading…</div>;
}

export function Empty({ children }) {
  return <div className="muted" style={{ padding: 24, textAlign: 'center' }}>{children}</div>;
}

export function formatBytes(b) {
  if (!b) return '—';
  const mb = b / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
