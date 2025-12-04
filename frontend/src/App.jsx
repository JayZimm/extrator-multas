import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AutoInfracao from './pages/AutoInfracao';
import ProcessControl from './pages/ProcessControl';
import ProcessHistory from './pages/ProcessHistory';
import AutoDetalhes from './pages/AutoDetalhes';
import StorageManager from './pages/StorageManager';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rota de Login */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } 
      />

      {/* Rotas Protegidas */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AutoInfracao />} />
        <Route path="process-control" element={<ProcessControl />} />
        <Route path="process-history" element={<ProcessHistory />} />
        <Route path="auto/:id" element={<AutoDetalhes />} />
        <Route path="storage" element={<StorageManager />} />
      </Route>

      {/* Rota 404 - Redireciona para home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App; 