import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

/**
 * Componente de Debug para verificar variáveis de ambiente
 * REMOVER EM PRODUÇÃO!
 */
const EnvDebug = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const envVars = {
    'VITE_API_URL': import.meta.env.VITE_API_URL,
    'VITE_AUTH_API_URL': import.meta.env.VITE_AUTH_API_URL,
    'VITE_AUTH_TOKEN': import.meta.env.VITE_AUTH_TOKEN ? '✅ Configurado' : '❌ Não configurado',
    'VITE_AUTH_DATASET': import.meta.env.VITE_AUTH_DATASET,
  };

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 rounded-lg shadow-lg z-50 overflow-hidden transition-all duration-300">
      {/* Header - Sempre visível */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="font-bold text-yellow-900 dark:text-yellow-100 text-xs font-mono flex items-center">
          <span className="mr-2">⚠️</span>
          Debug - Env Vars
          {!isExpanded && (
            <span className="ml-2 text-[10px] text-yellow-700 dark:text-yellow-300">
              (Clique para expandir)
            </span>
          )}
        </div>
        <button
          className="ml-2 p-1 rounded hover:bg-yellow-300 dark:hover:bg-yellow-700 transition-colors"
          aria-label={isExpanded ? "Minimizar" : "Expandir"}
        >
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4 text-yellow-900 dark:text-yellow-100" />
          ) : (
            <ChevronUpIcon className="h-4 w-4 text-yellow-900 dark:text-yellow-100" />
          )}
        </button>
      </div>

      {/* Conteúdo - Expansível */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-4 pb-4 max-w-md text-xs font-mono">
          <div className="mb-2 text-red-600 dark:text-red-400 text-[10px] font-semibold">
            ⚠️ REMOVER EM PRODUÇÃO
          </div>
          
          <div className="space-y-1 text-yellow-800 dark:text-yellow-200">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4">
                <span className="font-semibold">{key}:</span>
                <span className="break-all text-right">{value || '❌ undefined'}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-2 border-t border-yellow-500">
            <div className="text-yellow-800 dark:text-yellow-200">
              <strong>Mode:</strong> {import.meta.env.MODE}
            </div>
            <div className="text-yellow-800 dark:text-yellow-200">
              <strong>Dev:</strong> {import.meta.env.DEV ? 'Sim' : 'Não'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvDebug;

