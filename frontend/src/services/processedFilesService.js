import axios from 'axios';

/**
 * Serviço para gerenciar arquivos processados
 */
class ProcessedFilesService {
    /**
   * Lista todos os arquivos processados com contagem de Autos relacionados
   * @param {Object} filters - Filtros opcionais (fileName, infrator, dataExpedicaoInicio, dataExpedicaoFim, dataEmissaoInicio, dataEmissaoFim)
   * @returns {Promise} Promise com lista de arquivos processados
   */
    async listProcessedFiles(filters = {}) {
        try {
            const params = {};

            // Adicionar filtros aos parâmetros da query
            if (filters.fileName) params.fileName = filters.fileName;
            if (filters.infrator) params.infrator = filters.infrator;
            if (filters.dataExpedicaoInicio) params.dataExpedicaoInicio = filters.dataExpedicaoInicio;
            if (filters.dataExpedicaoFim) params.dataExpedicaoFim = filters.dataExpedicaoFim;
            if (filters.dataEmissaoInicio) params.dataEmissaoInicio = filters.dataEmissaoInicio;
            if (filters.dataEmissaoFim) params.dataEmissaoFim = filters.dataEmissaoFim;

            const response = await axios.get('/api/processed-files/list', { params });
            return {
                success: true,
                data: response.data.data || []
            };
        } catch (error) {
            console.error('Erro ao listar arquivos processados:', error);
            return {
                success: false,
                error: this.handleError(error),
                data: []
            };
        }
    }

    /**
     * Exclui um arquivo processado e seus Autos relacionados
     * @param {string} filePath - Caminho do arquivo a ser excluído
     * @returns {Promise} Promise com resultado da exclusão
     */
    async deleteFile(filePath) {
        try {
            const encodedPath = encodeURIComponent(filePath);
            const response = await axios.delete(`/api/processed-files/${encodedPath}`);
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Erro ao excluir arquivo:', error);
            return {
                success: false,
                error: this.handleError(error)
            };
        }
    }

    /**
     * Exclui múltiplos arquivos em lote
     * @param {string[]} filePaths - Lista de caminhos de arquivos
     * @returns {Promise} Promise com resultado da exclusão em lote
     */
    async batchDelete(filePaths) {
        try {
            const response = await axios.post('/api/processed-files/batch-delete', {
                filePaths
            });
            return {
                success: true,
                data: response.data.data
            };
        } catch (error) {
            console.error('Erro na exclusão em lote:', error);
            return {
                success: false,
                error: this.handleError(error)
            };
        }
    }

    /**
     * Trata erros da API e retorna mensagem amigável
     * @param {Error} error - Erro da requisição
     * @returns {string} Mensagem de erro tratada
     */
    handleError(error) {
        if (error.response) {
            const { status, data } = error.response;
            const message = data?.message || 'Erro desconhecido do servidor';

            switch (status) {
                case 400:
                    return `Dados inválidos: ${message}`;
                case 404:
                    return 'Arquivo não encontrado';
                case 500:
                    return `Erro do servidor: ${message}`;
                default:
                    return `Erro (${status}): ${message}`;
            }
        } else if (error.request) {
            return 'Erro de conexão. Verifique sua internet.';
        } else {
            return `Erro: ${error.message}`;
        }
    }
}

export { ProcessedFilesService };
export default new ProcessedFilesService();
