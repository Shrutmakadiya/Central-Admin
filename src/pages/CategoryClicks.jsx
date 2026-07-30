import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, Spinner, Empty } from '../components/ui';

export default function CategoryClicks() {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.get('/api/analytics/category-clicks').then(setRows); }, []);
  if (!rows) return <Spinner />;
  const max = Math.max(1, ...rows.map((r) => r.clicks));

  return (
    <div>
      <h1 className="page-title">Category Clicks</h1>
      <p className="page-sub">Which categories players tap the most</p>
      <Card title="Category Click Data">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Rank</th><th>Category</th><th>Clicks</th><th>Percentage</th><th style={{ width: '30%' }}></th></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><span className="rank-pill">{r.rank}</span></td>
                  <td>{r.icon} {r.name}</td>
                  <td>{r.clicks.toLocaleString()}</td>
                  <td>{r.percentage}%</td>
                  <td>
                    <div style={{ background: '#eef0f3', borderRadius: 6, height: 8 }}>
                      <div style={{ width: `${(r.clicks / max) * 100}%`, background: 'var(--accent-pink)', height: 8, borderRadius: 6 }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty>No click data yet.</Empty>}
        </div>
      </Card>
    </div>
  );
}
