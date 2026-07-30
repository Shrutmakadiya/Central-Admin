import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Card, Badge, ScareLevel, Spinner, Empty, formatBytes, formatDate } from '../components/ui';
import { useAuth } from '../auth';

export default function Mods() {
  const nav = useNavigate();
  const { can } = useAuth();
  const [mods, setMods] = useState(null);
  const [q, setQ] = useState('');

  const load = () => api.get('/api/mods').then(setMods);
  useEffect(() => { load(); }, []);

  async function remove(id) {
    if (!confirm('Delete this mod?')) return;
    await api.del(`/api/mods/${id}`);
    load();
  }

  if (!mods) return <Spinner />;
  const filtered = mods.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">All Mods</h1>
          <p className="page-sub">{mods.length} mods in catalog</p>
        </div>
        {can('edit_mods') && <button className="btn" onClick={() => nav('/mods/new')}>+ Add Mod</button>}
      </div>

      <Card>
        <div className="field" style={{ maxWidth: 320 }}>
          <input className="input" placeholder="Search mods…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Scare</th><th>Impressions</th>
                <th>Downloads</th><th>Conversion</th><th>Size</th><th>Status</th><th>Created</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td><strong>{m.title}</strong>{m.featured && <Badge color="blue"> Featured</Badge>}</td>
                  <td className="muted">{m.categoryName || '—'}</td>
                  <td><ScareLevel level={m.scareLevel} /></td>
                  <td>{m.impressions.toLocaleString()}</td>
                  <td>{m.downloads.toLocaleString()}</td>
                  <td>{m.conversion}%</td>
                  <td className="muted">{formatBytes(m.sizeBytes)}</td>
                  <td><Badge color={m.status === 'published' ? 'green' : 'gray'}>{m.status}</Badge></td>
                  <td className="muted">{formatDate(m.createdAt)}</td>
                  <td>
                    {can('edit_mods') && (
                      <>
                        <button className="btn btn-ghost btn-sm" onClick={() => nav(`/mods/${m.id}`)}>Edit</button>{' '}
                        <button className="btn btn-danger btn-sm" onClick={() => remove(m.id)}>Del</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <Empty>No mods found.</Empty>}
        </div>
      </Card>
    </div>
  );
}
