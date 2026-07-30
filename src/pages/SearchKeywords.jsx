import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, Spinner, Empty } from '../components/ui';

export default function SearchKeywords() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState('');
  useEffect(() => { api.get('/api/analytics/search-keywords').then(setRows); }, []);
  if (!rows) return <Spinner />;
  const filtered = rows.filter((r) => r.keyword.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <h1 className="page-title">Search Keywords</h1>
      <p className="page-sub">What players search inside the app — gold for your ASO</p>
      <Card title="Top Search Terms" sub={`${rows.length} unique keywords`}>
        <div className="field" style={{ maxWidth: 280 }}>
          <input className="input" placeholder="Filter keywords…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Rank</th><th>Keyword</th><th>Searches</th></tr></thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.keyword}>
                  <td><span className="rank-pill">{r.rank}</span></td>
                  <td>{r.keyword}</td>
                  <td>{r.count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <Empty>No keywords found.</Empty>}
        </div>
      </Card>
    </div>
  );
}
