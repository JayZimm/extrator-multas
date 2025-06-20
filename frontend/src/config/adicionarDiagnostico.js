import React from 'react';
import ReactDOM from 'react-dom';
import TesteDiagnostico from '../components/TesteDiagnostico';

/**
 * Script para adicionar o componente de diagnóstico à aplicação em runtime
 * Para usar, adicione este código ao console:
 * import('./src/config/adicionarDiagnostico').then(m => m.adicionarDiagnostico())
 */

export const adicionarDiagnostico = () => {
  // Criar um container para o componente
  const diagnosticoContainer = document.createElement('div');
  diagnosticoContainer.id = 'diagnostico-container';
  document.body.appendChild(diagnosticoContainer);
  
  // Renderizar o componente
  ReactDOM.render(React.createElement(TesteDiagnostico), diagnosticoContainer);
  
  console.log('Componente de diagnóstico adicionado com sucesso!');
  console.log('Para remover, execute: document.getElementById("diagnostico-container").remove()');
  
  return {
    remover: () => {
      const container = document.getElementById('diagnostico-container');
      if (container) {
        ReactDOM.unmountComponentAtNode(container);
        container.remove();
        console.log('Componente de diagnóstico removido.');
      }
    }
  };
};

// Para facilitar o uso no console do navegador
window.adicionarDiagnostico = adicionarDiagnostico; 