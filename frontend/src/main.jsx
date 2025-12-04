import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './config/axiosConfig';
import App from './App';
import './index.css';

// Configuração do QueryClient para evitar problemas de cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Sempre considerar os dados como obsoletos
      cacheTime: 1000 * 60 * 5, // Manter em cache por 5 minutos
      refetchOnWindowFocus: false, // Não fazer refetch quando a janela ganhar foco
      retry: 1, // Tentar novamente apenas uma vez em caso de falha
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
); 