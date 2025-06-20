import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/database.js';
import autosRoutes from './routes/autos.js';
import infratoresRoutes from './routes/infratores.js';
import storageRoutes from './routes/storage.js';

// Configurar path para módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega as variáveis de ambiente
dotenv.config();

// Log das variáveis de ambiente carregadas
console.log('Variáveis de ambiente carregadas:');
console.log('GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME);
console.log('GCS_PROJECT_ID:', process.env.GCS_PROJECT_ID);
console.log('GCS_KEY_FILE:', process.env.GCS_KEY_FILE);
console.log('Diretório atual:', process.cwd());

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do CORS mais detalhada
const corsOptions = {
  origin: '*', // Permite todas as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cache-Control', 
    'Pragma', 
    'If-Modified-Since',
    'Accept',
    'Expires'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middlewares
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// Middleware de log para todas as requisições
app.use((req, res, next) => {
  console.log('========== NOVA REQUISIÇÃO ==========');
  console.log(`${req.method} ${req.url}`);
  console.log('Parâmetros:', req.query);
  console.log('Headers:', req.headers);
  console.log('=====================================');
  next();
});

// Rotas
app.use('/api/autos', autosRoutes);
app.use('/api/infratores', infratoresRoutes);
app.use('/api/storage', storageRoutes);

// Rota de diagnóstico para verificar o status do servidor
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

// Rota específica para teste de CORS
app.options('/api/cors-test', cors(corsOptions), (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/cors-test', (req, res) => {
  res.json({
    message: 'CORS está funcionando corretamente',
    headers_recebidos: req.headers,
    timestamp: new Date()
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('========== ERRO NA REQUISIÇÃO ==========');
  console.error(`${req.method} ${req.url}`);
  console.error('Erro:', err.message);
  console.error('Stack:', err.stack);
  console.error('========================================');
  
  res.status(500).json({
    message: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR',
    error: err.message
  });
});

// Inicia o servidor primeiro
app.listen(PORT, () => {
  const startupTime = new Date().toISOString();
  console.log(`[${startupTime}] Servidor rodando na porta ${PORT}`);
  console.log(`[${startupTime}] Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  
  // Tenta conectar ao MongoDB após iniciar o servidor
  connectDB().catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
    // Não encerra o servidor, apenas loga o erro
  });
});