import React, { useState } from 'react';
import { 
  PlayIcon, 
  ArrowPathIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useProcessStatus } from '../hooks/useProcessStatus';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const ProcessControl = () => {
  const { status, loading, error, lastUpdated, refresh, startProcessing } = useProcessStatus();
  const [actionLoading, setActionLoading] = useState(false);

  const handleStartProcessing = async () => {
    setActionLoading(true);
    try {
      const result = await startProcessing();
      
      if (result.success) {
        // Feedback de sucesso pode ser adicionado aqui (toast, etc.)
        console.log('✅ Processamento iniciado com sucesso');
      } else {
        console.error('❌ Erro ao iniciar processamento:', result.error);
      }
    } finally {
      setActionLoading(false);
    }
  };

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

  const isProcessing = status?.status === 'processing' || status?.status === 'running';

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Controle de Processamento
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Inicie e monitore o processamento de arquivos do sistema.
        </p>
      </div>

      {/* Ações Principais */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Ações de Processamento
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Controle o processamento de arquivos do sistema
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Status
            </button>
            
            <button
              onClick={handleStartProcessing}
              disabled={loading || actionLoading || isProcessing}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {actionLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? 'Processando...' : 'Iniciar Processamento'}
            </button>
          </div>
        </div>
      </div>

      {/* Status Atual */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Status Atual do Processamento
            </h3>
            {lastUpdated && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
              </span>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-800 dark:text-red-200">{error}</span>
              </div>
            </div>
          )}

          {loading && !status ? (
            <div className="py-8">
              <LoadingSpinner size="lg" text="Carregando status..." />
            </div>
          ) : status ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
                    <StatusBadge status={status.status} className="mt-1" />
                  </div>
                  {isProcessing ? (
                    <ClockIcon className="h-6 w-6 text-blue-500 animate-pulse" />
                  ) : (
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  )}
                </div>
              </div>

              {/* Arquivos Processados */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Arquivos Processados</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {status.files_processed || 0}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    de {status.total_files || 0} total
                  </p>
                </div>
              </div>

              {/* Tempo de Início */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Início</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDateTime(status.start_time)}
                  </p>
                </div>
              </div>

              {/* Duração */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Duração</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {status.end_time 
                      ? formatDuration(status.start_time, status.end_time)
                      : isProcessing ? 'Em andamento...' : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum processamento encontrado</p>
              <p className="text-sm">Clique em "Iniciar Processamento" para começar</p>
            </div>
          )}

          {/* Erro do Processamento */}
          {status?.error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Erro no Processamento</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{status.error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progresso Visual */}
      {status && status.total_files > 0 && (
        <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Progresso do Processamento
          </h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {status.files_processed} de {status.total_files} arquivos
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                {Math.round((status.files_processed / status.total_files) * 100)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((status.files_processed / status.total_files) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessControl; 