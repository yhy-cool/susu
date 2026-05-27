FROM node:20-alpine
WORKDIR /app

# 先复制依赖，利用Docker缓存
COPY package*.json ./
RUN npm ci --only=production

# 复制所有代码
COPY . .

# 暴露你的后端端口（你之前统一成了3000，这里保持一致）
EXPOSE 3000

# 启动命令（和你PM2里的一样，比如是app.js就写app.js，是index.js就改index.js）
CMD ["node", "app.js"]