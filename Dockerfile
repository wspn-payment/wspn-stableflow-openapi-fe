FROM node:20-alpine AS builder
WORKDIR /app

# 设置环境变量
ARG VITE_ETH_RPC_URL
ARG VITE_API_BASE_URL
ARG VITE_ETH_BLOCKCHAIN_URL

# 将 ARG 转换为 ENV，供构建过程使用
ENV VITE_ETH_RPC_URL=$VITE_ETH_RPC_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ETH_BLOCKCHAIN_URL=$VITE_ETH_BLOCKCHAIN_URL

COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY vite.config.ts ./
RUN npm install --frozen-lockfile
COPY --from=builder /app/dist ./dist  

EXPOSE 5173
CMD ["npm", "run", "start"]


