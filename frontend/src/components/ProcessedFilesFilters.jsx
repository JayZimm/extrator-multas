import React, { useState } from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ProcessedFilesFilters = ({ filters, onFilterChange, onClearFilters, hasActiveFilters }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleInputChange = (field, value) => {
        onFilterChange({ [field]: value });
    };

    return (
        <div className="bg-white dark:bg-dark-card rounded-lg shadow mb-4">
            {/* Header do Filtro */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            Filtros Avançados
                        </h3>
                        {hasActiveFilters && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                Ativos
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center"
                            >
                                <XMarkIcon className="h-4 w-4 mr-1" />
                                Limpar Filtros
                            </button>
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            {isExpanded ? 'Recolher' : 'Expandir'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Corpo do Filtro */}
            {isExpanded && (
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Nome do Arquivo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nome do Arquivo
                            </label>
                            <input
                                type="text"
                                value={filters.fileName}
                                onChange={(e) => handleInputChange('fileName', e.target.value)}
                                placeholder="Buscar por nome..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                            />
                        </div>

                        {/* Infrator */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Infrator
                            </label>
                            <input
                                type="text"
                                value={filters.infrator}
                                onChange={(e) => handleInputChange('infrator', e.target.value)}
                                placeholder="Nome do infrator..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                            />
                        </div>

                        {/* Data Expedição Início */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data Expedição (Início)
                            </label>
                            <input
                                type="date"
                                value={filters.dataExpedicaoInicio}
                                onChange={(e) => handleInputChange('dataExpedicaoInicio', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                            />
                        </div>

                        {/* Data Expedição Fim */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data Expedição (Fim)
                            </label>
                            <input
                                type="date"
                                value={filters.dataExpedicaoFim}
                                onChange={(e) => handleInputChange('dataExpedicaoFim', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                            />
                        </div>

                        {/* Data Emissão Início */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data Emissão (Início)
                            </label>
                            <input
                                type="date"
                                value={filters.dataEmissaoInicio}
                                onChange={(e) => handleInputChange('dataEmissaoInicio', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                            />
                        </div>

                        {/* Data Emissão Fim */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Data Emissão (Fim)
                            </label>
                            <input
                                type="date"
                                value={filters.dataEmissaoFim}
                                onChange={(e) => handleInputChange('dataEmissaoFim', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    {/* Informação sobre filtros */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                            💡 <strong>Dica:</strong> Você pode combinar múltiplos filtros simultaneamente. Os resultados serão atualizados automaticamente.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessedFilesFilters;
