import React, { createContext, useContext, useState } from 'react';
import { api } from './api';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hm_user') || 'null');
    } catch {
      return null;
    }
  });

  async function login(username, password) {
    const data = await api.post('/api/auth/login', { username, password });
    localStorage.setItem('hm_token', data.token);
    localStorage.setItem('hm_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('hm_token');
    localStorage.removeItem('hm_user');
    setUser(null);
  }

  // Super Admin (permissions includes "*") can see everything.
  function can(perm) {
    const perms = (user && user.permissions) || [];
    return perms.includes('*') || perms.includes(perm);
  }

  return <AuthCtx.Provider value={{ user, login, logout, can }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
