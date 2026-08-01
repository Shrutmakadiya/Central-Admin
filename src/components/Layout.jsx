import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';

// Nav items mirror the iMods dashboard structure (Main + Admin sections).
const NAV = [
  { section: 'Main' },
  { to: '/', label: 'Dashboard', ico: '📊', perm: 'view_dashboard', end: true },
  { to: '/mods', label: 'All Mods', ico: '👻', perm: 'view_mods' },
  { to: '/analysis', label: 'Mod Analysis', ico: '📈', perm: 'view_analytics' },
  { to: '/audience', label: 'App Users', ico: '📱', perm: 'view_analytics' },
  { to: '/category-clicks', label: 'Category Clicks', ico: '🖱️', perm: 'view_analytics' },
  { to: '/keywords', label: 'Search Keywords', ico: '🔍', perm: 'view_search' },
  { to: '/history', label: 'Change History', ico: '🕒', perm: 'view_history' },
  { to: '/categories', label: 'Categories', ico: '🗂️', perm: 'view_categories' },
  { section: 'Admin' },
  { to: '/users', label: 'Users', ico: '👤', perm: 'manage_users' },
  { to: '/roles', label: 'Roles', ico: '🛡️', perm: 'manage_roles' },
  { to: '/ads', label: 'Ads & Monetization', ico: '💰', perm: 'manage_ads' },
  { to: '/app-version', label: 'App Version', ico: '🔄', perm: 'manage_app_version' },
  { to: '/apps', label: 'Manage Apps', ico: '🗃️', perm: 'manage_users' },
  { to: '/legal', label: 'Legal & Privacy', ico: '📄', perm: 'view_dashboard' },
];

export default function Layout({ children }) {
  const { user, logout, can } = useAuth();
  const nav = useNavigate();

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="icon">🗃️</span>
          <span>Apps Central</span>
        </div>
        <nav>
          {NAV.map((item, i) =>
            item.section ? (
              <div key={i} className="nav-section-title">
                {item.section}
              </div>
            ) : (
              can(item.perm) && (
                <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
                  <span className="ico">{item.ico}</span>
                  <span>{item.label}</span>
                </NavLink>
              )
            )
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="who">{user?.fullName || user?.username}</div>
          <div className="role">{user?.role || 'User'}</div>
          <button
            className="logout-btn"
            onClick={() => {
              logout();
              nav('/login');
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
