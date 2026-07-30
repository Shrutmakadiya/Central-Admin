import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, Spinner } from '../components/ui';

// Mirrors dashboard_mod_analysis.php — sortable by impressions / downloads / conversion.
const SORTS = [
  { key: 'downloads', label: 'Downloads' },
  { key: 'impressions', label: 'Impressions' },
  { key: 'conversion', label: 'Conversion' },
];

export default function ModAnalysis() {
  const [sortBy, setSortBy] = useState('downloads');
  const [rows, setRows] = useState(null);

  useEffect(() => {
    setRows(null);
    api.get(`/api/analytics/top-mods?sortBy=${sortBy}&limit=100`).then(setRows);
  }, [sortBy]);

  return (
    <div>
      <h1 className="page-title">Mod Analysis</h1>
      <p className="page-sub">Mods by Impressions, Downloads &amp; Conversion</p>

      <Card
        title="Ranking"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            {SORTS.map((s) => (
              <button
                key={s.key}
                className={`btn btn-sm ${sortBy === s.key ? '' : 'btn-ghost'}`}
                onClick={() => setSortBy(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        }
      >
        {!rows ? (
          <Spinner />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th><th>Mod</th><th>Category</th>
                  <th>Impressions</th><th>Downloads</th><th>Conversion</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id}>
                    <td><span className="rank-pill">{m.rank}</span></td>
                    <td><strong>{m.title}</strong></td>
                    <td className="muted">{m.category || '—'}</td>
                    <td>{m.impressions.toLocaleString()}</td>
                    <td>{m.downloads.toLocaleString()}</td>
                    <td>{m.conversion}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
