import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, Spinner } from '../components/ui';

// Registry of every app this central panel manages. Selecting one scopes EVERY other
// page (mods, categories, ads, users, versions) to that app. Creating one provisions
// its isolated database schema instantly — no redeploy.
export default function Apps() {
  const [apps, setApps] = useState(null);
  const [form, setForm] = useState({ key: '', name: '', androidPackage: '', r2Prefix: '' });
  const [msg, setMsg] = useState('');
  const current = localStorage.getItem('central_app') || 'gf';

  const load = () => api.get('/api/apps').then(setApps);
  useEffect(() => { load(); }, []);

  function select(key) {
    localStorage.setItem('central_app', key);
    location.reload(); // simplest correct behavior: every page refetches scoped data
  }

  async function create(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/api/apps', form);
      setMsg(`App "${form.key}" created — its database is ready.`);
      setForm({ key: '', name: '', androidPackage: '', r2Prefix: '' });
      load();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }

  if (!apps) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">Manage Apps</h1>
      <p className="page-sub">Every app this panel controls. The selected app scopes all other pages.</p>

      <Card title="Your apps">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Key</th><th>Name</th><th>Package</th><th>R2 folder</th><th></th></tr></thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.key} style={a.key === current ? { background: 'rgba(45,206,137,0.08)' } : undefined}>
                  <td><code>{a.key}</code></td>
                  <td>{a.name}</td>
                  <td className="muted">{a.android_package || '—'}</td>
                  <td className="muted">{a.r2_prefix}/</td>
                  <td>
                    {a.key === current ? (
                      <strong style={{ color: '#2dce89' }}>✓ selected</strong>
                    ) : (
                      <button className="btn btn-ghost" onClick={() => select(a.key)}>Switch to this app</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Add a new app" sub="Creates the app's isolated database (categories, mods, ads, analytics) immediately.">
        <form onSubmit={create}>
          <div className="fields-grid">
            <div className="field"><label>Key (short id, e.g. gf2)</label>
              <input className="input" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required /></div>
            <div className="field"><label>App name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="field"><label>Android package</label>
              <input className="input" placeholder="com.example.app" value={form.androidPackage} onChange={(e) => setForm({ ...form, androidPackage: e.target.value })} /></div>
            <div className="field"><label>R2 folder (defaults to key)</label>
              <input className="input" value={form.r2Prefix} onChange={(e) => setForm({ ...form, r2Prefix: e.target.value })} /></div>
          </div>
          <div className="save-bar" style={{ marginTop: 14 }}>
            <button className="btn" type="submit">Create app</button>
            {msg && <span className="muted" style={{ fontSize: '0.85rem' }}>{msg}</span>}
          </div>
        </form>
      </Card>
    </div>
  );
}
