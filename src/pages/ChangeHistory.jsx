import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, Spinner, Empty, Badge, formatDate } from '../components/ui';

export default function ChangeHistory() {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.get('/api/analytics/change-history').then(setRows); }, []);
  if (!rows) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">Change History</h1>
      <p className="page-sub">Audit log of every mod edit</p>
      <Card title="Recent Changes" sub={`${rows.length} entries`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>When</th><th>Mod</th><th>Field</th><th>Old</th><th>New</th><th>By</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="muted">{formatDate(r.createdAt)}</td>
                  <td><strong>{r.modTitle || '—'}</strong></td>
                  <td><Badge color="blue">{r.field}</Badge></td>
                  <td className="muted">{r.oldValue || '—'}</td>
                  <td>{r.newValue || '—'}</td>
                  <td className="muted">{r.changedBy || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty>No changes logged.</Empty>}
        </div>
      </Card>
    </div>
  );
}
