import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Mods from './pages/Mods';
import ModEditor from './pages/ModEditor';
import ModAnalysis from './pages/ModAnalysis';
import Audience from './pages/Audience';
import CategoryClicks from './pages/CategoryClicks';
import SearchKeywords from './pages/SearchKeywords';
import ChangeHistory from './pages/ChangeHistory';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Ads from './pages/Ads';
import AppVersion from './pages/AppVersion';
import Legal from './pages/Legal';

function Protected({ children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/mods" element={<Protected><Mods /></Protected>} />
      <Route path="/mods/new" element={<Protected><ModEditor /></Protected>} />
      <Route path="/mods/:id" element={<Protected><ModEditor /></Protected>} />
      <Route path="/analysis" element={<Protected><ModAnalysis /></Protected>} />
      <Route path="/audience" element={<Protected><Audience /></Protected>} />
      <Route path="/category-clicks" element={<Protected><CategoryClicks /></Protected>} />
      <Route path="/keywords" element={<Protected><SearchKeywords /></Protected>} />
      <Route path="/history" element={<Protected><ChangeHistory /></Protected>} />
      <Route path="/categories" element={<Protected><Categories /></Protected>} />
      <Route path="/users" element={<Protected><Users /></Protected>} />
      <Route path="/roles" element={<Protected><Roles /></Protected>} />
      <Route path="/ads" element={<Protected><Ads /></Protected>} />
      <Route path="/app-version" element={<Protected><AppVersion /></Protected>} />
      <Route path="/legal" element={<Protected><Legal /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
