import React, { useState } from 'react';
import {
    ArrowPathIcon,
    TrashIcon,
    ExclamationTriangleIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useProcessedFiles } from '../hooks/useProcessedFiles';
import LoadingSpinner from '../components/LoadingSpinner';
import ProcessedFilesFilters from '../components/ProcessedFilesFilters';

const ProcessedFiles = () => {
    const {
        files,
        isLoading,
        error,
        filters,
        updateFilters,
        clearFilters,
        hasActiveFilters,
        selectedFiles,
        toggleFileSelection,
        selectAllFiles,
        clearSelection,
        isFileSelected,
        hasSelection,
        selectedCount,
        deleteFile,
        deleteSelectedFiles,
        refetch,
        isDeleting,
        isBatchDeleting
    } = useProcessedFiles();

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [deleteSuccess, setDeleteSuccess] = useState(null);

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const handleDeleteClick = (file) => {
        setFileToDelete(file);
        setShowDeleteModal(true);
        setDeleteError(null);
        setDeleteSuccess(null);
    };

    const handleBatchDeleteClick = () => {
        setFileToDelete(null);
        setShowDeleteModal(true);
        setDeleteError(null);
        setDeleteSuccess(null);
    };

    const confirmDelete = async () => {
        try {
            if (fileToDelete) {
                // Exclusão individual
                const result = await deleteFile(fileToDelete.path);
                if (result.success) {
                    setDeleteSuccess(`Arquivo excluído com sucesso! ${result.data.deletedAutosCount} Auto(s) removido(s).`);
                    setTimeout(() => {
                        setShowDeleteModal(false);
                        setDeleteSuccess(null);
                    }, 2000);
                } else {
                    setDeleteError(result.error);
                }
            } else {
                // Exclusão em lote
                const result = await deleteSelectedFiles();
                if (result.success) {
                    const totalDeleted = result.data.results.reduce((sum, r) => sum + (r.deletedAutosCount || 0), 0);
                    setDeleteSuccess(`${result.data.successCount} arquivo(s) excluído(s)! ${totalDeleted} Auto(s) removido(s).`);
                    setTimeout(() => {
                        setShowDeleteModal(false);
                        setDeleteSuccess(null);
                    }, 2000);
                } else {
                    setDeleteError(result.error);
                }
            }
        } catch (error) {
            setDeleteError(error.message);
        }
    };

    const allSelected = files.length > 0 && selectedFiles.length === files.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Arquivos Processados
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Gerencie arquivos que já foram processados e seus Autos de Infração relacionados.
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    {hasSelection && (
                        <>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedCount} selecionado(s)
                            </span>
                            <button
                                onClick={clearSelection}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            >
                                Limpar
                            </button>
                            <button
                                onClick={handleBatchDeleteClick}
                                disabled={isBatchDeleting}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                <TrashIcon className="h-4 w-4 mr-2" />
                                Excluir Selecionados
                            </button>
                        </>
                    )}

                    <button
                        onClick={refetch}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Filtros */}
            <ProcessedFilesFilters
                filters={filters}
                onFilterChange={updateFilters}
                onClearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
            />

            {/* Tabela */}
            <div className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-800 dark:text-red-200">{error.message || error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="p-8">
                        <LoadingSpinner size="lg" text="Carregando arquivos processados..." />
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-12">
                        <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">
                            Nenhum arquivo processado encontrado
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                            Os arquivos processados aparecerão aqui
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={() => allSelected ? clearSelection() : selectAllFiles()}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Nome do Arquivo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Autos Gerados
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Data de Processamento
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status GCS
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                                {files.map((file) => (
                                    <tr key={file.path} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="checkbox"
                                                checked={isFileSelected(file.path)}
                                                onChange={() => toggleFileSelection(file.path)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {file.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                {file.autosCount} Auto(s)
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {formatDateTime(file.processedAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {file.existsInGCS ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    Existe
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                    Não encontrado
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleDeleteClick(file)}
                                                disabled={isDeleting}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Confirmação */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                Confirmar Exclusão
                            </h3>
                        </div>

                        {deleteSuccess ? (
                            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                                <p className="text-sm text-green-800 dark:text-green-200">{deleteSuccess}</p>
                            </div>
                        ) : deleteError ? (
                            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                                <p className="text-sm text-red-800 dark:text-red-200">{deleteError}</p>
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {fileToDelete ? (
                                        <>
                                            Tem certeza que deseja excluir o arquivo <strong>{fileToDelete.name}</strong>?
                                            <br /><br />
                                            Esta ação irá:
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                <li>Excluir o arquivo físico do Google Cloud Storage</li>
                                                <li>Excluir {fileToDelete.autosCount} Auto(s) de Infração relacionado(s)</li>
                                                <li>Excluir registros de histórico de processamento</li>
                                            </ul>
                                            <br />
                                            <strong className="text-red-600 dark:text-red-400">Esta ação não pode ser desfeita!</strong>
                                        </>
                                    ) : (
                                        <>
                                            Tem certeza que deseja excluir <strong>{selectedCount} arquivo(s)</strong> selecionado(s)?
                                            <br /><br />
                                            Esta ação irá excluir permanentemente:
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                <li>Todos os arquivos físicos do Google Cloud Storage</li>
                                                <li>Todos os Autos de Infração relacionados</li>
                                                <li>Todos os registros de histórico de processamento</li>
                                            </ul>
                                            <br />
                                            <strong className="text-red-600 dark:text-red-400">Esta ação não pode ser desfeita!</strong>
                                        </>
                                    )}
                                </p>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        disabled={isDeleting || isBatchDeleting}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={isDeleting || isBatchDeleting}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                    >
                                        {isDeleting || isBatchDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessedFiles;
