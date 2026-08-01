import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, Spinner, Empty } from '../components/ui';
import { useAuth } from '../auth';

const EMPTY = { name: '', icon: '👻', sortOrder: 0 };

export default function Categories() {
  const { can } = useAuth();
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/api/categories').then(setRows);
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    if (editId) await api.put(`/api/categories/${editId}`, form);
    else await api.post('/api/categories', form);
    setForm(EMPTY);
    setEditId(null);
    load();
  }

  function edit(c) {
    setEditId(c.id);
    setForm({ name: c.name, icon: c.icon, sortOrder: c.sortOrder });
  }

  async function remove(id) {
    if (!confirm('Delete category?')) return;
    await api.del(`/api/categories/${id}`);
    load();
  }

  if (!rows) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">Categories</h1>
      <p className="page-sub">Organize your apps central</p>

      <div className="grid-2">
        <Card title="Categories">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Icon</th><th>Name</th><th>Mods</th><th>Clicks</th><th>Order</th><th></th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontSize: 20 }}>{c.icon}</td>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.modCount}</td>
                    <td className="muted">{c.clicks.toLocaleString()}</td>
                    <td className="muted">{c.sortOrder}</td>
                    <td>
                      {can('edit_mods') && (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => edit(c)}>Edit</button>{' '}
                          <button className="btn btn-danger btn-sm" onClick={() => remove(c.id)}>Del</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <Empty>No categories.</Empty>}
          </div>
        </Card>

        {can('edit_mods') && (
          <Card title={editId ? 'Edit Category' : 'New Category'}>
            <form onSubmit={save}>
              <div className="field"><label>Name</label><input className="input" value={form.name} onChange={set('name')} required /></div>
              <div className="field"><label>Icon (emoji)</label><input className="input" value={form.icon} onChange={set('icon')} /></div>
              <div className="field"><label>Sort order</label><input className="input" type="number" value={form.sortOrder} onChange={set('sortOrder')} /></div>
              <button className="btn">{editId ? 'Save' : 'Add'}</button>{' '}
              {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
