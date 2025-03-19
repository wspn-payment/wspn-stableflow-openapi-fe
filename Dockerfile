FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_ETH_RPC_URL
ARG VITE_API_BASE_URL
ARG VITE_ETH_BLOCKCHAIN_URL
ARG VITE_COGNITO_CLIENT_ID
ARG VITE_COGNITO_CLIENT_SECRET 

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set environment variables to handle optional dependencies
ENV ROLLUP_SKIP_NODEJS_NATIVE=1
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package*.json ./
# Install dependencies with --no-optional flag to skip problematic optional dependencies
RUN npm install --frozen-lockfile --no-optional
# Explicitly install missing rollup dependency if needed
RUN npm install @rollup/rollup-linux-x64-musl --no-save || true
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


