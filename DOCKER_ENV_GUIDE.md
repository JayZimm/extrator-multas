# 🐳 Guia de Variáveis de Ambiente no Docker

## ⚠️ PROBLEMA COMUM: Variáveis VITE_* não funcionam em produção

### Sintoma
```
POST https://extratormultas.rodoxisto.com.br/undefined 405 (Method Not Allowed)
```

A URL aparece como `undefined` porque `VITE_AUTH_API_URL` não foi injetada no build.

## 🎯 Por Que Isso Acontece?

### Vite vs Outras Aplicações

**Aplicações Tradicionais (Backend/Node):**
- Variáveis de ambiente são lidas em **runtime**
- `environment` no docker-compose funciona ✅
- Pode usar `.env` ou variáveis do sistema

**Vite (Frontend):**
- Variáveis `VITE_*` são injetadas em **build time** ⚡
- São substituídas por valores literais no código
- `environment` no docker-compose **NÃO funciona** ❌
- Precisa usar `--build-arg` no Docker build

### Exemplo Prático

**Código Original:**
```javascript
const API_URL = import.meta.env.VITE_AUTH_API_URL;
```

**Depois do Build (com build-arg correto):**
```javascript
const API_URL = "https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4";
```

**Depois do Build (SEM build-arg):**
```javascript
const API_URL = undefined; // ❌ ERRO!
```

## ✅ Solução Correta

### 1. Dockerfile - Declarar ARGs

```dockerfile
# Build stage
FROM node:18-alpine AS build

# ⚠️ IMPORTANTE: Declare todos os ARGs necessários
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_AUTH_API_URL
ARG VITE_AUTH_TOKEN
ARG VITE_AUTH_DATASET
ARG VITE_API_URL

WORKDIR /app

# Criar arquivo .env.production com as variáveis
RUN echo "VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}" > .env.production && \
    echo "VITE_AUTH_API_URL=${VITE_AUTH_API_URL}" >> .env.production && \
    echo "VITE_AUTH_TOKEN=${VITE_AUTH_TOKEN}" >> .env.production && \
    echo "VITE_AUTH_DATASET=${VITE_AUTH_DATASET}" >> .env.production && \
    echo "VITE_API_URL=${VITE_API_URL}" >> .env.production

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # ← Aqui as variáveis são injetadas!
```

### 2. Build Command - Passar build-args

```bash
# ⚠️ IMPORTANTE: Passe TODAS as variáveis como --build-arg
docker buildx build --platform linux/amd64 \
  -t seu-registry/antt-multas-frontend:v1.0.0 \
  --build-arg VITE_GOOGLE_MAPS_API_KEY="sua-chave" \
  --build-arg VITE_AUTH_API_URL="https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4" \
  --build-arg VITE_AUTH_TOKEN="rdx2022@TCjj" \
  --build-arg VITE_AUTH_DATASET="37" \
  --build-arg VITE_API_URL="/api" \
  --push \
  ./frontend
```

### 3. Docker Compose - Remover environment do frontend

❌ **ISSO NÃO FUNCIONA para Vite:**
```yaml
services:
  frontend:
    environment:
      - VITE_AUTH_API_URL=https://...  # ❌ Não funciona!
```

✅ **Variáveis devem estar na imagem durante o build:**
```yaml
services:
  frontend:
    image: seu-registry/antt-multas-frontend:v1.0.0
    # Não precisa de environment para VITE_*
    # As variáveis já estão "baked" na imagem!
```

## 🔄 Fluxo Completo de Deploy

### Passo 1: Build da Imagem

```bash
# Vá para a pasta do frontend
cd frontend

# Build com TODAS as variáveis
docker buildx build --platform linux/amd64 \
  -t us-west1-docker.pkg.dev/rodoxisto-415812/rdx-docker-services/antt-multas-frontend:v-1.0.3 \
  --build-arg VITE_GOOGLE_MAPS_API_KEY="AIzaSyB-yNuB_K8-lj8ymxpPLjjRwbMZ9guUpnA" \
  --build-arg VITE_AUTH_API_URL="https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4" \
  --build-arg VITE_AUTH_TOKEN="rdx2022@TCjj" \
  --build-arg VITE_AUTH_DATASET="37" \
  --build-arg VITE_API_URL="/api" \
  --push \
  .
```

