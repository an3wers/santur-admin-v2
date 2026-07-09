# Logging-подсистема (log-server)

Реализует компонент 2 из [`docs/tz-logging-system.md`](./docs/tz-logging-system.md):
единая точка входа для клиентских (браузер) и серверных (Nitro SSR) логов, их
валидация и запись в **VictoriaLogs**, плюс query-API для дашборда admin app.
Хранилище (порт 9428) доступно только этому сервису и наружу не публикуется.

## Эндпоинты

| Метод и путь            | Доступ                          | Назначение                          |
| ----------------------- | ------------------------------- | ----------------------------------- |
| `POST /ingest`          | CORS-whitelist `ALLOWED_ORIGINS`, rate limit* | Батчи событий из браузера |
| `POST /ingest/server`   | Заголовок `x-api-key`           | Серверные логи Nitro (SSR)          |
| `POST /admin/query`     | CORS-whitelist `ADMIN_ORIGINS`  | LogsQL-запросы для дашборда          |
| `GET  /health`          | Внутренний                      | Healthcheck                         |

Dev-инструментарий (регистрируется только при `NODE_ENV !== 'production'`):

| Метод и путь                          | Назначение                                        |
| ------------------------------------- | ------------------------------------------------- |
| `POST /dev/emit`                      | Прогон фикстур/`{ events }` через реальный ingest  |
| `GET  /dev/dump`                      | Последние N событий из VictoriaLogs                |

\* Rate limit (120 событий/мин на IP) в текущей итерации — pass-through заглушка
`ingestLimiter` с TODO; будет реализован на `express-rate-limit`.

> **MVP-упрощение (см. §6.4 ТЗ).** Доверенная атрибуция через logging-token/JWT
> отложена. Клиент шлёт `userId` (0 = гость) и `sessionId` прямо в запросе,
> серверу доверяем. `/admin/query` без JWT — админка контролируемая, доступ
> ограничивается CORS-whitelist `ADMIN_ORIGINS`.

## Контракт: конверт и событие

Батч из браузера отправляется как `text/plain` (simple CORS request, без preflight;
`application/json` тоже принимается) в виде **конверта** (§5.2):

```jsonc
{
  "userId": 42,                        // id пользователя; 0 = гость
  "events": [ { ...event }, ... ]      // 1..50, больше — обрезается
}
```

Каждое событие — плоский JSON + вложенный `ctx` (§4):

```jsonc
{
  "ts": "2026-07-08T12:00:00.000Z",   // ISO 8601, время источника
  "level": "info",                     // debug | info | warn | error
  "event": "checkout.order.created",   // только из таксономии, см. ниже
  "sessionId": "s_9f8a7b",
  "url": "/checkout/payment",
  "release": "1.14.2",
  "ctx": { "orderId": "o_991" }        // произвольный контекст
}
```

Поля, которые проставляет **сервер** к каждому событию:

| Поле            | Источник                                                        |
| --------------- | -------------------------------------------------------------- |
| `userId`        | из конверта (MVP: доверяем клиенту); `0` = гость                |
| `authenticated` | производное: `userId !== 0`                                     |
| `ip`            | `req.ip` (с учётом `trust proxy`)                               |
| `ua`            | `User-Agent`, ≤ 256 символов                                    |
| `serverTs`      | серверное время (ISO)                                           |
| `source`        | `client` (`/ingest`) или `server` (`/ingest/server`)           |

### Таксономия событий (§4.1)

Формат `domain.action[.result]`, regex `^[a-z]+(\.[a-z_]+){1,2}$`. Событие вне
whitelist молча отбрасывается. Домены: `auth`, `cart`, `checkout`, `network`,
`js`, `app`, `server`. Полный список — в
[`src/utils/log-schema.ts`](./src/utils/log-schema.ts) (`TAXONOMY`). Добавление
события = PR в ТЗ + в `TAXONOMY`.

### Санитайзер PII (§6.3)

Ко всем строковым значениям `ctx` (см. [`src/utils/sanitize.ts`](./src/utils/sanitize.ts)):

- ключи по regex `pass|token|secret|card|cvv|cvc|auth` → `[redacted]`;
- email → маскируется (`j***@mail.com`);
- номера карт (13–19 цифр) → `[card]`;
- строки обрезаются до 1000 символов;
- `ctx` > 4 КБ обрезается с пометкой `ctx_truncated: true`.

## Атрибуция userId (§6.4, MVP)

На этапе MVP доверенная атрибуция через logging-token/JWT **отложена** ради
простоты клиента. Клиент отправляет `userId` (0 = гость) и `sessionId` прямо в
запросе, сервер им доверяет и проставляет `userId` + производное `authenticated`.
Гость и авторизованный пользователь различаются по `userId === 0`.

Пост-MVP усиление (описано в §6.4 ТЗ, сейчас не реализовано): короткоживущий
HS256 logging-token от auth backend + офлайн-проверка на ingest и поле
`userIdTrusted`.

## Переменные окружения

Дополнительно к прокси-ключам (`PORT`, `NODE_ENV`, `SBER_*`, `API_SECRET`, `MAIL_*`):

