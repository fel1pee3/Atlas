# =============================================================================
# Atlas API — imagem de produção (multi-stage). Ver docs/27_DevOps.md
# Portável entre PaaS (Fly/Railway/Render) e AWS (ADR-0011).
# Build a partir da RAIZ do monorepo:  docker build -f apps/api/Dockerfile .
# =============================================================================

# ---- Stage 1: build ----
FROM node:22-alpine AS builder
WORKDIR /repo
# Railway injeta NODE_ENV=production no build; sem isso o npm ci omite
# devDependencies e o CLI `prisma` (devDep) some → "prisma: not found".
ENV NODE_ENV=development

# Manifests (cache de dependências)
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN npm ci --include=dev

# Código
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN npm run build -w @atlas/shared \
 && npm exec -w @atlas/api -- prisma generate --schema apps/api/prisma/schema.prisma \
 && npm run build -w @atlas/api

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN npm ci --omit=dev

COPY --from=builder /repo/packages/shared/dist ./packages/shared/dist
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/prisma ./apps/api/prisma
COPY --from=builder /repo/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3333
CMD ["node", "apps/api/dist/main.js"]
