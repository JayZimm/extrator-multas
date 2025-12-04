# Build stage
FROM node:18-alpine AS build

# Declare build arguments
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_AUTH_API_URL
ARG VITE_AUTH_TOKEN
ARG VITE_AUTH_DATASET
ARG VITE_API_URL

WORKDIR /app

# Create .env.production file with all environment variables
RUN echo "VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}" > .env.production && \
    echo "VITE_AUTH_API_URL=${VITE_AUTH_API_URL}" >> .env.production && \
    echo "VITE_AUTH_TOKEN=${VITE_AUTH_TOKEN}" >> .env.production && \
    echo "VITE_AUTH_DATASET=${VITE_AUTH_DATASET}" >> .env.production && \
    echo "VITE_API_URL=${VITE_API_URL}" >> .env.production

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Script para injetar variáveis de ambiente em runtime
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"] 