| Переменная             | Назначение                                              |
| ---------------------- | ------------------------------------------------------- |
| `VICTORIA_LOGS_URL`    | URL VictoriaLogs (`http://victorialogs:9428` в compose) |
| `ALLOWED_ORIGINS`      | CORS-whitelist для `/ingest` (список через запятую)     |
| `ADMIN_ORIGINS`        | CORS-whitelist для `/admin/query`                       |
| `INGEST_API_KEY`       | Ключ канала `/ingest/server`                            |

## Быстрая проверка (curl)

Поднять VictoriaLogs и dev-сервер:

```bash
docker run --rm -p 9428:9428 victoriametrics/victoria-logs:latest
npm run dev
```

```bash
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

```bash
# health
curl -s localhost:5005/health

# ingest с whitelisted origin (text/plain, конверт с userId) -> 202 { accepted }
curl -s -X POST localhost:5005/ingest \
  -H 'Origin: http://localhost:3000' -H 'content-type: text/plain' \
  -d "{\"userId\":42,\"events\":[{\"ts\":\"$(date -u +%FT%TZ)\",\"level\":\"info\",\"event\":\"cart.add\",\"sessionId\":\"s_1\",\"url\":\"/\",\"ctx\":{\"sku\":\"A\",\"qty\":1,\"price\":100}}]}"

# гость: userId 0 (или отсутствует) -> authenticated=false
curl -s -X POST localhost:5005/ingest \
  -H 'Origin: http://localhost:3000' -H 'content-type: text/plain' \
  -d "{\"userId\":0,\"events\":[{\"ts\":\"$(date -u +%FT%TZ)\",\"level\":\"info\",\"event\":\"app.session.started\",\"sessionId\":\"s_2\",\"url\":\"/\",\"ctx\":{}}]}"

# чужой origin -> 403
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:5005/ingest \
  -H 'Origin: https://evil.com' -H 'content-type: text/plain' -d '{}'

# прогон фикстур (включая «грязное» PII-событие) через реальный пайплайн
curl -s -X POST localhost:5005/dev/emit

# admin/query (без JWT — только origin admin app) -> последние события
curl -s -X POST localhost:5005/admin/query \
  -H 'Origin: http://localhost:3005' -H 'content-type: application/json' \
  -d '{"userId":7,"endpoint":"query","query":"*","limit":50}'
```

## LogsQL (§8.3) — основа для дашборда

```text
# ошибки за час по событию
_time:1h level:error | stats by (event) count() errors | sort by (errors desc)

# топ падающих эндпоинтов
_time:24h event:network.error | stats by (ctx.urlPath, ctx.status) count() c | sort by (c desc) | limit 20

# воронка за сутки по уникальным сессиям
_time:24h event:in(auth.login.success, cart.add, checkout.started, checkout.order.created)
  | stats by (event) count_uniq(sessionId)

# вся сессия пользователя (client + server)
sessionId:"s_9f8a7b" | sort by (serverTs)
```

## Развёртывание

`docker-compose.prod.yml` поднимает `server` + `victorialogs` в общей сети
`logging`; порт 9428 наружу не публикуется. Retention — 30 дней. Локально
VictoriaLogs можно запускать отдельно, указав `VICTORIA_LOGS_URL=http://localhost:9428`.

## TAXONOMY
```Typescript
export const TAXONOMY = [
  // auth
  'auth.login.success',
  'auth.login.failed',
  'auth.register.success',
  'auth.register.failed',
  'auth.logout',
  // cart
  'cart.add',
  'cart.remove',
  'cart.update_qty',
  'cart.clear',
  'cart.sync.failed',
  // checkout
  'checkout.started',
  'checkout.step',
  'checkout.delivery.selected',
  'checkout.payment.submitted',
  'checkout.payment.failed',
  'checkout.order.created',
  'checkout.abandoned',
  // network
  'network.error',
  // js
  'js.error',
  'js.unhandled_rejection',
  // app
  'app.session.started',
  'app.vue.error',
  // server
  'server.request.failed',
  'server.render.failed',
  // sber-прокси (BFF): исход обращения к OAuth/Fintech API Сбера
  'server.sber.success',
  'server.sber.failed'
] as const
```
## Response example

***/admin/query***

body:

```Json
{
    "endpoint": "query",
    "query": "*"
}
```

Response:

```Json
{
    "_msg": "app.session.started",
    "_stream": "{level=\"info\",source=\"client\"}",
    "_stream_id": "0000000000000000c974d0f1654651093ae13fb2ba593578",
    "_time": "2026-07-08T13:22:33.034Z",
    "authenticated": "false",
    "ip": "::1",
    "level": "info",
    "release": "1.0.0",
    "sessionId": "s_test",
    "source": "client",
    "ts": "2026-07-08T12:00:00.000Z",
    "ua": "curl/8.5.0",
    "url": "/",
    "userId": "0"
}
{
    "_msg": "app.session.started",
    "_stream": "{level=\"info\",source=\"client\"}",
    "_stream_id": "0000000000000000c974d0f1654651093ae13fb2ba593578",
    "_time": "2026-07-08T12:41:08.746Z",
    "authenticated": "false",
    "ip": "::ffff:172.26.0.1",
    "level": "info",
    "sessionId": "s_2",
    "source": "client",
    "ts": "2026-07-08T12:00:00.000Z",
    "ua": "PostmanRuntime/7.51.1",
    "url": "http://localhost:3000",
    "userId": "0"
}
```
