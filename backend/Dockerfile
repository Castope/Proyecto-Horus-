FROM node:22-bookworm-slim AS build
WORKDIR /app

# postinstall genera Prisma; necesita el esquema y el script antes de npm ci.
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY scripts/prisma-generate.cjs ./scripts/prisma-generate.cjs
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build
# Conserva el cliente generado y elimina herramientas de desarrollo.
RUN npm prune --omit=dev --ignore-scripts

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node migrations ./migrations
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
