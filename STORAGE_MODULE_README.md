# Módulo de Gerenciamento de Arquivos - Google Cloud Storage

Este módulo permite aos usuários gerenciar arquivos e pastas no Google Cloud Storage (GCS) através de uma interface web moderna e intuitiva.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Listagem hierárquica**: Visualizar arquivos e pastas em estrutura de diretórios
- **Criação de pastas**: Criar novas "pastas" (objetos GCS terminados em "/")
- **Upload de arquivos**: Suporte a múltiplos arquivos com drag-and-drop
- **Navegação**: Breadcrumbs e navegação entre pastas
- **Visualizações**: Grade e lista com alternância
- **Progresso**: Barra de progresso durante uploads
- **Validação**: Validação de tipos de arquivo e tamanhos
- **Seleção múltipla**: Checkbox para seleção de múltiplos itens
- **Metadados**: Exibição de tamanho, tipo MIME e datas

### 🔄 Planejadas
- **Download de arquivos**: URLs assinadas para download seguro
- **Exclusão**: Remover arquivos e pastas selecionados
- **Paginação**: Scroll infinito para grandes volumes de dados
- **Pesquisa**: Busca por nome de arquivo
- **Visualização prévia**: Preview de imagens e documentos

## 🏗️ Arquitetura

### Backend (Node.js + Express)
```
backend/src/
├── services/
│   └── gcsService.js          # Serviço principal do GCS
├── routes/
│   └── storage.js             # Rotas da API REST
└── index.js                   # Configuração das rotas
```

### Frontend (React + Vite)
```
frontend/src/
├── pages/
│   └── StorageManager.jsx     # Página principal
├── components/
│   ├── StorageToolbar.jsx     # Barra de ferramentas
│   ├── StorageBreadcrumbs.jsx # Navegação hierárquica
│   ├── StorageGrid.jsx        # Visualização em grade
│   ├── StorageList.jsx        # Visualização em lista
│   ├── CreateFolderModal.jsx  # Modal de criação de pasta
│   └── UploadModal.jsx        # Modal de upload
├── hooks/
│   └── useStorage.js          # Hooks personalizados
└── services/
    └── storageService.js      # Cliente da API
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `backend/env.example` para `backend/.env` e configure:

```bash
# Google Cloud Storage
GCS_PROJECT_ID=seu-projeto-gcp
GCS_BUCKET_NAME=seu-bucket-name
GCS_KEY_FILE=./path/to/service-account-key.json
```

### 2. Service Account do Google Cloud

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Vá para **IAM & Admin > Service Accounts**
3. Crie uma nova Service Account
4. Baixe a chave JSON e salve em local seguro
5. Atribua as permissões mínimas:
   - `Storage Object Viewer`
   - `Storage Object Creator`
   - `Storage Object Admin` (para exclusão)

### 3. Permissões Mínimas Necessárias

```json
{
  "bindings": [
    {
      "role": "roles/storage.objectViewer",
      "members": ["serviceAccount:seu-service-account@projeto.iam.gserviceaccount.com"]
    },
    {
      "role": "roles/storage.objectCreator", 
      "members": ["serviceAccount:seu-service-account@projeto.iam.gserviceaccount.com"]
    }
  ]
}
```

### 4. Instalação de Dependências

```bash
# Backend
cd backend
npm install @google-cloud/storage multer

# Frontend (dependências já existentes)
# - axios: comunicação com API
# - @tanstack/react-query: gerenciamento de estado
# - @headlessui/react: componentes de UI
# - @heroicons/react: ícones
```

## 📡 API Endpoints

### GET /api/storage/list
Lista objetos do bucket com estrutura hierárquica.

**Query Parameters:**
- `prefix`: Prefixo da pasta (string, opcional)
- `page`: Número da página (number, padrão: 1)
- `limit`: Limite de itens (number, padrão: 50, máx: 100)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "type": "folder|file",
        "name": "nome-do-item",
        "path": "caminho/completo/",
        "size": 1024,
        "mimeType": "application/pdf",
        "timeCreated": "2024-01-01T00:00:00Z",
        "timeUpdated": "2024-01-01T00:00:00Z"
      }
    ],
    "currentPath": "pasta/atual/",
    "hasMore": false,
    "totalCount": 10,
    "page": 1,
    "limit": 50
  }
}
```

