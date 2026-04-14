import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AlertList from './pages/AlertList';
import AlertDetail from './pages/AlertDetail';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Assets from './pages/Assets';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Landing from './pages/Landing';

import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/alerts" element={<AlertList />} />
        <Route path="/alerts/:id" element={<AlertDetail />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Admin only routes */}
        <Route path="/users" element={<ProtectedRoute requireAdmin><Users /></ProtectedRoute>} />
        <Route path="/sources" element={<ProtectedRoute requireAdmin><Settings initialTab="sources" /></ProtectedRoute>} />
        <Route path="/playbooks" element={<ProtectedRoute requireAdmin><Settings initialTab="playbooks" /></ProtectedRoute>} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
