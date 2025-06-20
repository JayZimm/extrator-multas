import express from 'express';
import multer from 'multer';
import gcsService from '../services/gcsService.js';

const router = express.Router();

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo por arquivo
    files: 10 // Máximo 10 arquivos por vez
  },
  fileFilter: (req, file, cb) => {
    // Lista de tipos MIME permitidos (expandida)
    const allowedMimes = [
      // Imagens
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff',
      
      // Documentos PDF
      'application/pdf',
      
      // Documentos de texto
      'text/plain', 'text/csv', 'text/html', 'text/css', 'text/javascript', 'text/xml',
      
      // Microsoft Office
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      
      // OpenDocument
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
      
      // Arquivos comprimidos
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip',
      
      // JSON e XML
      'application/json', 'application/xml',
      
      // Outros formatos comuns
      'application/octet-stream' // Aceitar arquivos binários genéricos
    ];

    console.log(`🔍 Verificando tipo MIME: ${file.mimetype} para arquivo: ${file.originalname}`);

    if (allowedMimes.includes(file.mimetype)) {
      console.log('✅ Tipo MIME permitido');
      cb(null, true);
    } else {
      console.log('❌ Tipo MIME não permitido');
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
    }
  }
});

/**
 * GET /api/storage/list
 * Lista objetos do bucket com estrutura hierárquica
 * Query params: prefix, page, limit
 */
router.get('/list', async (req, res) => {
  try {
    const { prefix = '', page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Número da página deve ser um inteiro maior que 0'
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limite deve ser um inteiro entre 1 e 100'
      });
    }

    const result = await gcsService.listObjects(prefix, pageNum, limitNum);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao listar objetos:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      code: 'STORAGE_LIST_ERROR'
    });
  }
});

/**
 * POST /api/storage/folder
 * Cria uma nova pasta no bucket
 * Body: { path: string }
 */
router.post('/folder', async (req, res) => {
  try {
    const { path: folderPath } = req.body;

    if (!folderPath || typeof folderPath !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Caminho da pasta é obrigatório'
      });
    }

    // Validar nome da pasta
    if (!/^[\w\-_\/]+$/.test(folderPath)) {
      return res.status(400).json({
        success: false,
        message: 'Nome da pasta contém caracteres inválidos'
      });
    }

    const result = await gcsService.createFolder(folderPath);
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
    const statusCode = error.message.includes('já existe') ? 409 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message,
      code: 'STORAGE_FOLDER_ERROR'
    });
  }
});

/**
 * POST /api/storage/upload
 * Faz upload de um ou mais arquivos
 * FormData: files[], path (opcional)
 */
router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const files = req.files;
    const { path: destinationPath = '' } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo foi enviado'
      });
    }

    // Validar caminho de destino se fornecido
    if (destinationPath && !/^[\w\-_\/]*$/.test(destinationPath)) {
      return res.status(400).json({
        success: false,
        message: 'Caminho de destino contém caracteres inválidos'
      });
    }

    const uploadPromises = files.map(file => 
      gcsService.uploadFile(
        file.buffer,
        file.originalname,
        destinationPath,
        file.mimetype
      )
    );

    const results = await Promise.allSettled(uploadPromises);
    
    const successes = [];
    const failures = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successes.push({
          file: files[index].originalname,
          ...result.value
        });
      } else {
        failures.push({
          file: files[index].originalname,
          error: result.reason.message
        });
      }
    });

    res.status(200).json({
      success: failures.length === 0,
      data: {
        uploaded: successes,
        failed: failures,
        totalFiles: files.length,
        successCount: successes.length,
        failureCount: failures.length
      }
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      code: 'STORAGE_UPLOAD_ERROR'
    });
  }
});

/**
 * DELETE /api/storage/object
 * Exclui um arquivo ou pasta
 * Body: { path: string }
 */
router.delete('/object', async (req, res) => {
  try {
    const { path: objectPath } = req.body;

    if (!objectPath || typeof objectPath !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Caminho do objeto é obrigatório'
      });
    }

    const result = await gcsService.deleteObject(objectPath);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao excluir objeto:', error);
    const statusCode = error.message.includes('não encontrado') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message,
      code: 'STORAGE_DELETE_ERROR'
    });
  }
});

/**
 * GET /api/storage/download/:path
 * Gera URL assinada para download de arquivo
 * Params: path (encoded)
 * Query: expires (minutos, padrão 60)
 */
router.get('/download/*', async (req, res) => {
  try {
    const filePath = req.params[0]; // Captura todo o path após /download/
    const { expires = 60 } = req.query;
    const expiresMinutes = parseInt(expires);

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'Caminho do arquivo é obrigatório'
      });
    }

    if (isNaN(expiresMinutes) || expiresMinutes < 1 || expiresMinutes > 1440) {
      return res.status(400).json({
        success: false,
        message: 'Tempo de expiração deve ser entre 1 e 1440 minutos'
      });
    }

    const signedUrl = await gcsService.getSignedUrl(filePath, expiresMinutes);
    
    res.json({
      success: true,
      data: {
        downloadUrl: signedUrl,
        expiresIn: expiresMinutes,
        filePath
      }
    });
  } catch (error) {
    console.error('Erro ao gerar URL de download:', error);
    const statusCode = error.message.includes('não encontrado') ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message,
      code: 'STORAGE_DOWNLOAD_ERROR'
    });
  }
});

/**
 * GET /api/storage/health
 * Verifica a conectividade com o Google Cloud Storage
 */
router.get('/health', async (req, res) => {
  try {
    // Tenta listar apenas 1 objeto para verificar conectividade
    await gcsService.listObjects('', 1, 1);
    
    res.json({
      success: true,
      message: 'Conexão com GCS funcionando corretamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro na verificação de saúde do GCS:', error);
    res.status(503).json({
      success: false,
      message: 'Erro na conexão com Google Cloud Storage',
      error: error.message,
      code: 'STORAGE_HEALTH_ERROR'
    });
  }
});

// Middleware de tratamento de erros específico para upload
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 50MB',
        code: 'FILE_TOO_LARGE'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Muitos arquivos. Máximo: 10 arquivos por vez',
        code: 'TOO_MANY_FILES'
      });
    }
  }

  if (error.message.includes('Tipo de arquivo não permitido')) {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: 'INVALID_FILE_TYPE'
    });
  }

  next(error);
});

export default router; 