### POST /api/storage/folder
Cria uma nova pasta no bucket.

**Body:**
```json
{
  "path": "nova/pasta/"
}
```

### POST /api/storage/upload
Faz upload de arquivos (multipart/form-data).

**Form Data:**
- `files[]`: Arquivos para upload
- `path`: Caminho de destino (opcional)

### DELETE /api/storage/object
Exclui um arquivo ou pasta.

**Body:**
```json
{
  "path": "caminho/do/objeto"
}
```

### GET /api/storage/download/*
Gera URL assinada para download.

**Query Parameters:**
- `expires`: Tempo de expiração em minutos (padrão: 60)

### GET /api/storage/health
Verifica conectividade com o GCS.

## 🎨 Componentes React

### StorageManager
Componente principal que orquestra toda a funcionalidade.

### Hooks Personalizados

- `useStorageList`: Listagem com cache
- `useCreateFolder`: Criação de pastas
- `useFileUpload`: Upload com progresso
- `useDeleteObject`: Exclusão de objetos
- `useStorageNavigation`: Navegação hierárquica
- `useItemSelection`: Seleção múltipla
- `useStorageUI`: Estados da interface

### Características da UI

- **Responsiva**: Funciona em mobile, tablet e desktop
- **Acessível**: Navegação por teclado e screen readers
- **Drag & Drop**: Arraste arquivos diretamente na interface
- **Feedback Visual**: Loading states, progress bars, mensagens de erro
- **Validação**: Tipos de arquivo e tamanhos suportados

## 📊 Limitações Atuais

- **Tamanho máximo**: 50MB por arquivo
- **Quantidade**: Máximo 10 arquivos por upload
- **Tipos suportados**: Imagens, PDFs, documentos Office, arquivos de texto, planilhas e arquivos compactados
- **Paginação**: Implementação simples (será melhorada)

## 🚀 Como Usar

1. **Navegação**: Clique em pastas para navegar
2. **Criar Pasta**: Botão "Nova Pasta" na toolbar
3. **Upload**: Botão "Upload" ou arraste arquivos na área
4. **Visualização**: Alterne entre grade e lista
5. **Seleção**: Use checkboxes para seleção múltipla
6. **Breadcrumbs**: Clique para navegar rapidamente

## 🔒 Segurança

- Service Account com permissões mínimas
- Validação de tipos de arquivo no frontend e backend
- Sanitização de nomes de pastas e arquivos
- URLs assinadas com expiração para downloads
- Variáveis sensíveis em arquivos .env (não versionados)

## 🧪 Testes

Para testar o módulo:

1. Configure as variáveis de ambiente
2. Inicie o backend: `npm run dev`
3. Inicie o frontend: `npm run dev`
4. Acesse: `http://localhost:5173/storage`

## 📝 Próximos Passos

1. **Implementar exclusão** de arquivos/pastas
2. **Melhorar paginação** com scroll infinito
3. **Adicionar busca** por nome de arquivo
4. **Preview de arquivos** (imagens, PDFs)
5. **Operações em lote** (mover, copiar)
6. **Histórico de operações**
7. **Permissões por usuário**
8. **Integração com outros módulos** da aplicação

## 🐛 Troubleshooting

### Erro: "Variáveis de ambiente GCS não configuradas"
- Verifique se o arquivo `.env` existe no backend
- Confirme que as variáveis `GCS_PROJECT_ID`, `GCS_BUCKET_NAME` e `GCS_KEY_FILE` estão definidas

### Erro: "Arquivo de chave GCS não encontrado"
- Verifique se o caminho para o arquivo JSON da Service Account está correto
- Confirme que o arquivo existe e tem as permissões de leitura adequadas

### Erro: "Acesso negado"
- Verifique se a Service Account tem as permissões necessárias no bucket
- Confirme que o bucket existe e está no projeto correto

### Upload falha
- Verifique o tamanho do arquivo (máx 50MB)
- Confirme que o tipo de arquivo é suportado
- Verifique a conexão com a internet

---

Este módulo foi desenvolvido seguindo as melhores práticas de desenvolvimento React e Node.js, com foco em usabilidade, performance e segurança. 