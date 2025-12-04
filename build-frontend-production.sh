#!/bin/bash

# Script de Build de Produção - ANTT Multas Frontend
# Uso: ./build-production.sh [versão]
# Exemplo: ./build-production.sh v-1.0.3

set -e  # Para o script em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
VERSION="${1:-v-1.0.3}"  # Usa argumento ou valor padrão
REGISTRY="us-west1-docker.pkg.dev/rodoxisto-415812/rdx-docker-services"
IMAGE_NAME="antt-multas-frontend"
FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${VERSION}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        🐳 Build de Produção - ANTT Multas Frontend           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📦 Configurações:${NC}"
echo -e "   Versão: ${GREEN}${VERSION}${NC}"
echo -e "   Imagem: ${GREEN}${FULL_IMAGE}${NC}"
echo ""

# Confirmação
read -p "$(echo -e ${YELLOW}Continuar com o build? [y/N]:${NC} )" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}❌ Build cancelado.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔨 Iniciando build...${NC}"
echo ""

# Build e Push
docker buildx build --platform linux/amd64 \
  -t ${FULL_IMAGE} \
  --build-arg VITE_GOOGLE_MAPS_API_KEY="AIzaSyB-yNuB_K8-lj8ymxpPLjjRwbMZ9guUpnA" \
  --build-arg VITE_AUTH_API_URL="https://rec4.rodoxisto.com.br/Rec_4_APIs/rest/Gateway/Rec4" \
  --build-arg VITE_AUTH_TOKEN="rdx2022@TCjj" \
  --build-arg VITE_AUTH_DATASET="37" \
  --build-arg VITE_API_URL="/api" \
  --push \
  ./frontend

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  ✅ BUILD CONCLUÍDO COM SUCESSO!              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}📦 Imagem criada:${NC} ${GREEN}${FULL_IMAGE}${NC}"
    echo ""
    echo -e "${YELLOW}📋 Próximos passos:${NC}"
    echo ""
    echo -e "   ${BLUE}1.${NC} Atualize a versão da imagem no docker-compose.frontend.yml:"
    echo -e "      ${GREEN}image: ${FULL_IMAGE}${NC}"
    echo ""
    echo -e "   ${BLUE}2.${NC} Faça o deploy no Swarm:"
    echo -e "      ${GREEN}docker stack deploy -c docker-compose.frontend.yml antt-frontend${NC}"
    echo ""
    echo -e "   ${BLUE}3.${NC} Verifique os logs:"
    echo -e "      ${GREEN}docker service logs antt-frontend_antt-frontend -f${NC}"
    echo ""
    echo -e "   ${BLUE}4.${NC} Teste a aplicação:"
    echo -e "      ${GREEN}https://extratormultas.rodoxisto.com.br${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                     ❌ BUILD FALHOU!                          ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Verifique os erros acima e tente novamente.${NC}"
    echo ""
    exit 1
fi

