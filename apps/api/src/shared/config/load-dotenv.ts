import { config } from 'dotenv';
import { resolve } from 'node:path';

/**
 * Carrega variáveis de ambiente ANTES de qualquer outro import (efeito colateral).
 * O monorepo mantém um único `.env` na RAIZ (usado também pelo docker-compose).
 * Como os scripts rodam com cwd em `apps/api` (npm `-w`), precisamos apontar
 * explicitamente para a raiz. Em produção (container), as variáveis já vêm do
 * ambiente e nenhum arquivo é necessário — `dotenv` apenas não encontra e segue.
 * Ver docs/09_Backend_Architecture.md §9 e docs/27_DevOps.md.
 */
config(); // ./.env, se existir (ex.: rodando de dentro de apps/api com .env local)
config({ path: resolve(process.cwd(), '..', '..', '.env') }); // raiz do monorepo
