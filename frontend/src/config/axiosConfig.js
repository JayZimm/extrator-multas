import axios from 'axios';

// Configuração base do Axios
const instance = axios.create({
  // Em desenvolvimento, usamos o proxy do Vite configurado para redirecionar /api → http://localhost:3000
  // Em produção, requisições começando com / serão relativas ao host atual
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Adiciona um interceptor para todas as requisições
instance.interceptors.request.use(
  config => {
    // Log da requisição para debug
    console.log('Requisição sendo enviada:', {
      método: config.method,
      url: config.url,
      parametros: config.params,
      data: config.data,
      headers: config.headers
    });
    
    // Adiciona um timestamp único para cada requisição para evitar o cache
    if (config.params) {
      config.params._t = new Date().getTime();
    } else {
      config.params = { _t: new Date().getTime() };
    }
    
    return config;
  },
  error => {
    console.error('Erro ao enviar requisição:', error);
    return Promise.reject(error);
  }
);

// Adiciona um interceptor para todas as respostas
instance.interceptors.response.use(
  response => {
    // Log da resposta para debug
    const logData = response.data instanceof Array 
      ? `Array com ${response.data.length} itens` 
      : 'object';
    
    console.log('Resposta recebida:', {
      url: response.config.url,
      status: response.status,
      data: logData
    });
    
    return response;
  },
  error => {
    console.error('Erro na resposta:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default instance; 