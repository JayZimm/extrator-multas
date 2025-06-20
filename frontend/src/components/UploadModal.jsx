import React, { useState, useRef, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { 
  XMarkIcon, 
  ArrowUpTrayIcon, 
  DocumentIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { useFileUpload } from '../hooks/useStorage';
import { StorageService } from '../services/storageService';

export default function UploadModal({ isOpen, onClose, currentPath }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  
  const { mutateAsync: uploadFiles, isPending, uploadProgress } = useFileUpload();

  // Reset quando modal abre/fecha
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setError('');
    }
  }, [isOpen]);

  const validateFiles = (files) => {
    const errors = [];
    const maxSize = 50 * 1024 * 1024; // 50MB
    const maxFiles = 10;
    
    if (files.length > maxFiles) {
      errors.push(`Máximo de ${maxFiles} arquivos por vez`);
    }
    
    files.forEach((file, index) => {
      if (file.size > maxSize) {
        errors.push(`Arquivo "${file.name}" é muito grande (máx: 50MB)`);
      }
    });
    
    return errors;
  };

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validationErrors = validateFiles(fileArray);
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }
    
    setError('');
    setSelectedFiles(fileArray);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files?.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files?.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setError('');
      console.log('🚀 Iniciando upload:', {
        files: selectedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
        destinationPath: currentPath
      });
      
      const result = await uploadFiles({
        files: selectedFiles,
        destinationPath: currentPath
      });
      
      console.log('✅ Upload concluído:', result);
      
      // Sucesso - fechar modal
      onClose();
    } catch (error) {
      console.error('❌ Erro no upload:', error);
      setError(error.message);
    }
  };

  const formatFileSize = (bytes) => StorageService.formatFileSize(bytes);

  const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-25" aria-hidden="true" />

      {/* Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center">
              <ArrowUpTrayIcon className="h-6 w-6 text-blue-600 mr-3" />
              <Dialog.Title className="text-lg font-medium text-gray-900">
                Upload de Arquivos
              </Dialog.Title>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Localização */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload para:
              </label>
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                {currentPath || 'Raiz'}
              </div>
            </div>

            {/* Área de drop */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900">
                  Arraste arquivos aqui ou{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="text-blue-600 hover:text-blue-700 focus:outline-none disabled:opacity-50"
                  >
                    selecione do computador
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Máximo 10 arquivos, 50MB cada
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                disabled={isPending}
                className="hidden"
                accept="image/*,application/pdf,text/*,.csv,.xlsx,.xls,.doc,.docx,.zip,.rar"
              />
            </div>

            {/* Lista de arquivos selecionados */}
            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">
                    Arquivos selecionados ({selectedFiles.length})
                  </h4>
                  <div className="text-sm text-gray-500">
                    Total: {formatFileSize(totalSize)}
                  </div>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center min-w-0 flex-1">
                        <DocumentIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • {file.type || 'Tipo desconhecido'}
                          </p>
                        </div>
                      </div>
                      
                      {!isPending && (
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="ml-3 text-gray-400 hover:text-red-600 focus:outline-none"
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Barra de progresso */}
            {isPending && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Enviando arquivos...
                  </span>
                  <span className="text-sm text-gray-500">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Informações */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Tipos aceitos:</strong> Imagens, PDFs, documentos do Office, arquivos de texto, planilhas e arquivos compactados.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={isPending || selectedFiles.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </div>
              ) : (
                `Upload ${selectedFiles.length ? `(${selectedFiles.length})` : ''}`
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 