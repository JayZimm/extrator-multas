# Checklist de Testes - Sistema de Autenticação

## ✅ Testes Funcionais

### 1. Página de Login

- [ ] **Layout e Design**
  - [ ] Página renderiza corretamente
  - [ ] Design responsivo em diferentes tamanhos de tela
  - [ ] Tema claro/escuro funciona
  - [ ] Logo e título exibidos corretamente

- [ ] **Campos do Formulário**
  - [ ] Campo de e-mail aceita entrada
  - [ ] Campo de e-mail valida formato de e-mail
  - [ ] Campo de senha aceita entrada
  - [ ] Ícone de "olho" mostra/oculta senha
  - [ ] Placeholder dos campos está correto

- [ ] **Validações**
  - [ ] Campos são obrigatórios
  - [ ] Não permite envio com campos vazios
  - [ ] Exibe mensagem de erro do servidor

### 2. Autenticação

- [ ] **Login com Sucesso**
  - [ ] Login com credenciais válidas funciona
  - [ ] Redireciona para a página correta após login
  - [ ] Dados do usuário são armazenados
  - [ ] Estado de loading é exibido durante autenticação

- [ ] **Login com Erro**
  - [ ] Login com credenciais inválidas exibe erro
  - [ ] Mensagem de erro é clara e legível
  - [ ] Formulário não é desabilitado após erro
  - [ ] Campos podem ser editados após erro

- [ ] **Casos Especiais**
  - [ ] Erro de rede é tratado corretamente
  - [ ] Timeout é tratado
  - [ ] API fora do ar exibe mensagem apropriada

### 3. Proteção de Rotas

- [ ] **Rotas Protegidas**
  - [ ] Acesso sem login redireciona para `/login`
  - [ ] Acesso com login permite navegação
  - [ ] Rota original é preservada para redirecionamento

- [ ] **Navegação**
  - [ ] Todas as rotas do sistema requerem autenticação
  - [ ] Rota `/login` é acessível sem autenticação
  - [ ] Usuário logado não pode acessar `/login` novamente

### 4. Logout

- [ ] **Funcionalidade de Logout**
  - [ ] Botão de logout está visível na sidebar
  - [ ] Logout remove dados do usuário
  - [ ] Logout redireciona para página de login
  - [ ] Após logout, não é possível acessar rotas protegidas

### 5. Persistência de Sessão

- [ ] **localStorage**
  - [ ] Dados são salvos corretamente no localStorage
  - [ ] Sessão persiste após recarregar a página
  - [ ] Sessão persiste ao abrir nova aba
  - [ ] Logout limpa os dados do localStorage

- [ ] **Informações do Usuário**
  - [ ] E-mail do usuário é exibido na sidebar
  - [ ] Status "Conectado" é exibido
  - [ ] Informações são atualizadas corretamente

### 6. Interface do Usuário

- [ ] **Sidebar**
  - [ ] Informações do usuário são exibidas
  - [ ] Botão de logout está estilizado corretamente
  - [ ] Ícones são exibidos corretamente
  - [ ] Layout responsivo funciona

- [ ] **Feedback Visual**
  - [ ] Loading spinner durante autenticação
  - [ ] Mensagens de erro são visíveis
  - [ ] Estados de hover funcionam
  - [ ] Transições são suaves

## 🧪 Testes de Integração

### 1. API de Autenticação

```bash
# Teste manual com curl - Login com sucesso
curl --location 'https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4' \
--header 'Content-Type: application/json' \
--data-raw '{
    "Datasets": 37,
    "q": "{\"Token\":\"rdx2022@TCjj\",\"Login\":\"SEU_EMAIL\",\"Senha\":\"SUA_SENHA\"}"
}'
```

Resultado esperado:
```json
{
  "StatusCode": 200,
  "Mensagem": "Login realizado com sucesso!",
  "DataHoraProcessamento": "..."
}
```

```bash
# Teste manual com curl - Login com erro
curl --location 'https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4' \
--header 'Content-Type: application/json' \
--data-raw '{
    "Datasets": 37,
    "q": "{\"Token\":\"rdx2022@TCjj\",\"Login\":\"invalido@email.com\",\"Senha\":\"senhaerrada\"}"
}'
```

