import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { Card, Spinner } from '../components/ui';

const EMPTY = {
  title: '', description: '', categoryId: '', scareLevel: 3, mcVersion: '1.20+',
  thumbnailUrl: '', fileUrl: '', sizeBytes: 0, status: 'published', featured: false, screenshots: [],
};

export default function ModEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const editing = !!id;
  const [form, setForm] = useState(EMPTY);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/categories').then(setCats);
    if (editing) {
      api.get(`/api/mods/${id}`).then((m) => {
        setForm({
          title: m.title, description: m.description, categoryId: m.categoryId || '',
          scareLevel: m.scareLevel, mcVersion: m.mcVersion, thumbnailUrl: m.thumbnailUrl,
          fileUrl: m.fileUrl, sizeBytes: m.sizeBytes, status: m.status, featured: m.featured, screenshots: m.screenshots || [],
        });
        setLoading(false);
      });
    }
  }, [id]);

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
  };

  async function uploadScreenshot(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.upload('/api/mods/upload', fd);
    setForm((f) => ({ ...f, screenshots: [...(f.screenshots || []), res.url].slice(0, 5) }));
    e.target.value = '';
  }

  async function uploadFile(e, key) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.upload('/api/mods/upload', fd);
    setForm((f) => ({ ...f, [key]: res.url, ...(key === 'fileUrl' ? { sizeBytes: res.size } : {}) }));
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form, categoryId: form.categoryId || null, scareLevel: Number(form.scareLevel) };
      if (editing) await api.put(`/api/mods/${id}`, body);
      else await api.post('/api/mods', body);
      nav('/mods');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">{editing ? 'Edit Mod' : 'Add Mod'}</h1>
      <p className="page-sub">{editing ? 'Update mod details' : 'Create a new mod'}</p>

      <form onSubmit={save} style={{ maxWidth: 760 }}>
        <Card>
          {error && <div className="error-text">{error}</div>}
          <div className="field">
            <label>Title</label>
            <input className="input" value={form.title} onChange={set('title')} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea className="input" rows={4} value={form.description} onChange={set('description')} />
          </div>
          <div className="row">
            <div className="field">
              <label>Category</label>
              <select className="select" value={form.categoryId} onChange={set('categoryId')}>
                <option value="">— None —</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>MC Version</label>
              <input className="input" value={form.mcVersion} onChange={set('mcVersion')} />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>Thumbnail</label>
              <input className="input" value={form.thumbnailUrl} onChange={set('thumbnailUrl')} placeholder="URL or upload" />
              <input type="file" accept="image/*" onChange={(e) => uploadFile(e, 'thumbnailUrl')} style={{ marginTop: 6 }} />
            </div>
            <div className="field">
              <label>Mod File (.mcaddon / .mcpack)</label>
              <input className="input" value={form.fileUrl} onChange={set('fileUrl')} placeholder="URL or upload" />
              <input type="file" accept=".mcaddon,.mcpack,.zip" onChange={(e) => uploadFile(e, 'fileUrl')} style={{ marginTop: 6 }} />
            </div>
          </div>

          <div className="row">
            <div className="field">
              <label>Status</label>
              <select className="select" value={form.status} onChange={set('status')}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="field" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={form.featured} onChange={set('featured')} /> Featured
              </label>
            </div>
          </div>

          {form.thumbnailUrl && (
            <img src={form.thumbnailUrl} alt="thumbnail preview" style={{ width: 160, borderRadius: 10, marginTop: 8, border: '1px solid #e3e6ec' }} />
          )}

          
          <div className="field" style={{ marginTop: 16 }}>
            <label>App screenshots (max 5) — shown in the mod detail gallery</label>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              {(form.screenshots || []).map((u, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={u} alt={`screenshot ${i + 1}`} style={{ width: 130, height: 84, objectFit: 'cover', borderRadius: 8, border: '1px solid #e3e6ec' }} />
                  <button type="button"
                    onClick={() => setForm((f) => ({ ...f, screenshots: f.screenshots.filter((_, j) => j !== i) }))}
                    style={{ position: 'absolute', top: -8, right: -8, background: '#f5365c', color: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', lineHeight: '20px' }}>×</button>
                </div>
              ))}
              {(form.screenshots || []).length < 5 && (
                <label style={{ width: 130, height: 84, border: '2px dashed #cdd3de', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8392ab', fontSize: 26 }}>
                  +
                  <input type="file" accept="image/*" onChange={uploadScreenshot} style={{ display: 'none' }} />
                </label>
              )}
            </div>
          </div>

<div style={{ marginTop: 16 }}>
            <button className="btn">{editing ? 'Save Changes' : 'Create Mod'}</button>{' '}
            <button type="button" className="btn btn-ghost" onClick={() => nav('/mods')}>Cancel</button>
          </div>
        </Card>
      </form>
    </div>
  );
}
