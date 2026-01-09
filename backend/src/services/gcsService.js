import { Storage } from '@google-cloud/storage';
import path from 'path';
import fs from 'fs';

class GCSService {
  constructor() {
    this.storage = null;
    this.bucket = null;
    this.bucketName = process.env.GCS_BUCKET_NAME || 'docsync-anntmultas';
    console.log('Variáveis de ambiente GCS:');
    console.log('GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME);
    console.log('GCS_PROJECT_ID:', process.env.GCS_PROJECT_ID);
    console.log('GCS_KEY_FILE:', process.env.GCS_KEY_FILE);
    this.init();
  }

  /**
   * Inicializa o cliente do Google Cloud Storage
   */
  init() {
    try {
      const keyFilename = process.env.GCS_KEY_FILE || './credentials/docsync-teste-415812-c9cf99db3ee4.json';
      const projectId = process.env.GCS_PROJECT_ID || 'rodoxisto-415812';

      if (!keyFilename || !projectId || !this.bucketName) {
        console.error('Variáveis de ambiente faltando:');
        console.error('keyFilename:', keyFilename);
        console.error('projectId:', projectId);
        console.error('bucketName:', this.bucketName);
        throw new Error('Variáveis de ambiente GCS não configuradas');
      }

      // Verifica se o arquivo de chave existe
      if (!fs.existsSync(keyFilename)) {
        console.error('Caminho do arquivo de chave:', keyFilename);
        console.error('Diretório atual:', process.cwd());
        throw new Error(`Arquivo de chave GCS não encontrado: ${keyFilename}`);
      }

      this.storage = new Storage({
        projectId,
        keyFilename
      });

      this.bucket = this.storage.bucket(this.bucketName);
      console.log(`GCS Service inicializado para bucket: ${this.bucketName}`);
    } catch (error) {
      console.error('Erro ao inicializar GCS Service:', error.message);
      throw error;
    }
  }

  /**
   * Lista objetos do bucket com estrutura hierárquica
   * @param {string} prefix - Prefixo para filtrar objetos (pasta)
   * @param {number} page - Número da página
   * @param {number} limit - Limite de itens por página
   * @returns {Object} Lista de pastas e arquivos com metadata
   */
  async listObjects(prefix = '', page = 1, limit = 50) {
    try {
      const options = {
        prefix: prefix,
        delimiter: '/', // Para simular estrutura de pastas
        maxResults: limit,
        autoPaginate: false
      };

      // Se não é a primeira página, adiciona o token de continuação
      if (page > 1) {
        // Para implementar paginação correta, você precisará armazenar tokens
        // Por simplicidade, vamos usar offset baseado em página
        options.startOffset = (page - 1) * limit;
      }

      const [files, , metadata] = await this.bucket.getFiles(options);

      // Separar pastas (prefixos) e arquivos
      const folders = metadata.prefixes || [];
      const items = [];

      // Adicionar pastas
      folders.forEach(folderPrefix => {
        const folderName = folderPrefix.replace(prefix, '').replace('/', '');
        if (folderName) {
          items.push({
            type: 'folder',
            name: folderName,
            path: folderPrefix,
            size: null,
            mimeType: 'folder',
            timeCreated: null,
            timeUpdated: null
          });
        }
      });

      // Adicionar arquivos
      files.forEach(file => {
        // Ignorar objetos que são apenas marcadores de pasta
        if (!file.name.endsWith('/')) {
          const fileName = path.basename(file.name);
          items.push({
            type: 'file',
            name: fileName,
            path: file.name,
            size: parseInt(file.metadata.size),
            mimeType: file.metadata.contentType || 'application/octet-stream',
            timeCreated: file.metadata.timeCreated,
            timeUpdated: file.metadata.updated
          });
        }
      });

      return {
        items,
        currentPath: prefix,
        hasMore: files.length === limit,
        totalCount: items.length,
        page,
        limit
      };
    } catch (error) {
      console.error('Erro ao listar objetos GCS:', error);
      throw new Error(`Erro ao listar arquivos: ${error.message}`);
    }
  }

  /**
   * Cria uma nova "pasta" (objeto terminado em /)
   * @param {string} folderPath - Caminho completo da nova pasta
   * @returns {Object} Resultado da operação
   */
  async createFolder(folderPath) {
    try {
      // Garantir que o caminho termina com /
      const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;

      // Verificar se já existe
      const [exists] = await this.bucket.file(normalizedPath).exists();
      if (exists) {
        throw new Error('Pasta já existe');
      }

      // Criar um objeto vazio que representa a pasta
      const file = this.bucket.file(normalizedPath);
      await file.save('', {
        metadata: {
          contentType: 'application/x-www-form-urlencoded'
        }
      });

      return {
        success: true,
        path: normalizedPath,
        message: 'Pasta criada com sucesso'
      };
    } catch (error) {
      console.error('Erro ao criar pasta GCS:', error);
      throw new Error(`Erro ao criar pasta: ${error.message}`);
    }
  }

  /**
   * Faz upload de um arquivo para o bucket
   * @param {Buffer} fileBuffer - Buffer do arquivo
   * @param {string} fileName - Nome do arquivo
   * @param {string} destinationPath - Caminho de destino no bucket
   * @param {string} mimeType - Tipo MIME do arquivo
   * @returns {Object} Resultado do upload
   */
  async uploadFile(fileBuffer, fileName, destinationPath = '', mimeType = 'application/octet-stream') {
    try {
      // Normalizar o caminho para evitar barras duplas
      let fullPath;
      if (destinationPath) {
        // Remove barra final do destinationPath se existir
        const normalizedPath = destinationPath.replace(/\/+$/, '');
        fullPath = `${normalizedPath}/${fileName}`;
      } else {
        fullPath = fileName;
      }

      console.log('📂 Construindo caminho de upload:', {
        destinationPath,
        fileName,
        fullPath
      });

      const file = this.bucket.file(fullPath);

      // Verificar se já existe
      const [exists] = await file.exists();
      if (exists) {
        throw new Error('Arquivo já existe no destino');
      }

      const stream = file.createWriteStream({
        metadata: {
          contentType: mimeType
        },
        resumable: false
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (err) => {
          reject(new Error(`Erro no upload: ${err.message}`));
        });

        stream.on('finish', () => {
          console.log('✅ Upload concluído para:', fullPath);
          resolve({
            success: true,
            path: fullPath,
            size: fileBuffer.length,
            message: 'Arquivo enviado com sucesso'
          });
        });

        stream.end(fileBuffer);
      });
    } catch (error) {
      console.error('Erro ao fazer upload GCS:', error);
      throw new Error(`Erro ao enviar arquivo: ${error.message}`);
    }
  }

