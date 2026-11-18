FROM node:lts AS base
WORKDIR /app

COPY package.json package-lock.json ./

FROM base AS prod-deps
RUN npm ci --omit=dev

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY server.js tela.html ./
COPY css ./css
COPY img ./img
COPY sounds ./sounds

EXPOSE 3000
USER node
CMD ["node", "server.js"]
