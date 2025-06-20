import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';
import processService from '../services/processService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const ProcessHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await processService.getProcessHistory();
      
      if (result.success) {
        setHistory(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Erro ao carregar histórico');
      }
    } catch (err) {
      setError('Erro de conexão com a API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const diffSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  const getTotalFiles = (item) => {
    return item.total_files || 0;
  };

  const getProcessedFiles = (item) => {
    return item.files_processed || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Histórico de Processamento
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Visualize o histórico completo de processamentos realizados.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
            </span>
          )}
          
          <button
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {history.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total de Processamentos
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {history.filter(item => item.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Concluídos com Sucesso
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {history.reduce((sum, item) => sum + getProcessedFiles(item), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Arquivos Processados
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de Histórico */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Histórico Detalhado
          </h3>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" text="Carregando histórico..." />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhum processamento encontrado
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Os processamentos aparecerão aqui após serem executados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Início
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Arquivos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Erro
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                {history.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDateTime(item.start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDateTime(item.end_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDuration(item.start_time, item.end_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {getProcessedFiles(item)} / {getTotalFiles(item)}
                        </span>
                        {getTotalFiles(item) > 0 && (
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min((getProcessedFiles(item) / getTotalFiles(item)) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.error ? (
                        <span className="text-red-600 dark:text-red-400 text-xs">
                          {item.error.length > 50 ? `${item.error.substring(0, 50)}...` : item.error}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessHistory; 