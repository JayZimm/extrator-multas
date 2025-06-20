import axios from './axiosConfig';

/**
 * Script para testar conexão com o backend
 * 
 * Como usar:
 * 1. Importe este arquivo em um componente temporário ou no console do navegador
 * 2. Execute testarConexao() para verificar a conectividade básica
 * 3. Execute testarFiltro('termo') para testar o filtro específico
 */

// Teste básico de conectividade
export async function testarConexao() {
  console.log('Iniciando teste de conexão com o backend...');
  try {
    const response = await axios.get('/api/status');
    console.log('Conexão estabelecida com sucesso!', response.data);
    return { sucesso: true, dados: response.data };
  } catch (error) {
    console.error('Falha ao conectar com o backend:', error);
    return { 
      sucesso: false, 
      erro: error.message,
      detalhes: error.response?.data || 'Sem resposta do servidor'
    };
  }
}

// Teste específico para o filtro de autos
export async function testarFiltro(termo) {
  console.log(`Iniciando teste de filtro com termo "${termo}"...`);
  try {
    const params = {
      page: 1,
      limit: 5,
      search: termo,
      _t: new Date().getTime()
    };
    
    console.log('Parâmetros enviados:', params);
    
    const response = await axios.get('/api/autos', {
      params
    });
    
    console.log('Resposta recebida do teste de filtro:', response.data);
    return { 
      sucesso: true, 
      total: response.data.total,
      autos: response.data.autos,
      filtros: response.data.filtros_aplicados
    };
  } catch (error) {
    console.error('Falha ao testar filtro:', error);
    return { 
      sucesso: false, 
      erro: error.message,
      detalhes: error.response?.data || 'Sem resposta do servidor'
    };
  }
}

// Testar consulta diretamente ao MongoDB (requer implementação no backend)
export async function testarConsultaDireta(termo) {
  console.log(`Iniciando teste de consulta direta com termo "${termo}"...`);
  try {
    const response = await axios.get('/api/autos/teste-direto', {
      params: {
        termo,
        _t: new Date().getTime()
      }
    });
    
    console.log('Resposta da consulta direta:', response.data);
    return { 
      sucesso: true, 
      resultados: response.data
    };
  } catch (error) {
    console.error('Falha na consulta direta:', error);
    return { 
      sucesso: false, 
      erro: error.message,
      detalhes: error.response?.data || 'Sem resposta do servidor'
    };
  }
}

// Testar CORS especificamente
export async function testarCORS() {
  console.log('Iniciando teste específico de CORS...');
  try {
    const response = await axios.get('/api/cors-test');
    console.log('Teste de CORS bem-sucedido:', response.data);
    return { 
      sucesso: true, 
      dados: response.data
    };
  } catch (error) {
    console.error('Falha no teste de CORS:', error);
    return { 
      sucesso: false, 
      erro: error.message,
      detalhes: error.response?.data || 'Sem resposta do servidor'
    };
  }
}

// Para facilitar o uso no console do navegador
window.testarAPI = {
  conexao: testarConexao,
  filtro: testarFiltro,
  consultaDireta: testarConsultaDireta,
  cors: testarCORS
};