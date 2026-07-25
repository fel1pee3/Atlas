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
# Em workspaces o client pode cair em node_modules da raiz OU de apps/api.
RUN npm run build -w @atlas/shared \
 && npm exec -w @atlas/api -- prisma generate --schema prisma/schema.prisma \
 && npm run build -w @atlas/api \
 && mkdir -p /repo/.prisma-out \
 && if [ -d /repo/node_modules/.prisma ]; then \
      cp -a /repo/node_modules/.prisma /repo/.prisma-out/.prisma; \
    elif [ -d /repo/apps/api/node_modules/.prisma ]; then \
      cp -a /repo/apps/api/node_modules/.prisma /repo/.prisma-out/.prisma; \
    else \
      echo "ERROR: .prisma not found after generate" >&2; \
      find /repo -type d -name '.prisma' 2>/dev/null || true; \
      exit 1; \
    fi \
 && if [ -d /repo/node_modules/@prisma ]; then \
      cp -a /repo/node_modules/@prisma /repo/.prisma-out/@prisma; \
    elif [ -d /repo/apps/api/node_modules/@prisma ]; then \
      cp -a /repo/apps/api/node_modules/@prisma /repo/.prisma-out/@prisma; \
    else \
      echo "ERROR: @prisma not found after generate" >&2; \
      exit 1; \
    fi

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
# Client gerado no builder (caminho pode variar no monorepo — consolidado acima).
COPY --from=builder /repo/.prisma-out/.prisma ./node_modules/.prisma
COPY --from=builder /repo/.prisma-out/@prisma ./node_modules/@prisma

EXPOSE 3333
CMD ["node", "apps/api/dist/main.js"]
