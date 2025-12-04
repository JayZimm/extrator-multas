# Guia de Autenticação - Sistema ANTT

## 📖 Visão Geral

Este documento descreve o sistema de autenticação implementado no Sistema de Análise de Multas ANTT.

## 🔑 Estrutura do Sistema

### Componentes Principais

#### 1. AuthService (`src/services/authService.js`)
Gerencia toda a lógica de autenticação:
- `login(email, senha)` - Realiza o login na API externa
- `logout()` - Remove a sessão do usuário
- `isAuthenticated()` - Verifica se há uma sessão ativa
- `getCurrentUser()` - Retorna os dados do usuário logado

#### 2. AuthContext (`src/contexts/AuthContext.jsx`)
Contexto React que fornece:
- Estado global do usuário autenticado
- Funções de login e logout
- Estado de carregamento

#### 3. Página de Login (`src/pages/Login.jsx`)
Interface de autenticação com:
- Campo de e-mail
- Campo de senha com toggle de visibilidade
- Validação de formulário
- Mensagens de erro
- Estado de loading

#### 4. ProtectedRoute (`src/components/ProtectedRoute.jsx`)
Componente que protege rotas privadas:
- Verifica autenticação antes de renderizar
- Redireciona para login se não autenticado
- Mantém a rota original para redirecionamento pós-login

## 🚀 Como Usar

### Para Desenvolvedores

1. **Configurar Variáveis de Ambiente**

Crie o arquivo `frontend/.env` baseado no `.env.example`:

```env
VITE_AUTH_API_URL=https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4
VITE_AUTH_TOKEN=rdx2022@TCjj
VITE_AUTH_DATASET=37
```

2. **Usar o Hook de Autenticação**

```jsx
import { useAuth } from '../contexts/AuthContext';

function MeuComponente() {
  const { user, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Não autorizado</div>;
  }
  
  return (
    <div>
      <p>Olá, {user.login}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

3. **Proteger Rotas**

```jsx
import ProtectedRoute from './components/ProtectedRoute';

<Route 
  path="/admin" 
  element={
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

### Para Usuários Finais

1. **Acessar o Sistema**
   - Abra o navegador e acesse a URL do sistema
   - Você será automaticamente redirecionado para a tela de login

2. **Fazer Login**
   - Digite seu e-mail corporativo
   - Digite sua senha
   - Clique no ícone de "olho" para visualizar a senha se necessário
   - Clique em "Entrar"

3. **Navegar no Sistema**
   - Após o login, você terá acesso a todas as funcionalidades
   - Sua sessão ficará ativa até que você faça logout ou feche o navegador

4. **Fazer Logout**
   - Clique no botão "Sair" na sidebar esquerda
   - Você será redirecionado para a tela de login

## 🔒 Segurança

### Dados Armazenados

O sistema armazena no `localStorage` do navegador:
- E-mail do usuário
- Timestamp de login
- Flag de autenticação

**Importante**: Não armazenamos senhas no navegador!

### Fluxo de Autenticação

```
1. Usuário insere credenciais
        ↓
2. Sistema envia para API externa
        ↓
3. API valida credenciais
        ↓
4. Se válido: armazena sessão e redireciona
   Se inválido: exibe mensagem de erro
        ↓
5. Sessão mantida até logout ou limpeza de cache
```

### Formato da Requisição

```json
{
  "Datasets": 37,
  "q": "{\"Token\":\"rdx2022@TCjj\",\"Login\":\"user@example.com\",\"Senha\":\"senha123\"}"
}
```

### Respostas da API

**Sucesso (StatusCode: 200)**
```json
{
  "StatusCode": 200,
  "Mensagem": "Login realizado com sucesso!",
  "DataHoraProcessamento": "2025-12-04T14:04:51Z"
}
```

**Erro (StatusCode: 404)**
```json
{
  "StatusCode": 404,
  "Mensagem": "Invalid username or password.",
  "DataHoraProcessamento": "2025-12-04T14:17:03Z"
}
```

## 🛠️ Manutenção

### Alterar URL da API

Edite o arquivo `frontend/.env`:
```env
VITE_AUTH_API_URL=https://nova-url.com.br/api/auth
```

### Alterar Token de Autenticação

Edite o arquivo `frontend/.env`:
```env
VITE_AUTH_TOKEN=novo-token-aqui
```

### Debugging

Para verificar o estado da autenticação no console do navegador:

```javascript
// Verificar se está autenticado
localStorage.getItem('isAuthenticated')

// Ver dados do usuário
JSON.parse(localStorage.getItem('user'))

// Limpar sessão manualmente
localStorage.removeItem('user')
localStorage.removeItem('isAuthenticated')
```

## ⚠️ Limitações Conhecidas

1. **Não há recuperação de senha** - Entre em contato com o administrador
2. **Sessão não expira automaticamente** - Usuário deve fazer logout
3. **Sem refresh token** - Usuário precisa fazer login novamente após limpar cache
4. **Sem autenticação de dois fatores (2FA)** - Apenas email e senha

## 📞 Suporte

Para problemas de autenticação, entre em contato com:
- Administrador do Sistema
- Equipe de TI

## 🔄 Atualizações Futuras

Possíveis melhorias planejadas:
- [ ] Timeout automático de sessão
- [ ] Refresh token
- [ ] Autenticação de dois fatores (2FA)
- [ ] Recuperação de senha
- [ ] Histórico de login
- [ ] Notificações de login em novo dispositivo

