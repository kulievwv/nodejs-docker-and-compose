FROM node:16-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN npm run build

FROM node:16-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

RUN npm install pm2 -g

COPY --from=build /app/dist ./dist
COPY ecosystem.config.js ./

EXPOSE 4000
CMD ["pm2-runtime", "ecosystem.config.js"]