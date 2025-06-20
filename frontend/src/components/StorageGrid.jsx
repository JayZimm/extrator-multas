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

export default function StorageGrid({
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
        className={`h-8 w-8 ${
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {items.map((item) => (
        <div
          key={item.path}
          className={`group relative bg-white p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
            isSelected(item)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
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
          {/* Checkbox de seleção */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
          <div className="flex justify-center mb-3">
            {getItemIcon(item)}
          </div>

          {/* Nome do arquivo/pasta */}
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600">
              {item.name}
            </p>
            
            {/* Informações adicionais */}
            <div className="mt-1 text-xs text-gray-500">
              {item.type === 'file' ? (
                <>
                  <p>{StorageService.formatFileSize(item.size)}</p>
                  <p className="truncate" title={formatDate(item.timeUpdated)}>
                    {formatDate(item.timeUpdated)}
                  </p>
                </>
              ) : (
                <p>Pasta</p>
              )}
            </div>
          </div>

          {/* Overlay de hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-200" />
        </div>
      ))}
    </div>
  );
} 