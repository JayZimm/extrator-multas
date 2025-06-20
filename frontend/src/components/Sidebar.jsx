import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CogIcon, 
  ChartBarIcon,
  XMarkIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/',
      name: 'Autos de Infração',
      icon: HomeIcon,
      description: 'Consultar e gerenciar autos'
    },
    {
      path: '/process-control',
      name: 'Controle de Processamento',
      icon: CogIcon,
      description: 'Iniciar e monitorar processamento'
    },
    {
      path: '/process-history',
      name: 'Histórico de Processamento',
      icon: ChartBarIcon,
      description: 'Visualizar histórico de processamentos'
    },
    {
      path: '/storage',
      name: 'Gerenciador de Arquivos',
      icon: FolderIcon,
      description: 'Gerenciar documentos e arquivos'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleItemClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`
          ${isMobile ? 'fixed' : 'relative'} ${isMobile ? 'top-0 left-0' : ''} z-50 h-full w-64 bg-white dark:bg-dark-card shadow-lg 
          ${isMobile ? 'transform transition-transform duration-300 ease-in-out' : ''}
          ${isMobile && !isOpen ? '-translate-x-full' : ''}
          ${!isOpen && !isMobile ? 'hidden' : ''}
        `}
      >
        {/* Header do Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ANTT</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Analista Multas
              </h2>
            </div>
          </div>
          
          {/* Botão de fechar (mobile) */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Menu de Navegação */}
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleItemClick}
                    className={`
                      group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                      ${active 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Icon 
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0
                        ${active 
                          ? 'text-blue-700 dark:text-blue-200' 
                          : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300'
                        }
                      `}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs mt-0.5 ${active ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer do Sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <div>Sistema de Análise</div>
            <div>ANTT v1.0</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 