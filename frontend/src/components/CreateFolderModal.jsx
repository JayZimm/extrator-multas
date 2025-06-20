import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, FolderPlusIcon } from '@heroicons/react/24/outline';
import { useCreateFolder } from '../hooks/useStorage';
import { StorageService } from '../services/storageService';

export default function CreateFolderModal({ isOpen, onClose, currentPath }) {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  
  const createFolderMutation = useCreateFolder();

  // Reset form quando modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setError('');
      // Focus no input após a animação do modal
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!folderName.trim()) {
      setError('Nome da pasta é obrigatório');
      return;
    }

    if (!StorageService.isValidName(folderName)) {
      setError('Nome contém caracteres inválidos. Use apenas letras, números, hífens e sublinhados.');
      return;
    }

    if (folderName.length > 100) {
      setError('Nome da pasta deve ter no máximo 100 caracteres');
      return;
    }

    try {
      // Construir caminho completo da nova pasta
      const fullPath = currentPath 
        ? `${currentPath}${folderName.trim()}/`
        : `${folderName.trim()}/`;

      await createFolderMutation.mutateAsync(fullPath);
      
      // Sucesso - fechar modal
      onClose();
      setFolderName('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <FolderPlusIcon className="h-6 w-6 text-blue-600 mr-3" />
              <Dialog.Title className="text-lg font-medium text-gray-900">
                Nova Pasta
              </Dialog.Title>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {/* Localização atual */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Criar em:
                </label>
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                  {currentPath || 'Raiz'}
                </div>
              </div>

              {/* Nome da pasta */}
              <div className="mb-4">
                <label htmlFor="folderName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da pasta <span className="text-red-500">*</span>
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  id="folderName"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite o nome da pasta"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  maxLength={100}
                  disabled={createFolderMutation.isPending}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Máximo 100 caracteres. Evite caracteres especiais.
                </p>
              </div>

              {/* Erro */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Dica */}
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Dica:</strong> A pasta será criada como um objeto no Google Cloud Storage terminado em "/".
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
              <button
                type="button"
                onClick={onClose}
                disabled={createFolderMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createFolderMutation.isPending || !folderName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createFolderMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Criando...
                  </div>
                ) : (
                  'Criar Pasta'
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 