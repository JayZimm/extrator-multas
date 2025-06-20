import React from 'react';

const StatusBadge = ({ status, className = "" }) => {
  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return {
          text: 'Concluído',
          classes: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };
      case 'processing':
      case 'running':
        return {
          text: 'Processando',
          classes: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        };
      case 'error':
      case 'failed':
        return {
          text: 'Erro',
          classes: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
      case 'pending':
        return {
          text: 'Pendente',
          classes: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        };
      case 'cancelled':
        return {
          text: 'Cancelado',
          classes: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        };
      default:
        return {
          text: status || 'Desconhecido',
          classes: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes} ${className}`}>
      {config.text}
    </span>
  );
};

export default StatusBadge; 