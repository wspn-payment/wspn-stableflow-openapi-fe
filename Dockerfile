FROM node:20-alpine AS builder
WORKDIR /app

# 设置环境变量
ARG VITE_ETH_RPC_URL
ARG VITE_API_BASE_URL
ARG VITE_ETH_BLOCKCHAIN_URL

COPY package*.json ./
RUN npm install --frozen-lockfile
COPY . .
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/dist . 

EXPOSE 5713
CMD ["npm", "run", "start"]


