# =============================================================================
# Atlas API — imagem de produção (multi-stage). Ver docs/27_DevOps.md
# Portável entre PaaS (Fly/Railway/Render) e AWS (ADR-0011).
# Build a partir da RAIZ do monorepo:  docker build -f apps/api/Dockerfile .
# =============================================================================

# ---- Stage 1: build + prisma generate ----
FROM node:22-alpine AS builder
WORKDIR /repo
# Railway injeta NODE_ENV=production no build; forçamos devDeps (CLI prisma).
ENV NODE_ENV=development

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN npm ci --include=dev

COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Gera client e sincroniza para node_modules da RAIZ (onde o Node resolve em runtime).
# Em workspaces o generate pode escrever só em apps/api/node_modules — sem sync, a
# API sobe com o stub "@prisma/client has not been initialized".
RUN npm run build -w @atlas/shared \
 && npm exec -w @atlas/api -- prisma generate --schema prisma/schema.prisma \
 && npm run build -w @atlas/api \
 && CLIENT_DEFAULT="$(find /repo -type f -path '*/node_modules/@prisma/client/default.js' | while read -r f; do \
      if ! grep -q 'not been initialized' "$f" 2>/dev/null; then echo "$f"; break; fi; \
    done)" \
 && test -n "$CLIENT_DEFAULT" \
 && CLIENT_DIR="$(dirname "$CLIENT_DEFAULT")" \
 && echo "Using generated Prisma client at $CLIENT_DIR" \
 && mkdir -p /repo/node_modules/@prisma \
 && rm -rf /repo/node_modules/@prisma/client \
 && cp -a "$CLIENT_DIR" /repo/node_modules/@prisma/client \
 && PRISMA_DOT="$(find /repo -type d -path '*/node_modules/.prisma/client' | head -n1)" \
 && test -n "$PRISMA_DOT" \
 && rm -rf /repo/node_modules/.prisma \
 && mkdir -p /repo/node_modules/.prisma \
 && cp -a "$(dirname "$PRISMA_DOT")/." /repo/node_modules/.prisma/ \
 && npm prune --omit=dev

# ---- Stage 2: runtime (reusa node_modules já gerado) ----
FROM node:22-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=builder /repo/package.json /repo/package-lock.json ./
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /repo/packages/shared/dist ./packages/shared/dist
COPY --from=builder /repo/apps/api/package.json ./apps/api/package.json
COPY --from=builder /repo/apps/api/dist ./apps/api/dist
COPY --from=builder /repo/apps/api/prisma ./apps/api/prisma

EXPOSE 3333
CMD ["node", "apps/api/dist/main.js"]
