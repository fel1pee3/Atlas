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

# npm exec -w @atlas/api usa cwd=apps/api → schema relativo a esse dir.
RUN npm run build -w @atlas/shared \
 && npm exec -w @atlas/api -- prisma generate --schema prisma/schema.prisma \
 && npm run build -w @atlas/api

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime
WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

# Prod deps + CLI prisma (só para generate no runtime — evita stub do @prisma/client).
RUN npm ci --omit=dev \
 && npm install prisma@6.19.3 --no-save --workspace=@atlas/api

COPY --from=builder /repo/packages/shared/dist ./packages/shared/dist
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/prisma ./apps/api/prisma

# Gera o client NO mesmo node_modules que a API vai usar em runtime.
RUN npm exec -w @atlas/api -- prisma generate --schema prisma/schema.prisma

ENV NODE_ENV=production

EXPOSE 3333
CMD ["node", "apps/api/dist/main.js"]
