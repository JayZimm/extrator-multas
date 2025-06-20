import { useState, useCallback } from 'react';
import processService from '../services/processService';

/**
 * Hook para gerenciar o histórico de processamento
 */
export const useProcessHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await processService.getProcessHistory();
      
      if (result.success) {
        // Ordenar por data de criação (mais recente primeiro)
        const sortedHistory = result.data.sort((a, b) => {
          const dateA = new Date(a.created_at || a.start_time);
          const dateB = new Date(b.created_at || b.start_time);
          return dateB - dateA;
        });
        
        setHistory(sortedHistory);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Erro ao carregar histórico');
        setHistory([]);
      }
    } catch (err) {
      setError('Erro de conexão com a API');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(() => {
    if (history.length === 0) {
      return {
        total: 0,
        completed: 0,
        failed: 0,
        totalFiles: 0,
        processedFiles: 0
      };
    }

    return {
      total: history.length,
      completed: history.filter(item => item.status === 'completed').length,
      failed: history.filter(item => item.status === 'error' || item.status === 'failed').length,
      totalFiles: history.reduce((sum, item) => sum + (item.total_files || 0), 0),
      processedFiles: history.reduce((sum, item) => sum + (item.files_processed || 0), 0)
    };
  }, [history]);

  const refresh = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    lastUpdated,
    stats: getStats(),
    fetchHistory,
    refresh
  };
}; 