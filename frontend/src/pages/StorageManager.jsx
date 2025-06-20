import React from 'react';
import { 
  useStorageList, 
  useStorageNavigation, 
  useItemSelection, 
  useStorageUI,
  useDeleteObject
} from '../hooks/useStorage';
import StorageToolbar from '../components/StorageToolbar';
import StorageBreadcrumbs from '../components/StorageBreadcrumbs';
import StorageGrid from '../components/StorageGrid';
import StorageList from '../components/StorageList';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadModal from '../components/UploadModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function StorageManager() {
  const navigation = useStorageNavigation();
  const selection = useItemSelection();
  const ui = useStorageUI();
  const deleteObjectMutation = useDeleteObject();
  
  const { 
    data: storageData, 
    isLoading, 
    error, 
    refetch 
  } = useStorageList(navigation.currentPath, 1, 50);

  // Handlers para drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    ui.setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    ui.setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    ui.setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      ui.openUploadModal();
      // Aqui você pode passar os arquivos para o modal de upload
    }
  };

  // Handler para exclusão de itens selecionados
  const handleDelete = async () => {
    if (selection.selectedCount === 0) return;

    const confirmMessage = selection.selectedCount === 1 
      ? 'Tem certeza que deseja excluir este item?'
      : `Tem certeza que deseja excluir ${selection.selectedCount} itens?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Deletar cada item selecionado
      for (const itemPath of selection.selectedItems) {
        console.log('🗑️ Excluindo item:', itemPath);
        await deleteObjectMutation.mutateAsync(itemPath);
      }
      
      // Limpar seleção após exclusão
      selection.clearSelection();
      
      console.log('✅ Exclusão concluída com sucesso');
    } catch (error) {
      console.error('❌ Erro ao excluir itens:', error);
      alert(`Erro ao excluir itens: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro ao carregar arquivos
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="bg-red-100 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Gerenciador de Arquivos
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie arquivos e pastas no Google Cloud Storage
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <StorageBreadcrumbs 
        breadcrumbs={navigation.getBreadcrumbs()}
        onNavigate={navigation.navigateToFolder}
      />

      {/* Toolbar */}
      <StorageToolbar
        currentPath={navigation.currentPath}
        canNavigateUp={navigation.canNavigateUp}
        selectedCount={selection.selectedCount}
        viewMode={ui.viewMode}
        onNavigateUp={navigation.navigateUp}
        onCreateFolder={ui.openCreateFolderModal}
        onUpload={ui.openUploadModal}
        onToggleView={ui.toggleViewMode}
        onClearSelection={selection.clearSelection}
        onDelete={handleDelete}
        isDeleting={deleteObjectMutation.isPending}
      />

      {/* Área principal com drag and drop */}
      <div
        className={`mt-6 transition-colors duration-200 ${
          ui.isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {ui.viewMode === 'grid' ? (
              <StorageGrid
                items={storageData?.data?.items || []}
                selectedItems={selection.selectedItems}
                onItemClick={(item) => {
                  if (item.type === 'folder') {
                    navigation.navigateToFolder(item.path);
                  }
                }}
                onItemSelect={selection.toggleItem}
                onItemDoubleClick={(item) => {
                  if (item.type === 'file') {
                    // Implementar download
                  }
                }}
              />
            ) : (
              <StorageList
                items={storageData?.data?.items || []}
                selectedItems={selection.selectedItems}
                onItemClick={(item) => {
                  if (item.type === 'folder') {
                    navigation.navigateToFolder(item.path);
                  }
                }}
                onItemSelect={selection.toggleItem}
                onItemDoubleClick={(item) => {
                  if (item.type === 'file') {
                    // Implementar download
                  }
                }}
              />
            )}

            {/* Mensagem quando não há itens */}
            {(!storageData?.data?.items || storageData.data.items.length === 0) && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Nenhum arquivo encontrado
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comece criando uma pasta ou fazendo upload de arquivos.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={ui.openCreateFolderModal}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Criar Pasta
                  </button>
                  <button
                    type="button"
                    onClick={ui.openUploadModal}
                    className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Fazer Upload
                  </button>
                </div>
              </div>
            )}

            {/* Overlay de drag and drop */}
            {ui.isDragOver && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center pointer-events-none">
                <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-dashed border-blue-400">
                  <p className="text-blue-600 font-medium">
                    Solte os arquivos aqui para fazer upload
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modais */}
      <CreateFolderModal
        isOpen={ui.showCreateFolderModal}
        onClose={ui.closeCreateFolderModal}
        currentPath={navigation.currentPath}
      />

      <UploadModal
        isOpen={ui.showUploadModal}
        onClose={ui.closeUploadModal}
        currentPath={navigation.currentPath}
      />
    </div>
  );
} 