Resultado esperado:
```json
{
  "StatusCode": 404,
  "Mensagem": "Invalid username or password.",
  "DataHoraProcessamento": "..."
}
```

### 2. Variáveis de Ambiente

- [ ] **Configuração**
  - [ ] Arquivo `.env` existe
  - [ ] Todas as variáveis estão configuradas
  - [ ] Valores são carregados corretamente
  - [ ] Build funciona com as variáveis

Verificar no console do navegador:
```javascript
console.log(import.meta.env.VITE_AUTH_API_URL);
console.log(import.meta.env.VITE_AUTH_TOKEN);
console.log(import.meta.env.VITE_AUTH_DATASET);
```

## 🔍 Testes de Segurança

### 1. Armazenamento de Dados

- [ ] **localStorage**
  - [ ] Senha não é armazenada
  - [ ] Apenas dados necessários são salvos
  - [ ] Token de API não é exposto no cliente

Verificar no console do navegador:
```javascript
// Deve mostrar apenas email e timestamp
console.log(localStorage.getItem('user'));
// Não deve conter senha
```

### 2. Proteção de Rotas

- [ ] **Teste de Bypass**
  - [ ] Não é possível acessar rotas sem autenticação
  - [ ] URL diretas redirecionam para login
  - [ ] Manipulação de localStorage não dá acesso

Testar manualmente:
1. Faça logout
2. Tente acessar `http://localhost:5173/process-control`
3. Deve redirecionar para `/login`

### 3. CORS e Headers

- [ ] **Headers HTTP**
  - [ ] Content-Type correto na requisição
  - [ ] CORS permite requisição para API externa
  - [ ] Sem exposição de dados sensíveis

## 📱 Testes de Responsividade

### Desktop (≥1024px)
- [ ] Layout adequado
- [ ] Sidebar visível por padrão
- [ ] Formulário centralizado e legível

### Tablet (768px - 1023px)
- [ ] Layout se adapta
- [ ] Sidebar toggle funciona
- [ ] Campos do formulário dimensionados corretamente

### Mobile (<768px)
- [ ] Layout mobile funciona
- [ ] Sidebar overlay funciona
- [ ] Formulário usa largura total
- [ ] Botões fáceis de clicar (touch targets)

## 🌐 Testes Cross-Browser

- [ ] **Chrome** - Funciona corretamente
- [ ] **Firefox** - Funciona corretamente
- [ ] **Safari** - Funciona corretamente
- [ ] **Edge** - Funciona corretamente

## 🐛 Cenários de Erro Comuns

### 1. Rede Offline
- [ ] Exibe mensagem de erro apropriada
- [ ] Não trava a aplicação

### 2. API Indisponível
- [ ] Exibe mensagem de erro clara
- [ ] Permite tentar novamente

### 3. Credenciais Inválidas
- [ ] Exibe mensagem de erro
- [ ] Permite nova tentativa
- [ ] Não trava campos

### 4. Timeout
- [ ] Detecta timeout
- [ ] Exibe mensagem apropriada

## 📊 Resultados Esperados

### ✅ Todos os Testes Passaram
- Sistema está pronto para produção
- Todos os cenários foram testados
- Nenhum bug crítico encontrado

### ⚠️ Alguns Testes Falharam
- Identificar e corrigir problemas
- Retestar após correções
- Documentar problemas conhecidos

### ❌ Muitos Testes Falharam
- Revisar implementação
- Verificar configuração
- Consultar documentação

## 📝 Notas Importantes

1. **Sempre testar em ambiente de desenvolvimento primeiro**
2. **Não usar credenciais reais em testes automatizados**
3. **Documentar bugs encontrados**
4. **Verificar logs do console do navegador**
5. **Testar em diferentes dispositivos e navegadores**

## 🚀 Próximos Passos Após Testes

1. Corrigir bugs encontrados
2. Otimizar performance se necessário
3. Fazer deploy em ambiente de staging
4. Testar novamente em staging
5. Deploy em produção
6. Monitorar erros em produção

