# 🔧 Troubleshooting - Problemas de Login

## Erro: "Erro de conexão com o servidor. Tente novamente."

Este erro geralmente indica um dos seguintes problemas:

### 1. Variáveis de Ambiente Não Configuradas

**Sintoma:** Console mostra "Variáveis de ambiente não configuradas!"

**Solução:**

⚠️ **IMPORTANTE:** Neste projeto, o arquivo `.env` deve ficar na **RAIZ do projeto**, não dentro de `frontend/`!

O `vite.config.js` está configurado com `envDir: '..'`, o que faz o Vite buscar variáveis na raiz.

1. Verifique se o arquivo `.env` existe na **raiz do projeto** (não em `frontend/.env`)
2. Certifique-se que as variáveis começam com `VITE_`
3. Reinicie o servidor de desenvolvimento após criar/modificar o `.env`

```bash
# Pare o servidor (Ctrl+C)
# Verifique se o arquivo existe NA RAIZ
cat .env
# Deve mostrar:
# VITE_API_URL=http://localhost:3000
# VITE_AUTH_API_URL=https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4
# VITE_AUTH_TOKEN=rdx2022@TCjj
# VITE_AUTH_DATASET=37

# Reinicie o servidor
cd frontend
npm run dev
```

### 2. Servidor Não Reiniciado Após Configuração

**Sintoma:** Variáveis aparecem como `undefined` no console

**Solução:**

```bash
# Mate completamente o processo
killall node
# ou Ctrl+C no terminal do servidor

# Reinicie o servidor
cd frontend
npm run dev
```

**IMPORTANTE:** O Vite só carrega variáveis de ambiente ao INICIAR o servidor, não em hot-reload!

### 3. Problema de CORS

**Sintoma:** Console mostra erro de CORS como:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Possíveis Causas:**
- A API externa não permite requisições do seu domínio
- Headers de CORS não configurados corretamente

**Solução Temporária (Desenvolvimento):**

Opção 1 - Usar extensão de navegador:
- Chrome: "Allow CORS: Access-Control-Allow-Origin"
- Firefox: "CORS Everywhere"

Opção 2 - Criar um proxy no backend:

```javascript
// backend/src/routes/auth-proxy.js
const express = require('express');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const response = await fetch('https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 4. API Externa Fora do Ar

**Sintoma:** Timeout ou erro de rede

**Como Verificar:**

```bash
# Teste a API diretamente
curl --location 'https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4' \
--header 'Content-Type: application/json' \
--data-raw '{
    "Datasets": 37,
    "q": "{\"Token\":\"rdx2022@TCjj\",\"Login\":\"teste@email.com\",\"Senha\":\"teste123\"}"
}'
```

Se retornar erro, a API está fora do ar ou inacessível.

### 5. Resposta da API em Formato Incorreto

**Sintoma:** "Erro no formato da resposta do servidor"

**Como Verificar:**

Abra o DevTools (F12) → Aba Network → Tente fazer login → Clique na requisição → Veja a resposta

**Esperado:**
```json
{
  "StatusCode": 200,
  "Mensagem": "Login realizado com sucesso!",
  "DataHoraProcessamento": "2025-12-04T14:04:51Z"
}
```

Se a resposta for diferente, a API pode ter mudado.

### 6. Erro de Parse JSON

**Sintoma:** "Unexpected end of JSON input" ou "Erro ao processar resposta do servidor"

**Causas Comuns:**
- Resposta vazia da API
- HTML de erro ao invés de JSON
- Caracteres inválidos na resposta

**Debug:**

1. Abra o console do navegador (F12)
2. Procure por logs começando com 📄
3. Verifique o conteúdo da resposta

### 7. Token ou Credenciais Incorretas

**Sintoma:** API retorna StatusCode 404 ou 401

**Verificar:**
- Token correto no `.env`: `VITE_AUTH_TOKEN=rdx2022@TCjj`
- Dataset correto: `VITE_AUTH_DATASET=37`
- Credenciais do usuário válidas

## 🔍 Debug Passo a Passo

### Passo 1: Verificar Variáveis de Ambiente

No componente de login, você verá um card amarelo no canto inferior direito mostrando as variáveis de ambiente (apenas em desenvolvimento).

**Todas devem estar configuradas:**
- ✅ VITE_AUTH_API_URL: https://osdev.rodoxisto.com.br/...
- ✅ VITE_AUTH_TOKEN: ✅ Configurado
- ✅ VITE_AUTH_DATASET: 37

Se alguma estiver ❌ undefined, o problema é nas variáveis de ambiente.

### Passo 2: Verificar Console do Navegador

Abra o console (F12) e procure por:

```
🔐 Iniciando login...
📍 URL da API: https://...
📦 Dataset: 37
📤 Enviando requisição: {...}
📥 Resposta recebida: {...}
```

Identifique em qual ponto o erro ocorre.

### Passo 3: Verificar Network Tab

1. Abra DevTools (F12)
2. Vá para a aba "Network"
3. Tente fazer login
4. Clique na requisição para ver:
   - Request Headers
   - Request Payload
   - Response Headers
   - Response Body

### Passo 4: Teste Manual

Teste a API diretamente usando curl ou Postman:

```bash
curl -X POST 'https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4' \
  -H 'Content-Type: application/json' \
  -d '{
    "Datasets": 37,
    "q": "{\"Token\":\"rdx2022@TCjj\",\"Login\":\"seu.email@exemplo.com\",\"Senha\":\"sua.senha\"}"
  }'
```

Se funcionar no curl mas não no navegador, é problema de CORS.

## 📋 Checklist de Verificação

- [ ] ⚠️ Arquivo `.env` existe na **RAIZ do projeto** (não em `frontend/.env`)
- [ ] Variáveis começam com `VITE_`
- [ ] Servidor foi reiniciado após criar/modificar `.env`
- [ ] Console mostra as variáveis carregadas
- [ ] API responde ao teste com curl
- [ ] Não há erros de CORS no console
- [ ] Network tab mostra a requisição sendo enviada
- [ ] Credenciais estão corretas

## 🚑 Soluções Rápidas

### Solução 1: Reset Completo

```bash
# Frontend
cd frontend
rm -rf node_modules
npm install
# Certifique-se que o .env existe e está correto
cat .env
npm run dev
```

### Solução 2: Limpar Cache do Navegador

1. Abra DevTools (F12)
2. Clique com botão direito no botão de reload
3. Selecione "Empty Cache and Hard Reload"

### Solução 3: Usar Proxy Backend (Se CORS for o problema)

Modifique o `authService.js` para usar uma rota local que faz proxy:

```javascript
// Use esta URL ao invés da API direta
const AUTH_API_URL = 'http://localhost:3000/api/auth/login';
```

E crie a rota no backend conforme mostrado acima.

## 📞 Ainda com Problemas?

Se nenhuma solução funcionou:

1. **Compartilhe os logs completos do console**
2. **Tire screenshot da Network tab**
3. **Envie o resultado do teste curl**
4. **Verifique se consegue acessar a URL da API no navegador**

## 🎯 Próximos Passos

Depois de resolver o problema:

1. Remova o componente `<EnvDebug />` do código de produção
2. Remova os logs excessivos do `authService.js` (opcional)
3. Configure as variáveis de ambiente no servidor de produção
4. Teste em diferentes navegadores

