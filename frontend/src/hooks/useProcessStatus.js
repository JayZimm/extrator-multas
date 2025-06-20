import { useState, useEffect, useCallback } from 'react';
import processService from '../services/processService';

/**
 * Hook para monitorar o status do processamento
 */
export const useProcessStatus = (autoRefresh = true, refreshInterval = 5000) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await processService.getProcessStatus();
      
      if (result.success) {
        setStatus(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Erro ao obter status');
      }
    } catch (err) {
      setError('Erro de conexão com a API');
    } finally {
      setLoading(false);
    }
  }, []);

  const startProcessing = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await processService.startProcessing();
      
      if (result.success) {
        // Atualizar status imediatamente após iniciar
        await fetchStatus();
        return { success: true, message: result.message };
      } else {
        setError(result.error || 'Erro ao iniciar processamento');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMsg = 'Erro de conexão com a API';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  // Auto-refresh quando o processamento está ativo
  useEffect(() => {
    if (!autoRefresh) return;

    let intervalId;
    
    // Fazer primeira busca
    fetchStatus();
    
    // Configurar intervalo se o status indica processamento ativo
    if (status?.status === 'processing' || status?.status === 'running') {
      intervalId = setInterval(fetchStatus, refreshInterval);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, status?.status, fetchStatus]);

  const refresh = useCallback(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    lastUpdated,
    refresh,
    startProcessing
  };
}; 