FROM node:20-alpine AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner

ENV PORT=3001

COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.output ./.output
COPY .env.local ./.env.local

EXPOSE 3001

CMD ["node", ".output/server/index.mjs"]
