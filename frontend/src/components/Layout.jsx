import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Bars3Icon, 
  SunIcon, 
  MoonIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import TesteDiagnostico from './TesteDiagnostico';
import { useSidebar } from '../hooks/useSidebar';

const Layout = () => {
  const { isOpen, isMobile, toggle, close } = useSidebar();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [showDiagnostico, setShowDiagnostico] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex">
      {/* Sidebar */}
      <div className={`${isOpen && !isMobile ? 'w-64' : 'w-0'} transition-all duration-300 ease-in-out flex-shrink-0`}>
        <Sidebar 
          isOpen={isOpen} 
          onClose={close} 
          isMobile={isMobile} 
        />
      </div>
      
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Lado Esquerdo */}
              <div className="flex items-center space-x-4">
                {/* Botão do Menu */}
                <button
                  onClick={toggle}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Toggle sidebar"
                >
                  <Bars3Icon className="h-6 w-6" />
                </button>
                
                {/* Título da Página */}
                <div className="hidden sm:block">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Sistema ANTT - Análise de Multas
                  </h1>
                </div>
              </div>

              {/* Lado Direito */}
              <div className="flex items-center space-x-2">
                {/* Botão de Diagnóstico */}
                <button
                  onClick={() => setShowDiagnostico(!showDiagnostico)}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 relative focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Ferramentas de diagnóstico"
                >
                  <Cog6ToothIcon className="h-6 w-6" />
                  {showDiagnostico && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full"></span>
                  )}
                </button>
                
                {/* Botão do Tema */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title={darkMode ? "Modo claro" : "Modo escuro"}
                >
                  {darkMode ? (
                    <SunIcon className="h-6 w-6" />
                  ) : (
                    <MoonIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo da Página */}
        <main className="flex-1">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Componente de Diagnóstico */}
      {showDiagnostico && <TesteDiagnostico />}
    </div>
  );
};

export default Layout; 