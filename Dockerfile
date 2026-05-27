FROM node:18-alpine
WORKDIR /app

# 复制所有文件
COPY . .

# 安装依赖并构建
RUN cd frontend && npm install && npm run build
RUN cd backend && npm install

# 暴露端口
EXPOSE 3000

# 启动后端（如果你的入口不是server.js，改成对应的文件名）
CMD ["node", "backend/server.js"]