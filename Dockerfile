
FROM node:18 AS build
ARG VITE_ETH_RPC_URL
ARG VITE_ETH_BLOCKCHAIN_URL
ARG VITE_API_BASE_URL
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build


FROM node:18 AS production
WORKDIR /app
COPY --from=build /app/dist /app/dist
# RUN yarn global add vite@4.4.5
COPY package.json yarn.lock ./
EXPOSE 5173
CMD ["yarn", "start"]
# CMD ["vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
