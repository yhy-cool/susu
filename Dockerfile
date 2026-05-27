# 构建前端
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 构建后端
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# 运行时镜像
FROM node:18-alpine
WORKDIR /app

COPY --from=backend-builder /app/backend ./
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3000
CMD ["node", "server.js"]