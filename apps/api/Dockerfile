# =============================================================================
# Atlas API — imagem de produção (multi-stage). Ver docs/27_DevOps.md
# Build a partir da RAIZ do monorepo:  docker build -f apps/api/Dockerfile .
# =============================================================================

# ---- Stage 1: build ----
FROM node:22-alpine AS builder
WORKDIR /repo
# Railway injeta NODE_ENV=production; precisamos do CLI prisma (devDependency).
ENV NODE_ENV=development

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN npm ci --include=dev

COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Client Prisma vai para apps/api/src/generated/prisma (path fixo no schema).
# Nest copia para dist/generated via assets; reforçamos com cp.
RUN npm run build -w @atlas/shared \
 && npm exec -w @atlas/api -- prisma generate --schema prisma/schema.prisma \
 && npm run build -w @atlas/api \
 && mkdir -p apps/api/dist/generated \
 && cp -a apps/api/src/generated/. apps/api/dist/generated/ \
 && test -f apps/api/dist/generated/prisma/default.js \
    -o -f apps/api/dist/generated/prisma/index.js

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN npm ci --omit=dev

COPY --from=builder /repo/packages/shared/dist ./packages/shared/dist
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/prisma ./apps/api/prisma

EXPOSE 3333
CMD ["node", "apps/api/dist/main.js"]
