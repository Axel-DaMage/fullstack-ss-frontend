# ============================================
# Build stage - Compilar React app
# ============================================
FROM node:20-alpine AS build
WORKDIR /app

# Copiar dependencias primero para cachear
COPY package*.json ./
RUN npm ci --production=false

# Variable de entorno para el build (se inyecta desde GitHub Actions)
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Copiar código fuente y compilar
COPY . .
RUN npm run build

# ============================================
# Production stage - Nginx optimizado
# ============================================
FROM nginx:1.25-alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos estáticos desde build
COPY --from=build /app/dist /usr/share/nginx/html

# Usuario no-root (nginx alpine ya tiene usuario nginx)
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]