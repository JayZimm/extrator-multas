# Sistema de Análise de Multas ANTT

Sistema web para listagem e análise de Autos de Infração da ANTT.

## 🚀 Tecnologias

- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js v23.11 + Express 4
- Database: MongoDB 6
- Deploy: Docker Swarm

## 📋 Planejamento de Tarefas

### Fase 1: Setup Inicial
- [ ] Criar estrutura do projeto (frontend + backend)
- [ ] Configurar Docker e Docker Swarm
- [ ] Configurar MongoDB e índices
- [ ] Setup do ambiente de desenvolvimento

### Fase 2: Backend
- [ ] Implementar conexão com MongoDB
- [ ] Criar modelo de Auto de Infração
- [ ] Implementar endpoints da API
- [ ] Implementar exportação CSV
- [ ] Configurar CORS e middlewares

### Fase 3: Frontend
- [ ] Setup do projeto React + Vite
- [ ] Implementar tema claro/escuro
- [ ] Criar componentes base
- [ ] Implementar tabela paginada
- [ ] Implementar filtros e busca
- [ ] Implementar exportação CSV

### Fase 4: Deploy
- [ ] Configurar Dockerfile multi-stage
- [ ] Criar stack.yml para Swarm
- [ ] Configurar secrets
- [ ] Testar deploy local

## 🔧 Setup Local

### Pré-requisitos
- Node.js v23.11
- Docker e Docker Swarm
- MongoDB 6

### Instalação

1. Clone o repositório
```bash
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

4. Inicie o ambiente de desenvolvimento
```bash
docker compose up
```

## 🚀 Deploy em Produção

### Build e Push para Docker Hub

Para construir e enviar as imagens para o Docker Hub em produção, siga os passos abaixo:

1. **Login no Docker Hub**
```bash
docker login
```

2. **Build e Push do Frontend**
```bash
# Build e push do frontend com a chave do Google Maps
docker buildx build --platform linux/amd64 \
  -t jefzimmer/antt-multas-frontend:v.0.0.2 \
  --build-arg VITE_GOOGLE_MAPS_API_KEY="sua-chave-aqui" \
  ./frontend \
  --push
```
**Build no Artifact Registre (Provedor de registro do GCP)

docker buildx build --platform linux/amd64 -t us-west1-docker.pkg.dev/rodoxisto-415812/rdx-docker-services/antt-multas-frontend:v-0.0.2 --build-arg VITE_GOOGLE_MAPS_API_KEY="AIzaSyB-yNuB_K8-lj8ymxpPLjjRwbMZ9guUpnA" --push .

3. **Build e Push do Backend**
```bash
# Build e push do backend
docker buildx build --platform linux/amd64 \
  -t jefzimmer/antt-multas-backend:v.0.0.1 \
  ./backend \
  --push
```
docker buildx build --platform linux/amd64 -t us-west1-docker.pkg.dev/rodoxisto-415812/rdx-docker-services/antt-multas-backend:v-0.0.2 --push .

### Observações Importantes

- Use `buildx` para garantir compatibilidade com diferentes plataformas
- A flag `--platform linux/amd64` garante compatibilidade com a maioria dos servidores
- A flag `--push` faz o upload da imagem diretamente para o Docker Hub
- Para o frontend, é necessário passar a chave do Google Maps como build arg
- As versões das imagens devem ser incrementadas conforme novas features são adicionadas

## 📝 Pending Questions

1. Qual o formato exato dos campos adicionais mencionados em "demais campos do anexo"?
2. Existem requisitos específicos de segurança além do CORS?
3. Qual o volume esperado de dados para otimização de performance?
4. Existem requisitos específicos de acessibilidade?

## 📊 Métricas de Performance

- p95 ≤ 800ms para busca paginada em 50k documentos
- UI responsiva ≥ 768px
- Réplicas saudáveis no Docker Swarm

## 🔐 Segurança

- Conexão MongoDB via variável de ambiente
- Secrets gerenciados via Docker Swarm
- CORS configurado adequadamente

## 📄 Licença

Este projeto está sob a licença MIT. 