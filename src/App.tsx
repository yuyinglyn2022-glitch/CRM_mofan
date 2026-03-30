import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import CustomerDetail from './pages/CustomerDetail';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <Layout>{children}</Layout>;
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={user ? <Navigate to="/" /> : <AuthPage />} 
      />
      <Route 
        path="/" 
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } 
      />
      <Route 
        path="/customer/:id" 
        element={
          <PrivateRoute>
            <CustomerDetail />
          </PrivateRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

import { isSupabaseConfigured } from './lib/supabase';
import { AlertCircle, ExternalLink } from 'lucide-react';

function SetupRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration Required</h1>
        <p className="text-gray-500 mb-8">
          To use the Journey CRM, you need to connect your Supabase project.
        </p>

        <div className="space-y-4 text-left mb-8">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">1. Get your keys</h3>
            <p className="text-xs text-gray-500">
              Go to your Supabase Project Settings &gt; API and copy the Project URL and Anon Key.
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">2. Add to Secrets</h3>
            <p className="text-xs text-gray-500">
              In AI Studio, open the <b>Secrets</b> panel and add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
            </p>
          </div>
        </div>

        <a 
          href="https://supabase.com/dashboard" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-black hover:underline"
        >
          Open Supabase Dashboard <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <SetupRequired />;
  }

  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
