import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, Spinner, Empty, Badge } from '../components/ui';

const EMPTY = { name: '', description: '', permissions: [] };

export default function Roles() {
  const [rows, setRows] = useState(null);
  const [perms, setPerms] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/api/roles').then(setRows);
  useEffect(() => {
    load();
    api.get('/api/roles/permissions').then(setPerms);
  }, []);

  function togglePerm(key) {
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(key)
        ? f.permissions.filter((p) => p !== key)
        : [...f.permissions, key],
    }));
  }

  async function save(e) {
    e.preventDefault();
    if (editId) await api.put(`/api/roles/${editId}`, form);
    else await api.post('/api/roles', form);
    setForm(EMPTY);
    setEditId(null);
    load();
  }

  function edit(r) {
    setEditId(r.id);
    setForm({ name: r.name, description: r.description, permissions: r.permissions.includes('*') ? perms.map((p) => p.key) : r.permissions });
  }

  async function remove(id) {
    if (!confirm('Delete role?')) return;
    await api.del(`/api/roles/${id}`);
    load();
  }

  if (!rows) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">Role Management</h1>
      <p className="page-sub">Define what each role can access</p>

      <div className="grid-2">
        <Card title="Roles">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Role</th><th>Description</th><th>Users</th><th>Permissions</th><th></th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.name}</strong></td>
                    <td className="muted">{r.description || '—'}</td>
                    <td>{r.userCount}</td>
                    <td>{r.permissions.includes('*') ? <Badge color="green">All</Badge> : <Badge color="blue">{r.permissions.length}</Badge>}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => edit(r)}>Edit</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <Empty>No roles.</Empty>}
          </div>
        </Card>

        <Card title={editId ? 'Edit Role' : 'Create New Role'}>
          <form onSubmit={save}>
            <div className="field"><label>Role name</label><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required /></div>
            <div className="field"><label>Description</label><input className="input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="field">
              <label>Permissions</label>
              <div style={{ display: 'grid', gap: 8, marginTop: 4 }}>
                {perms.map((p) => (
                  <label key={p.key} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.88rem' }}>
                    <input type="checkbox" checked={form.permissions.includes(p.key)} onChange={() => togglePerm(p.key)} />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            <button className="btn">{editId ? 'Save' : 'Create Role'}</button>{' '}
            {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
          </form>
        </Card>
      </div>
    </div>
  );
}
