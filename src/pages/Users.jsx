import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Card, Spinner, Empty, Badge, formatDate } from '../components/ui';

const EMPTY = { username: '', email: '', fullName: '', password: '', roleId: '', status: 'active' };

export default function Users() {
  const [rows, setRows] = useState(null);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/api/users').then(setRows);
  useEffect(() => {
    load();
    api.get('/api/roles').then(setRoles);
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form, roleId: form.roleId || null };
      if (editId) await api.put(`/api/users/${editId}`, body);
      else await api.post('/api/users', body);
      setForm(EMPTY);
      setEditId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function edit(u) {
    setEditId(u.id);
    setForm({ username: u.username, email: u.email, fullName: u.fullName, password: '', roleId: u.roleId || '', status: u.status });
  }

  async function remove(id) {
    if (!confirm('Delete user?')) return;
    await api.del(`/api/users/${id}`);
    load();
  }

  if (!rows) return <Spinner />;

  return (
    <div>
      <h1 className="page-title">User Management</h1>
      <p className="page-sub">{rows.length} users</p>

      <div className="grid-2">
        <Card title="Users">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Username</th><th>Email</th><th>Name</th><th>Role</th><th>Status</th><th>Created</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td className="muted">{u.id}</td>
                    <td><strong>{u.username}</strong></td>
                    <td className="muted">{u.email}</td>
                    <td>{u.fullName || '—'}</td>
                    <td><Badge color="blue">{u.roleName || '—'}</Badge></td>
                    <td><Badge color={u.status === 'active' ? 'green' : 'gray'}>{u.status}</Badge></td>
                    <td className="muted">{formatDate(u.createdAt)}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => edit(u)}>Edit</button>{' '}
                      <button className="btn btn-danger btn-sm" onClick={() => remove(u.id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <Empty>No users.</Empty>}
          </div>
        </Card>

        <Card title={editId ? 'Edit User' : 'Add User'}>
          <form onSubmit={save}>
            {error && <div className="error-text">{error}</div>}
            <div className="field"><label>Username</label><input className="input" value={form.username} onChange={set('username')} disabled={!!editId} required /></div>
            <div className="field"><label>Email</label><input className="input" type="email" value={form.email} onChange={set('email')} required /></div>
            <div className="field"><label>Full name</label><input className="input" value={form.fullName} onChange={set('fullName')} /></div>
            <div className="field"><label>{editId ? 'New password (blank = keep)' : 'Password'}</label><input className="input" type="password" value={form.password} onChange={set('password')} {...(editId ? {} : { required: true })} /></div>
            <div className="row">
              <div className="field">
                <label>Role</label>
                <select className="select" value={form.roleId} onChange={set('roleId')}>
                  <option value="">— None —</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Status</label>
                <select className="select" value={form.status} onChange={set('status')}>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
            <button className="btn">{editId ? 'Save' : 'Create User'}</button>{' '}
            {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm(EMPTY); }}>Cancel</button>}
          </form>
        </Card>
      </div>
    </div>
  );
}
