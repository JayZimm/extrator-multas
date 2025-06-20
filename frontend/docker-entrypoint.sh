#!/bin/sh

# Ler a chave do arquivo de secret
GOOGLE_MAPS_API_KEY=$(cat ${VITE_GOOGLE_MAPS_API_KEY_FILE})

# Log para debug
echo "Conteúdo do arquivo de secret:"
cat ${VITE_GOOGLE_MAPS_API_KEY_FILE}

# Criar arquivo .env.production
cat > /usr/share/nginx/html/.env.production << EOF
VITE_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY}
EOF

# Log para debug
echo "Conteúdo do .env.production:"
cat /usr/share/nginx/html/.env.production

# Executar o comando passado como argumento
exec "$@" 