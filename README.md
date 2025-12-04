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
# IMPORTANTE: O arquivo .env deve ficar na RAIZ do projeto, não dentro de frontend/
cp .env.example .env
```

Edite o arquivo `.env` na **raiz do projeto** e configure as variáveis de autenticação:
```env
# API Backend
VITE_API_URL=http://localhost:3000

# API de Autenticação
VITE_AUTH_API_URL=https://osdev.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4
VITE_AUTH_TOKEN=rdx2022@TCjj
VITE_AUTH_DATASET=37
```

**Nota:** O Vite está configurado (`envDir: '..'` no `vite.config.js`) para ler variáveis de ambiente da raiz do projeto.

4. Inicie o ambiente de desenvolvimento
```bash
docker compose up
```

## 🔐 Autenticação

O sistema utiliza um sistema de autenticação via API externa. Todas as rotas do frontend são protegidas e requerem login.

### Funcionalidades de Autenticação

- **Login**: Tela de login com validação de credenciais via API externa
- **Proteção de Rotas**: Todas as páginas são protegidas e redirecionam para login se não autenticado
- **Logout**: Botão de logout disponível na sidebar
- **Campo Senha**: Possui ícone de "olho" para visualizar/ocultar a senha digitada
- **Persistência**: Sessão mantida no localStorage do navegador

### Credenciais de Teste

Para testar o sistema, utilize as credenciais fornecidas pelo administrador do sistema.

### Fluxo de Autenticação

1. Usuário acessa qualquer rota do sistema
2. Se não autenticado, é redirecionado para `/login`
3. Após login bem-sucedido, é redirecionado para a página original solicitada
4. A sessão é mantida até que o usuário faça logout ou limpe o cache do navegador

### API de Autenticação

O sistema se integra com a API de autenticação através do endpoint:
- **URL**: Configurada via `VITE_AUTH_API_URL`
- **Método**: POST
- **Response Success**: `StatusCode: 200`
- **Response Error**: `StatusCode: 404`

**Nota**: Não há funcionalidade de recuperação de senha implementada.

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

## 🔒 Segurança

- **Autenticação**: Sistema de login integrado com API externa
- **Proteção de Rotas**: Todas as páginas requerem autenticação
- **Conexão MongoDB**: Credenciais via variável de ambiente
- **Secrets**: Gerenciados via Docker Swarm
- **CORS**: Configurado adequadamente
- **Token de API**: Armazenado em variáveis de ambiente

## 📄 Licença

Este projeto está sob a licença MIT. 