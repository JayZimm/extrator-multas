import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import storageService from '../services/storageService';

/**
 * Hook para listagem de objetos do storage
 * @param {string} prefix - Prefixo da pasta atual
 * @param {number} page - Página atual
 * @param {number} limit - Limite de itens por página
 */
export function useStorageList(prefix = '', page = 1, limit = 50) {
  return useQuery({
    queryKey: ['storage', 'list', prefix, page, limit],
    queryFn: () => storageService.listObjects(prefix, page, limit),
    staleTime: 30000, // 30 segundos
    retry: 2,
    retryDelay: 1000
  });
}

/**
 * Hook para criar pasta
 */
export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderPath) => storageService.createFolder(folderPath),
    onSuccess: () => {
      // Invalidar todas as consultas de listagem para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['storage', 'list'] });
    }
  });
}

/**
 * Hook para upload de arquivos com progresso
 */
export function useFileUpload() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: ({ files, destinationPath }) => 
      storageService.uploadFiles(files, destinationPath, setUploadProgress),
    onSuccess: () => {
      setUploadProgress(0);
      queryClient.invalidateQueries({ queryKey: ['storage', 'list'] });
    },
    onError: () => {
      setUploadProgress(0);
    }
  });

  return {
    ...mutation,
    uploadProgress
  };
}

/**
 * Hook para exclusão de objetos
 */
export function useDeleteObject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (objectPath) => storageService.deleteObject(objectPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storage', 'list'] });
    }
  });
}

/**
 * Hook para gerar URL de download
 */
export function useDownloadUrl() {
  return useMutation({
    mutationFn: ({ filePath, expiresInMinutes = 60 }) => 
      storageService.getDownloadUrl(filePath, expiresInMinutes)
  });
}

/**
 * Hook para verificar saúde do serviço
 */
export function useStorageHealth() {
  return useQuery({
    queryKey: ['storage', 'health'],
    queryFn: () => storageService.checkHealth(),
    refetchInterval: 60000, // Refetch a cada minuto
    retry: 1
  });
}

/**
 * Hook personalizado para navegação em pastas
 */
export function useStorageNavigation() {
  const [currentPath, setCurrentPath] = useState('');
  const [pathHistory, setPathHistory] = useState(['']);

  const navigateToFolder = (folderPath) => {
    setPathHistory(prev => [...prev, folderPath]);
    setCurrentPath(folderPath);
  };

  const navigateUp = () => {
    if (pathHistory.length > 1) {
      const newHistory = pathHistory.slice(0, -1);
      setPathHistory(newHistory);
      setCurrentPath(newHistory[newHistory.length - 1]);
    }
  };

  const navigateToRoot = () => {
    setPathHistory(['']);
    setCurrentPath('');
  };

  const getCurrentFolderName = () => {
    if (!currentPath) return 'Raiz';
    const parts = currentPath.split('/').filter(Boolean);
    return parts[parts.length - 1] || 'Raiz';
  };

  const getBreadcrumbs = () => {
    if (!currentPath) return [{ name: 'Raiz', path: '' }];
    
    const parts = currentPath.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Raiz', path: '' }];
    
    let currentBreadcrumbPath = '';
    parts.forEach(part => {
      currentBreadcrumbPath += part + '/';
      breadcrumbs.push({
        name: part,
        path: currentBreadcrumbPath
      });
    });
    
    return breadcrumbs;
  };

  return {
    currentPath,
    pathHistory,
    navigateToFolder,
    navigateUp,
    navigateToRoot,
    getCurrentFolderName,
    getBreadcrumbs,
    canNavigateUp: pathHistory.length > 1
  };
}

/**
 * Hook para gerenciar seleção de múltiplos itens
 */
export function useItemSelection() {
  const [selectedItems, setSelectedItems] = useState(new Set());

  const toggleItem = (itemPath) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(itemPath)) {
        newSelection.delete(itemPath);
      } else {
        newSelection.add(itemPath);
      }
      return newSelection;
    });
  };

  const selectAll = (items) => {
    setSelectedItems(new Set(items.map(item => item.path)));
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const isSelected = (itemPath) => {
    return selectedItems.has(itemPath);
  };

  return {
    selectedItems: Array.from(selectedItems),
    selectedCount: selectedItems.size,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected
  };
}

/**
 * Hook para gerenciar modais e estados da UI
 */
export function useStorageUI() {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const openCreateFolderModal = () => setShowCreateFolderModal(true);
  const closeCreateFolderModal = () => setShowCreateFolderModal(false);
  
  const openUploadModal = () => setShowUploadModal(true);
  const closeUploadModal = () => setShowUploadModal(false);

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  return {
    showCreateFolderModal,
    showUploadModal,
    isDragOver,
    viewMode,
    openCreateFolderModal,
    closeCreateFolderModal,
    openUploadModal,
    closeUploadModal,
    setIsDragOver,
    toggleViewMode
  };
} 