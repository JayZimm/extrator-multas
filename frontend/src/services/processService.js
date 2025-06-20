import processApiInstance from '../config/processApiConfig';

/**
 * Serviço para interagir com a API de processamento
 */
class ProcessService {
  
  /**
   * Inicia o processamento
   * @returns {Promise} Resposta da API
   */
  async startProcessing() {
    try {
      const response = await processApiInstance.post('/process/start');
      return {
        success: true,
        data: response.data,
        message: 'Processamento iniciado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao iniciar processamento:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        message: 'Erro ao iniciar processamento'
      };
    }
  }

  /**
   * Obtém o status atual do processamento
   * @returns {Promise} Status do processamento
   */
  async getProcessStatus() {
    try {
      const response = await processApiInstance.get('/process/status');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Erro ao obter status do processamento:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        message: 'Erro ao obter status do processamento'
      };
    }
  }

  /**
   * Obtém o histórico de processamentos
   * @returns {Promise} Lista de processamentos históricos
   */
  async getProcessHistory() {
    try {
      const response = await processApiInstance.get('/process/history');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Erro ao obter histórico de processamento:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        message: 'Erro ao obter histórico de processamento',
        data: []
      };
    }
  }
}

// Exportar instância única (singleton)
export default new ProcessService(); 