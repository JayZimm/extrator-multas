import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import processedFilesService from '../services/processedFilesService';

/**
 * Hook customizado para gerenciar arquivos processados
 */
export function useProcessedFiles() {
    const queryClient = useQueryClient();
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [filters, setFilters] = useState({
        fileName: '',
        infrator: '',
        dataExpedicaoInicio: '',
        dataExpedicaoFim: '',
        dataEmissaoInicio: '',
        dataEmissaoFim: ''
    });

    // Query para listar arquivos processados com filtros
    const {
        data: files = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: ['processedFiles', filters],
        queryFn: async () => {
            const result = await processedFilesService.listProcessedFiles(filters);
            if (result.success) {
                return result.data;
            }
            throw new Error(result.error);
        },
        refetchOnWindowFocus: false,
        staleTime: 30000 // 30 segundos
    });

    // Mutation para excluir arquivo individual
    const deleteMutation = useMutation({
        mutationFn: (filePath) => processedFilesService.deleteFile(filePath),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['processedFiles'] });
            queryClient.invalidateQueries({ queryKey: ['autos'] }); // Atualizar lista de autos também
        }
    });

    // Mutation para exclusão em lote
    const batchDeleteMutation = useMutation({
        mutationFn: (filePaths) => processedFilesService.batchDelete(filePaths),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['processedFiles'] });
            queryClient.invalidateQueries({ queryKey: ['autos'] });
            setSelectedFiles([]); // Limpar seleção após exclusão
        }
    });

    // Funções de seleção
    const toggleFileSelection = useCallback((filePath) => {
        setSelectedFiles(prev =>
            prev.includes(filePath)
                ? prev.filter(p => p !== filePath)
                : [...prev, filePath]
        );
    }, []);

    const selectAllFiles = useCallback(() => {
        setSelectedFiles(files.map(f => f.path));
    }, [files]);

    const clearSelection = useCallback(() => {
        setSelectedFiles([]);
    }, []);

    const isFileSelected = useCallback((filePath) => {
        return selectedFiles.includes(filePath);
    }, [selectedFiles]);

    // Funções de exclusão
    const deleteFile = useCallback(async (filePath) => {
        return await deleteMutation.mutateAsync(filePath);
    }, [deleteMutation]);

    const deleteSelectedFiles = useCallback(async () => {
        if (selectedFiles.length === 0) {
            throw new Error('Nenhum arquivo selecionado');
        }
        return await batchDeleteMutation.mutateAsync(selectedFiles);
    }, [selectedFiles, batchDeleteMutation]);

    // Funções de filtro
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({
            fileName: '',
            infrator: '',
            dataExpedicaoInicio: '',
            dataExpedicaoFim: '',
            dataEmissaoInicio: '',
            dataEmissaoFim: ''
        });
    }, []);

    const hasActiveFilters = useCallback(() => {
        return Object.values(filters).some(value => value !== '');
    }, [filters]);

    return {
        // Dados
        files,
        isLoading,
        error,

        // Filtros
        filters,
        updateFilters,
        clearFilters,
        hasActiveFilters: hasActiveFilters(),

        // Seleção
        selectedFiles,
        toggleFileSelection,
        selectAllFiles,
        clearSelection,
        isFileSelected,
        hasSelection: selectedFiles.length > 0,
        selectedCount: selectedFiles.length,

        // Ações
        deleteFile,
        deleteSelectedFiles,
        refetch,

        // Estados de loading
        isDeleting: deleteMutation.isPending,
        isBatchDeleting: batchDeleteMutation.isPending
    };
}