### Passo 2: Atualizar docker-compose.frontend.yml

```yaml
services:
  antt-frontend:
    image: us-west1-docker.pkg.dev/rodoxisto-415812/rdx-docker-services/antt-multas-frontend:v-1.0.3
    # ↑ Atualize a versão da imagem
    # Não precisa de VITE_* em environment
```

### Passo 3: Deploy no Swarm

```bash
docker stack deploy -c docker-compose.frontend.yml antt-frontend
```

### Passo 4: Verificar

```bash
# Ver logs do container
docker service logs antt-frontend_antt-frontend -f

# Acessar o container e verificar os arquivos gerados
docker exec -it <container-id> sh
cat /usr/share/nginx/html/assets/index-*.js | grep "AUTH_API_URL"
# Deve mostrar a URL completa, não "undefined"
```

## 🐛 Troubleshooting

### Problema: URL ainda aparece como undefined

**Checklist:**
- [ ] Declarou todos os ARGs no Dockerfile?
- [ ] Passou todos os --build-arg no comando de build?
- [ ] Fez push da nova imagem?
- [ ] Atualizou a tag da imagem no docker-compose?
- [ ] Fez redeploy do stack?
- [ ] Limpou o cache do navegador?

### Verificar se as variáveis foram injetadas

```bash
# Baixe a imagem
docker pull us-west1-docker.pkg.dev/rodoxisto-415812/rdx-docker-services/antt-multas-frontend:v-1.0.3

# Rode temporariamente
docker run --rm -it antt-multas-frontend:v-1.0.3 sh

# Dentro do container, procure pelas variáveis
cd /usr/share/nginx/html/assets
grep -r "AUTH_API_URL" .

# Deve mostrar a URL completa, não "undefined"
```

## 📝 Checklist de Build de Produção

Antes de fazer o build:

- [ ] **Dockerfile atualizado** com todos os ARGs
- [ ] **Comando de build** com todos os --build-arg
- [ ] **Valores corretos** das variáveis (URLs, tokens, etc.)
- [ ] **Versão da imagem** incrementada
- [ ] **Push** da imagem para o registry
- [ ] **docker-compose.yml** atualizado com nova versão
- [ ] **Redeploy** do stack no Swarm
- [ ] **Teste** após deploy

## ⚡ Script de Build Rápido

Crie um arquivo `build-production.sh`:

```bash
#!/bin/bash

# Configurações
VERSION="v-1.0.3"
REGISTRY="us-west1-docker.pkg.dev/rodoxisto-415812/rdx-docker-services"
IMAGE_NAME="antt-multas-frontend"

# Build e Push
docker buildx build --platform linux/amd64 \
  -t ${REGISTRY}/${IMAGE_NAME}:${VERSION} \
  --build-arg VITE_GOOGLE_MAPS_API_KEY="AIzaSyB-yNuB_K8-lj8ymxpPLjjRwbMZ9guUpnA" \
  --build-arg VITE_AUTH_API_URL="https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4" \
  --build-arg VITE_AUTH_TOKEN="rdx2022@TCjj" \
  --build-arg VITE_AUTH_DATASET="37" \
  --build-arg VITE_API_URL="/api" \
  --push \
  ./frontend

echo "✅ Build e push concluídos!"
echo "📦 Imagem: ${REGISTRY}/${IMAGE_NAME}:${VERSION}"
echo ""
echo "Próximos passos:"
echo "1. Atualize a versão da imagem no docker-compose.frontend.yml"
echo "2. Rode: docker stack deploy -c docker-compose.frontend.yml antt-frontend"
```

Use:
```bash
chmod +x build-production.sh
./build-production.sh
```

## 🎓 Resumo

| Tipo de App | Como Funciona | Como Configurar no Docker |
|-------------|---------------|---------------------------|
| **Backend/Node** | Runtime | `environment` no compose |
| **Vite/Frontend** | Build time | `--build-arg` no build |

**Regra de Ouro:** 
> Variáveis `VITE_*` = `--build-arg` no Docker build!

## 📚 Referências

- [Vite - Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Docker - Build Args](https://docs.docker.com/engine/reference/commandline/build/#build-arg)
- [Docker - Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

