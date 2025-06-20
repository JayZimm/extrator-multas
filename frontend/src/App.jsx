import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AutoInfracao from './pages/AutoInfracao';
import ProcessControl from './pages/ProcessControl';
import ProcessHistory from './pages/ProcessHistory';
import AutoDetalhes from './pages/AutoDetalhes';
import StorageManager from './pages/StorageManager';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<AutoInfracao />} />
        <Route path="process-control" element={<ProcessControl />} />
        <Route path="process-history" element={<ProcessHistory />} />
        <Route path="auto/:id" element={<AutoDetalhes />} />
        <Route path="storage" element={<StorageManager />} />
      </Route>
    </Routes>
  );
}

export default App; 