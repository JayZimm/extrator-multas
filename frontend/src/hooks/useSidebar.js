import { useState, useEffect } from 'react';

/**
 * Hook para controlar o estado do sidebar
 */
export const useSidebar = () => {
  const [isOpen, setIsOpen] = useState(() => {
    // Verificar se está no localStorage
    const saved = localStorage.getItem('sidebarOpen');
    // No desktop, sidebar fica aberto por padrão
    const defaultOpen = window.innerWidth >= 1024;
    return saved ? JSON.parse(saved) : defaultOpen;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // No mobile, fechar sidebar automaticamente
      if (mobile && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  useEffect(() => {
    // Salvar estado no localStorage
    localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  const toggle = () => setIsOpen(!isOpen);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return {
    isOpen,
    isMobile,
    toggle,
    open,
    close
  };
}; 