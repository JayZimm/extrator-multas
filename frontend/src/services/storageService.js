import axios from 'axios';

class StorageService {
  /**
   * Lista objetos do bucket com estrutura hierárquica
   * @param {string} prefix - Prefixo para filtrar objetos (pasta)
   * @param {number} page - Número da página
   * @param {number} limit - Limite de itens por página
   * @returns {Promise} Promise com dados da listagem
   */
  async listObjects(prefix = '', page = 1, limit = 50) {
    try {
      const response = await axios.get(`/api/storage/list`, {
        params: { prefix, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar objetos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cria uma nova pasta no bucket
   * @param {string} folderPath - Caminho completo da nova pasta
   * @returns {Promise} Promise com resultado da operação
   */
  async createFolder(folderPath) {
    try {
      const response = await axios.post(`/api/storage/folder`, {
        path: folderPath
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Faz upload de arquivos
   * @param {FileList|File[]} files - Arquivos para upload
   * @param {string} destinationPath - Caminho de destino no bucket
   * @param {Function} onProgress - Callback para progresso (opcional)
   * @returns {Promise} Promise com resultado do upload
   */
  async uploadFiles(files, destinationPath = '', onProgress) {
    try {
      console.log('📤 StorageService.uploadFiles chamado:', {
        filesCount: files.length,
        destinationPath,
        hasProgressCallback: !!onProgress
      });

      const formData = new FormData();
      
      // Adicionar arquivos ao FormData
      Array.from(files).forEach((file, index) => {
        console.log(`📁 Adicionando arquivo ${index + 1}:`, {
          name: file.name,
          type: file.type,
          size: file.size
        });
        formData.append('files', file);
      });
      
      // Adicionar caminho de destino se fornecido
      if (destinationPath) {
        formData.append('path', destinationPath);
        console.log('📂 Caminho de destino:', destinationPath);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      // Adicionar callback de progresso se fornecido
      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log('📊 Progresso do upload:', progress + '%');
          onProgress(progress);
        };
      }

      console.log('🌐 Fazendo requisição POST para /api/storage/upload');
      const response = await axios.post(`/api/storage/upload`, formData, config);
      
      console.log('📨 Resposta recebida:', response.data);
      return response.data;
    } catch (error) {
      console.error('💥 Erro no storageService.uploadFiles:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw this.handleError(error);
    }
  }

  /**
   * Exclui um arquivo ou pasta
   * @param {string} objectPath - Caminho do objeto a ser excluído
   * @returns {Promise} Promise com resultado da operação
   */
  async deleteObject(objectPath) {
    try {
      const response = await axios.delete(`/api/storage/object`, {
        data: { path: objectPath }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir objeto:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Gera URL para download de arquivo
   * @param {string} filePath - Caminho do arquivo
   * @param {number} expiresInMinutes - Tempo de expiração em minutos
   * @returns {Promise} Promise com URL de download
   */
  async getDownloadUrl(filePath, expiresInMinutes = 60) {
    try {
      const encodedPath = encodeURIComponent(filePath);
      const response = await axios.get(`/api/storage/download/${encodedPath}`, {
        params: { expires: expiresInMinutes }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar URL de download:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verifica a conectividade com o Google Cloud Storage
   * @returns {Promise} Promise com status da conexão
   */
  async checkHealth() {
    try {
      const response = await axios.get(`/api/storage/health`);
      return response.data;
    } catch (error) {
      console.error('Erro na verificação de saúde:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Trata erros da API e retorna mensagem amigável
   * @param {Error} error - Erro da requisição
   * @returns {Error} Erro tratado
   */
  handleError(error) {
    if (error.response) {
      // Erro da API
      const { status, data } = error.response;
      const message = data?.message || 'Erro desconhecido do servidor';
      
      switch (status) {
        case 400:
          return new Error(`Dados inválidos: ${message}`);
        case 401:
          return new Error('Não autorizado. Verifique as credenciais.');
        case 403:
          return new Error('Acesso negado. Permissões insuficientes.');
        case 404:
          return new Error('Arquivo ou pasta não encontrado.');
        case 409:
          return new Error('Conflito: Item já existe.');
        case 413:
          return new Error('Arquivo muito grande. Tamanho máximo: 50MB.');
        case 503:
          return new Error('Serviço temporariamente indisponível.');
        default:
          return new Error(`Erro do servidor (${status}): ${message}`);
      }
    } else if (error.request) {
      // Erro de rede
      return new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Erro do cliente
      return new Error(`Erro interno: ${error.message}`);
    }
  }

  /**
   * Formata tamanho de arquivo para exibição
   * @param {number} bytes - Tamanho em bytes
   * @returns {string} Tamanho formatado
   */
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obtém ícone baseado no tipo MIME do arquivo
   * @param {string} mimeType - Tipo MIME do arquivo
   * @returns {string} Nome do ícone
   */
  static getFileIcon(mimeType) {
    if (mimeType === 'folder') return 'FolderIcon';
    
    if (mimeType.startsWith('image/')) return 'PhotoIcon';
    if (mimeType.startsWith('video/')) return 'FilmIcon';
    if (mimeType.startsWith('audio/')) return 'MusicalNoteIcon';
    if (mimeType === 'application/pdf') return 'DocumentTextIcon';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'TableCellsIcon';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'DocumentTextIcon';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'ArchiveBoxIcon';
    
    return 'DocumentIcon';
  }

  /**
   * Valida nome de arquivo/pasta
   * @param {string} name - Nome a ser validado
   * @returns {boolean} True se válido
   */
  static isValidName(name) {
    return /^[\w\-_\s\.]+$/.test(name) && !name.includes('..') && name.length <= 255;
  }
}

export { StorageService };
export default new StorageService(); 