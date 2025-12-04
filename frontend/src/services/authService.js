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
      const requestBody = {
        Datasets: parseInt(AUTH_DATASET),
        q: JSON.stringify({
          Token: AUTH_TOKEN,
          Login: login,
          Senha: senha
        })
      };

      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.StatusCode === 200) {
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
        return {
          success: false,
          message: data.Mensagem || 'Erro ao realizar login'
        };
      }
    } catch (error) {
      console.error('Erro ao realizar login:', error);
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
