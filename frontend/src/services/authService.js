/**
 * Serviço de Autenticação
 * Gerencia login, logout e validação de sessão
 */

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;
const AUTH_DATASET = import.meta.env.VITE_AUTH_DATASET;

class AuthService {
  /**
   * Realiza o login do usuário
   * @param {string} login - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} - Retorna os dados da resposta
   */
  async login(login, senha) {
    try {
      // Log das variáveis de ambiente para debug
      console.log('🔐 Iniciando login...');
      console.log('📍 URL da API:', AUTH_API_URL);
      console.log('📦 Dataset:', AUTH_DATASET);
      
      // Valida se as variáveis de ambiente estão configuradas
      if (!AUTH_API_URL || !AUTH_TOKEN || !AUTH_DATASET) {
        console.error('❌ Variáveis de ambiente não configuradas!');
        return {
          success: false,
          message: 'Erro de configuração do sistema. Entre em contato com o suporte.'
        };
      }

      const requestBody = {
        Datasets: parseInt(AUTH_DATASET),
        q: JSON.stringify({
          Token: AUTH_TOKEN,
          Login: login,
          Senha: senha
        })
      };

      console.log('📤 Enviando requisição:', {
        url: AUTH_API_URL,
        method: 'POST',
        body: requestBody
      });

      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Verifica se a resposta tem conteúdo
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ Resposta não é JSON:', contentType);
        const textResponse = await response.text();
        console.error('📄 Conteúdo da resposta:', textResponse);
        return {
          success: false,
          message: 'Erro no formato da resposta do servidor. Entre em contato com o suporte.'
        };
      }

      // Tenta fazer o parse do JSON
      const text = await response.text();
      console.log('📄 Texto da resposta:', text);

      if (!text || text.trim() === '') {
        console.error('❌ Resposta vazia do servidor');
        return {
          success: false,
          message: 'Servidor retornou resposta vazia. Tente novamente.'
        };
      }

      let data;
      try {
        data = JSON.parse(text);
        console.log('✅ JSON parseado com sucesso:', data);
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.error('📄 Texto recebido:', text);
        return {
          success: false,
          message: 'Erro ao processar resposta do servidor.'
        };
      }

      // Verifica o status da resposta
      if (data.StatusCode === 200) {
        console.log('✅ Login realizado com sucesso!');
        
        // Salva os dados do usuário no localStorage
        const userData = {
          login: login,
          timestamp: new Date().toISOString(),
          message: data.Mensagem
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAuthenticated', 'true');
        
        return {
          success: true,
          message: data.Mensagem,
          user: userData
        };
      } else {
        console.warn('⚠️ Login falhou:', data.Mensagem);
        return {
          success: false,
          message: data.Mensagem || 'Erro ao realizar login'
        };
      }
    } catch (error) {
      console.error('❌ Erro ao realizar login:', error);
      console.error('Stack trace:', error.stack);
      
      // Mensagens de erro mais específicas
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          message: 'Erro de rede. Verifique sua conexão e tente novamente.'
        };
      }
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Requisição cancelada. Tente novamente.'
        };
      }
      
      return {
        success: false,
        message: 'Erro de conexão com o servidor. Tente novamente.'
      };
    }
  }

  /**
   * Realiza o logout do usuário
   */
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean}
   */
  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
  }

  /**
   * Retorna os dados do usuário logado
   * @returns {Object|null}
   */
  getCurrentUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }
}

export default new AuthService();

