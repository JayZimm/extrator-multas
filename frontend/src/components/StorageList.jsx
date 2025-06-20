import React from 'react';
import {
  FolderIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { StorageService } from '../services/storageService';

const iconMap = {
  FolderIcon,
  DocumentIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ArchiveBoxIcon
};

export default function StorageList({
  items,
  selectedItems,
  onItemClick,
  onItemSelect,
  onItemDoubleClick
}) {
  const getItemIcon = (item) => {
    const iconName = StorageService.getFileIcon(item.mimeType);
    const IconComponent = iconMap[iconName] || DocumentIcon;
    
    return (
      <IconComponent 
        className={`h-5 w-5 ${
          item.type === 'folder' 
            ? 'text-blue-500' 
            : 'text-gray-400'
        }`} 
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  };

  const isSelected = (item) => selectedItems.includes(item.path);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {/* Header da tabela (apenas visível em telas maiores) */}
      <div className="hidden sm:block bg-gray-50 border-b border-gray-200">
        <div className="px-4 py-2 flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-8 mr-3"></div> {/* Espaço para checkbox */}
            <div className="w-6 mr-3"></div> {/* Espaço para ícone */}
            <div className="min-w-0 flex-1">Nome</div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="w-20 text-right">Tamanho</div>
            <div className="hidden md:block w-32 text-right">Modificado</div>
            <div className="hidden lg:block w-24 text-right">Tipo</div>
          </div>
        </div>
      </div>

      <ul role="list" className="divide-y divide-gray-200">
        {items.map((item) => (
          <li
            key={item.path}
            className={`transition-colors duration-200 ${
              isSelected(item) ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div
              className="px-4 py-4 flex items-center justify-between cursor-pointer"
              onClick={(e) => {
                if (e.detail === 1) {
                  // Single click
                  setTimeout(() => {
                    if (e.detail === 1) {
                      onItemClick(item);
                    }
                  }, 200);
                }
              }}
              onDoubleClick={() => onItemDoubleClick(item)}
            >
              <div className="flex items-center min-w-0 flex-1">
                {/* Checkbox */}
                <div className="flex-shrink-0 mr-3">
                  <input
                    type="checkbox"
                    checked={isSelected(item)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onItemSelect(item.path);
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                {/* Ícone */}
                <div className="flex-shrink-0 mr-3">
                  {getItemIcon(item)}
                </div>

                {/* Nome e detalhes */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.type === 'folder' ? 'Pasta' : item.mimeType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações à direita */}
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                {/* Tamanho */}
                <div className="hidden sm:block w-20 text-right">
                  {item.type === 'file' ? StorageService.formatFileSize(item.size) : '-'}
                </div>

                {/* Data de modificação */}
                <div className="hidden md:block w-32 text-right">
                  {formatDate(item.timeUpdated)}
                </div>

                {/* Tipo */}
                <div className="hidden lg:block w-24 text-right">
                  {item.type === 'folder' ? 'Pasta' : 'Arquivo'}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 