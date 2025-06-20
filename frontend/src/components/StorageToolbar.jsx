import React from 'react';
import {
  ArrowUpIcon,
  FolderPlusIcon,
  ArrowUpTrayIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function StorageToolbar({
  currentPath,
  canNavigateUp,
  selectedCount,
  viewMode,
  onNavigateUp,
  onCreateFolder,
  onUpload,
  onToggleView,
  onClearSelection,
  onDelete,
  isDeleting = false
}) {
  return (
    <div className="border-b border-gray-200 pb-4">
      <div className="flex items-center justify-between">
        {/* Lado esquerdo - Navegação e ações principais */}
        <div className="flex items-center space-x-2">
          {/* Botão Voltar */}
          <button
            type="button"
            onClick={onNavigateUp}
            disabled={!canNavigateUp}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              canNavigateUp
                ? 'text-gray-700 bg-white hover:bg-gray-50'
                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
            }`}
          >
            <ArrowUpIcon className="h-4 w-4 mr-2" />
            Voltar
          </button>

          {/* Separador */}
          <div className="hidden sm:block w-px h-6 bg-gray-300" />

          {/* Botão Criar Pasta */}
          <button
            type="button"
            onClick={onCreateFolder}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FolderPlusIcon className="h-4 w-4 mr-2" />
            Nova Pasta
          </button>

          {/* Botão Upload */}
          <button
            type="button"
            onClick={onUpload}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
            Upload
          </button>

          {/* Ações para itens selecionados */}
          {selectedCount > 0 && (
            <>
              <div className="hidden sm:block w-px h-6 bg-gray-300" />
              
              <span className="text-sm text-gray-500">
                {selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
              
              <button
                type="button"
                onClick={onClearSelection}
                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-gray-500 hover:text-gray-700"
              >
                Limpar seleção
              </button>
              
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                className={`inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                  isDeleting 
                    ? 'text-red-400 bg-gray-100 cursor-not-allowed'
                    : 'text-red-700 bg-white hover:bg-red-50'
                }`}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Excluindo...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Excluir
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Lado direito - Controles de visualização */}
        <div className="flex items-center space-x-2">
          {/* Caminho atual (versão compacta) */}
          <div className="hidden lg:block text-sm text-gray-500 max-w-md truncate">
            {currentPath || 'Raiz'}
          </div>

          {/* Toggle de visualização */}
          <div className="flex items-center bg-gray-100 rounded-md p-1">
            <button
              type="button"
              onClick={() => viewMode !== 'grid' && onToggleView()}
              className={`p-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Visualização em grade"
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            
            <button
              type="button"
              onClick={() => viewMode !== 'list' && onToggleView()}
              className={`p-1.5 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Visualização em lista"
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Informações adicionais (mobile) */}
      <div className="mt-2 lg:hidden">
        <div className="text-sm text-gray-500 truncate">
          <span className="font-medium">Pasta atual:</span> {currentPath || 'Raiz'}
        </div>
      </div>
    </div>
  );
} 