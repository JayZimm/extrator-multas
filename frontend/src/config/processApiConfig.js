import axios from 'axios';

// Configuração específica para a API de processamento
const processApiInstance = axios.create({
  baseURL: import.meta.env.VITE_PROCESS_API_BASE_URL || '/app',
  timeout: 30000, // Timeout maior para processamento
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Configurar autenticação básica automaticamente
const username = import.meta.env.VITE_PROCESS_API_USERNAME || 'admin';
const password = import.meta.env.VITE_PROCESS_API_PASSWORD || 'admin123';
const basicAuth = btoa(`${username}:${password}`);

processApiInstance.defaults.headers.common['Authorization'] = `Basic ${basicAuth}`;

// Interceptor para requisições
processApiInstance.interceptors.request.use(
  config => {
    console.log('🔄 Enviando requisição para API de processamento:', {
      método: config.method,
      url: config.url,
      baseURL: config.baseURL
    });
    return config;
  },
  error => {
    console.error('❌ Erro ao enviar requisição para API de processamento:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respostas
processApiInstance.interceptors.response.use(
  response => {
    console.log('✅ Resposta recebida da API de processamento:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('❌ Erro na resposta da API de processamento:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    return Promise.reject(error);
  }
);

export default processApiInstance; 