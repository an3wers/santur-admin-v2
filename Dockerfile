# syntax=docker/dockerfile:1.7
#
# Production image for santur-web (Nuxt 4 + Nitro).
# Build context = корень репозитория, см. docker-compose.prod.yml.
#
# База — debian-slim (glibc). sharp / @nuxt/image идут с prebuilt libvips
# и работают без системных vips, в отличие от musl/alpine.

ARG NODE_VERSION=24-alpine

# ---------------------------------------------------------------------------
# Build: установка зависимостей и сборка Nuxt
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS build

ENV CI=true \
    NODE_ENV=production \
    DEBIAN_FRONTEND=noninteractive \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    NUXT_TELEMETRY_DISABLED=1 \
    # Nuxt 4 + Vite 7 на большом приложении часто ест 2–4 GiB при сборке.
    # На VPS с ≤2 GiB RAM уменьшите (например 1536) или добавьте swap.
    NODE_OPTIONS="--max-old-space-size=2042"

WORKDIR /app

# package-lock.json сгенерирован npm 11 (опускает опциональные peer-deps).
# В node:22 идёт npm 10 — он из-за бага считает их обязательными и валит
# `npm ci`. Фиксируем npm под версию, которой сгенерирован lock.
RUN npm i -g npm@11

# Опциональная страховка: раскомментировать, если sharp/esbuild/oxc не найдут
# prebuilt musl-бинарников (нужно начиная с sharp < 0.33).
# RUN apk add --no-cache python3 make g++ vips-dev

COPY package.json package-lock.json ./

# `--ignore-scripts` — чтобы postinstall (`nuxt prepare`) не запускался
# до копирования исходника с nuxt.config.ts. prepare прогонит сам `nuxt build`.
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm install --ignore-scripts --no-audit --no-fund

    # TODO: разобраться в проблеме установки через ci и package-lock.json
    #npm ci --ignore-scripts

COPY . .

# `--logLevel info` — периодический вывод в лог Docker, чтобы сборка не
# выглядела «зависшей» на этапе Tailwind/Vite.
RUN npm run build -- --logLevel info

# ---------------------------------------------------------------------------
# Runtime: минимальный образ, только Nitro output
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000

# `node` user уже есть в официальном образе. `.output` самодостаточен для
# Nitro — `.nuxt` нужен только во время сборки и в runtime не копируется.
COPY --from=build --chown=node:node /app/.output ./.output

USER node

EXPOSE 3000

# Сигналы (SIGTERM от docker stop) прокидываются через `init: true` в
# docker-compose, отдельный tini не нужен.
CMD ["node", ".output/server/index.mjs"]