  /**
   * Exclui um arquivo ou pasta
   * @param {string} objectPath - Caminho do objeto a ser excluído
   * @returns {Object} Resultado da operação
   */
  async deleteObject(objectPath) {
    try {
      const file = this.bucket.file(objectPath);
      const [exists] = await file.exists();

      if (!exists) {
        throw new Error('Arquivo ou pasta não encontrado');
      }

      await file.delete();

      return {
        success: true,
        path: objectPath,
        message: 'Item excluído com sucesso'
      };
    } catch (error) {
      console.error('Erro ao excluir objeto GCS:', error);
      throw new Error(`Erro ao excluir item: ${error.message}`);
    }
  }

  /**
   * Busca um arquivo pelo nome no bucket
   * @param {string} fileName - Nome do arquivo a ser buscado
   * @returns {Promise<string|null>} Caminho completo do arquivo ou null
   */
  async findFile(fileName) {
    try {
      console.log(`Buscando arquivo ${fileName} no bucket...`);
      // Tenta usar matchGlob para busca eficiente
      const [files] = await this.bucket.getFiles({
        matchGlob: `**/${fileName}`,
        maxResults: 1
      });

      if (files && files.length > 0) {
        console.log(`Arquivo encontrado: ${files[0].name}`);
        return files[0].name;
      }

      console.log('Arquivo não encontrado via matchGlob');
      return null;
    } catch (error) {
      console.error('Erro ao buscar arquivo no GCS:', error);
      // Fallback silencioso ou rethrow? Vamos apenas logar e retornar null
      return null;
    }
  }

  /**
   * Gera URL assinada para download de arquivo
   * @param {string} filePath - Caminho do arquivo
   * @param {number} expiresInMinutes - Tempo de expiração em minutos
   * @returns {string} URL assinada
   */
  async getSignedUrl(filePath, expiresInMinutes = 60) {
    try {
      const file = this.bucket.file(filePath);
      const [exists] = await file.exists();

      if (!exists) {
        throw new Error('Arquivo não encontrado');
      }

      const options = {
        version: 'v4',
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000
      };

      const [url] = await file.getSignedUrl(options);
      return url;
    } catch (error) {
      console.error('Erro ao gerar URL assinada:', error);
      throw new Error(`Erro ao gerar link de download: ${error.message}`);
    }
  }
}

export default new GCSService(); 