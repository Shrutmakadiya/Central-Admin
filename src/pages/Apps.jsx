import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, Spinner } from '../components/ui';

// Registry of every app this central panel manages. Selecting one scopes EVERY other
// page to that app. Content can be shared; analytics and settings are always separate.
export default function Apps() {
  const [apps, setApps] = useState(null);
  const emptyForm = { key: '', name: '', androidPackage: '', r2Prefix: '', contentAppKey: '' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
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
    setSaving(true);
    try {
      await api.post('/api/apps', form);
      setMsg(`App "${form.key}" created — its database is ready.`);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
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
            <thead><tr><th>Key</th><th>Name</th><th>Package</th><th>R2 folder</th><th>Content</th><th></th></tr></thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.key} style={a.key === current ? { background: 'rgba(45,206,137,0.08)' } : undefined}>
                  <td><code>{a.key}</code></td>
                  <td>{a.name}</td>
                  <td className="muted">{a.android_package || '—'}</td>
                  <td className="muted">{a.r2_prefix}/</td>
                  <td className="muted">{a.content_schema ? `Shared with ${apps.find((source) => source.schema_name === a.content_schema)?.name || a.content_schema}` : 'Own catalog'}</td>
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

      <Card title="Add a new app" sub="Create an empty catalog or share an existing app’s content and files. Analytics and app settings stay separate.">
        {!apps.some((a) => a.key === 'verity3') && apps.some((a) => a.key === 'verity') && (
          <button className="btn btn-ghost" type="button" disabled={saving} onClick={() => setForm({ ...emptyForm, key: 'verity3', name: 'Verity Mods for Minecraft pe', androidPackage: 'com.verity.mods.horror.minecraft', contentAppKey: 'verity' })}>
            Set up Verity 3 using Verity 1 content
          </button>
        )}
        <form onSubmit={create}>
          <div className="fields-grid">
            <div className="field"><label>Key (short id, e.g. gf2)</label>
              <input className="input" value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} required /></div>
            <div className="field"><label>App name</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="field"><label>Android package</label>
              <input className="input" placeholder="com.example.app" value={form.androidPackage} onChange={(e) => setForm({ ...form, androidPackage: e.target.value })} /></div>
            <div className="field"><label>R2 folder (defaults to key)</label>
              <input className="input" disabled={!!form.contentAppKey} value={form.contentAppKey ? apps.find((a) => a.key === form.contentAppKey)?.r2_prefix || '' : form.r2Prefix} onChange={(e) => setForm({ ...form, r2Prefix: e.target.value })} /></div>
            <div className="field"><label>Content source</label>
              <select className="input" value={form.contentAppKey} onChange={(e) => setForm({ ...form, contentAppKey: e.target.value })}>
                <option value="">New empty catalog</option>
                {apps.filter((a) => !a.content_schema).map((a) => <option key={a.key} value={a.key}>{a.name} ({a.key})</option>)}
              </select>
            </div>
          </div>
          {form.contentAppKey && <p className="muted">Mods, categories, screenshots, and files are shared live. Content edits affect both apps. Impressions, downloads, users, searches, ratings, ads, and version settings stay separate.</p>}
          <div className="save-bar" style={{ marginTop: 14 }}>
            <button className="btn" type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create app'}</button>
            {msg && <span className="muted" style={{ fontSize: '0.85rem' }}>{msg}</span>}
          </div>
        </form>
      </Card>
    </div>
  );
}
