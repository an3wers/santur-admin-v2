# ТЗ: Система логирования и мониторинга e-commerce приложения на Nuxt

**Версия:** 1.3
**Дата:** 08.07.2026

> **MVP-упрощение (v1.3).** Чтобы не усложнять первую версию системы и клиент,
> доверенная атрибуция пользователя через **logging-token / JWT отложена**. В MVP:
> - клиент отправляет `userId` (0 = гость) и `sessionId` **напрямую** в конверте
>   каждого батча; серверу этих данных достаточно, они принимаются на доверии;
> - поле `userIdTrusted` заменено на производное `authenticated` (`userId !== 0`);
> - `POST /admin/query` работает **без JWT** — админка контролируемая, доступ
>   ограничивается CORS-whitelist admin-origin.
>
> Разделы 5.2, 6.4, 6.5 и критерии 12.8–12.9 ниже помечены как **[пост-MVP]** —
> это целевой дизайн (короткоживущий токен, офлайн-проверка подписи), к которому
> система вернётся при необходимости усилить доверие к атрибуции. Актуальный
> контракт MVP — в этой врезке и в `README.md` сервиса log-server.

## 1. Цель и задачи

### 1.1. Цель

Построить self-hosted систему сбора, хранения и визуализации логов клиентского e-commerce приложения на Nuxt 3, без платных SaaS и тяжеловесных стеков (ELK/Kibana). Система состоит из трёх элементов:

1. **Клиентское e-commerce приложение (Nuxt)** — источник событий (клиент + SSR).
2. **Log-server (Express.js + VictoriaLogs)** — отдельный сервис: приём, валидация, обогащение, хранение и query API.
3. **Admin app (существующий отдельный веб-сервис)** — UI дашборда, работает с логами через API log-server.

### 1.2. Задачи

1. Собирать структурированные события ключевого функционала магазина:
   - авторизация и регистрация;
   - корзина;
   - оформление заказа (checkout);
   - все сетевые ошибки (клиентские HTTP-запросы);
   - необработанные JS-ошибки и rejected promises.
   - сценарии будут пополнятся в процессе эксплуатации сервиса
2. Собирать серверные логи Nitro (SSR-ошибки, ошибки server routes) в тот же поток.
3. Хранить логи локально (self-hosted) с настраиваемым сроком хранения.
4. Предоставить в admin app дашборд: графики, фильтры, live tail, просмотр сессии пользователя.

### 1.3. Ограничения

- Только бесплатные self-hosted решения (open source).
- Минимальный операционный след: без Elasticsearch, Kafka, отдельных агентов.
- Собственный UI дашборда в admin app; Kibana/Grafana не используются, используем свое решение минимальное, в стиле MVP.
- VictoriaLogs не имеет собственной авторизации в OSS-версии → доступ к нему только из внутренней сети, весь внешний трафик — через log-server.

---

## 2. Выбранный стек

| Слой | Решение | Обоснование |
|---|---|---|
| Клиентский сбор | Собственный плагин Nuxt (~150 строк) | Полный контроль, нулевые зависимости, точно под нашу таксономию |
| Ingest + query API | **log-server: Express.js** (Node 20+, TypeScript) | Отдельный деплой, независимый от магазина; единая точка входа для клиента, SSR и admin app |
| Серверное логирование магазина | `pino` в Nitro → HTTP в log-server | Стандарт де-факто, JSON из коробки |
| Хранилище | **VictoriaLogs** | Один бинарник, ~50 МБ RAM, LogsQL, retention из коробки, HTTP API |
| Дашборд | Страницы в существующем admin app + Chart.js (или ECharts) | Свой UI, стек команды admin-сервиса |

### 2.1. Рассмотренные альтернативы (для протокола)

- **Grafana Loki** — рабочий вариант хранилища, но сложнее конфигурация, слабее full-text, LogQL менее удобен для агрегаций.
- **ClickHouse** — берём, если понадобится тяжёлая продуктовая аналитика (когорты, join с заказами). Схема события уже структурирована — миграция реалистична.
- **Fastify вместо Express** — допустимая замена (быстрее, схема-валидация из коробки); финальный выбор за командой log-server, требования ТЗ не меняются.
- **GlitchTip** (аналог Sentry) — опционально в фазе 4 для стектрейсов с sourcemaps и группировки JS-ошибок.

---

## 3. Архитектура

```
   ecommerce app (origin A)                        admin app (origin B)
┌──────────────────────────────┐                ┌──────────────────────────┐
│ Браузер (Nuxt client)        │                │ Дашборд логов            │
│ · перехват network/js ошибок │                │ · графики, live tail     │
│ · бизнес-события             │                │ · воронка, сессии        │
│ · буфер + batch/sendBeacon   │                └────────────┬─────────────┘
│ · logging-token в конверте   │                             │ POST /admin/query
└──────┬───────────────┬───────┘                             │ (JWT админа)
       │ cookie-сессия │ POST /ingest                        │
       ▼               │ (CORS, batch, text/plain)           │
┌──────────────────┐   │                                     │
│ auth backend     │   │                                     │
│ (отдельный)      │   │                                     │
│ · cookie-сессии  │   │                                     │
│ · GET /session/  │   │                                     │
│   logging-token  │   │                                     │
└──────────────────┘   │                                     │
                       │                                     │
┌──────────────────┐   │                                     │
│ Nuxt SSR (Nitro) │   │                                     │
│ · pino, 'error'  │   │                                     │
└──────┬───────────┘   │                                     │
       │ POST /ingest/server (API key)                       │
       ▼               ▼                                     ▼
┌─────────────────────────────────────────────────────────────┐
│  log-server (Express.js, origin C)                          │
│  · CORS-whitelist origin A и B                              │
│  · валидация (zod), rate limit, санитайзер PII              │
│  · проверка logging-token (общий секрет) → userId           │
│  · admin auth + whitelist LogsQL-эндпоинтов                 │
└───────────────────────────┬─────────────────────────────────┘
                            │ insert/jsonline · select/logsql/*
                ┌───────────▼───────────┐
                │ VictoriaLogs (docker) │
                │ · retention 30d       │
                │ · доступен ТОЛЬКО     │
                │   log-server'у        │
                └───────────────────────┘
```

Ключевые принципы:

1. **Один поток логов** — клиентские и серверные события в одной схеме, связь через `sessionId` / `requestId`.
2. **Клиенту не доверяем** — IP, ua, серверное время проставляет log-server; `userId` берётся из проверенного logging-token, который выдаёт auth backend по cookie-сессии (см. 6.4), иначе помечается недоверенным.
3. **Хранилище за периметром** — порт VictoriaLogs (9428) доступен только log-server'у; admin app и браузеры никогда не ходят в него напрямую.
4. **Единственная публичная поверхность log-server'а** — `POST /ingest`; всё остальное закрыто API-ключом или JWT админа.

---

## 4. Схема события (контракт)

Все события — плоский JSON + вложенный `ctx`. Контракт публикуется как npm-пакет/shared-модуль `@company/log-schema` (zod-схема + enum таксономии) и подключается в ecommerce app, log-server и admin app.

```jsonc
{
  // проставляет источник (клиент или Nitro)
  "ts": "2026-07-07T12:00:00.000Z",   // ISO 8601, время источника
  "level": "info",                     // debug | info | warn | error
  "event": "checkout.payment.failed",  // таксономия, см. 4.1
  "sessionId": "s_9f8a7b",             // uuid, живёт в sessionStorage
  "url": "/checkout/payment",          // route на момент события
  "release": "1.14.2",                 // версия приложения (env при сборке)
  "ctx": {                             // произвольный контекст события
    "orderId": "o_991",
    "reason": "3ds_timeout"
  },

  // проставляет log-server (ingest)
  "userId": 42,                        // MVP: из конверта (0 = гость). [пост-MVP: из logging-token]
  "authenticated": true,               // производное: userId !== 0. [пост-MVP: userIdTrusted по токену]
  "ip": "203.0.113.7",
  "ua": "Mozilla/5.0 ...",
  "serverTs": "2026-07-07T12:00:00.412Z",
  "source": "client"                   // client | server
}
```

Требования к схеме:

- `event` — только значения из утверждённой таксономии (4.1). Валидация по regex `^[a-z]+(\.[a-z_]+){1,2}$`.
- Размер события ≤ 8 КБ, `ctx` ≤ 4 КБ (log-server обрезает с пометкой `ctx_truncated: true`).
- **Запрещено логировать PII:** пароли, полные email (только маскированные `a***@mail.com`), номера карт, CVV, токены, содержимое полей форм. Ответственность — на вызывающем коде + фильтр-санитайзер в ingest (6.3).

### 4.1. Таксономия событий

Формат: `domain.action[.result]`.

| Домен | События | Уровень | Обязательный ctx |
|---|---|---|---|
| **auth** | `auth.login.success`, `auth.login.failed`, `auth.register.success`, `auth.register.failed`, `auth.logout`, `auth.password_reset.requested`, `auth.password_reset.failed` | info / warn | `failed`: `{ reason }` (invalid_credentials, rate_limited, server_error...) |
| **cart** | `cart.add`, `cart.remove`, `cart.update_qty`, `cart.clear`, `cart.sync.failed` | info / error | `{ sku, qty, price }` |
| **checkout** | `checkout.started`, `checkout.step`, `checkout.delivery.selected`, `checkout.payment.submitted`, `checkout.payment.failed`, `checkout.order.created`, `checkout.abandoned` | info / error | `step`: `{ step: 1..N }`; `order.created`: `{ orderId, total, itemsCount }`; `payment.failed`: `{ reason }` |
| **network** | `network.error` | error | `{ method, urlPath, status, durationMs }` — path без query (query может содержать PII) |
| **js** | `js.error`, `js.unhandled_rejection` | error | `{ message, stack (2000 симв.), file, line, col }` |
| **app** | `app.session.started`, `app.vue.error` | info / error | `session.started`: `{ referrer, viewport }` |
| **server** | `server.request.failed`, `server.render.failed` | error | `{ message, stack, requestId }` |

Добавление события в таксономию = PR в этот документ + в `@company/log-schema`.

---

## 5. Компонент 1: клиентский логгер (ecommerce app)

### 5.1. Требования

- **Ф-1.1.** Composable `useLogger()` с методами `log(event, ctx?, level?)` и шорткатами `info/warn/error`.
- **Ф-1.2.** Плагин автоматически перехватывает: ошибки `$fetch`/`useFetch` (`onResponseError` + `onRequestError`), `window.onerror`, `window.onunhandledrejection`, `nuxtApp.hook('vue:error')`.
- **Ф-1.3.** Буферизация: батч уходит при (а) 20 событиях, (б) 10 сек, (в) событии `error` — немедленно, (г) `visibilitychange → hidden` — через `navigator.sendBeacon`.
- **Ф-1.4.** Endpoint ingest — из `runtimeConfig.public.logIngestUrl` (кросс-доменный, например `https://logs.company.com/ingest`).
- **Ф-1.5.** **Кросс-доменная отправка без preflight:** батчи отправляются с `Content-Type: text/plain` (simple CORS request). Это касается и `fetch(keepalive)`, и `sendBeacon` (Blob с типом `text/plain`). Тело — JSON-массив, log-server парсит текст как JSON. Обоснование: `sendBeacon` не выполняет CORS-preflight и с `application/json` на чужой origin будет заблокирован.
- **Ф-1.6 (MVP).** Идентификация пользователя: клиент кладёт в конверт (5.2) поле `userId` (0 = гость) и `sessionId` — этих данных достаточно, они уже есть на клиенте. Кастомные заголовки при `text/plain` не нужны.
- **Ф-1.6 [пост-MVP].** Вместо `userId` в поле `auth` конверта кладётся **logging-token** (см. 6.4), т.к. с `text/plain` заголовки недоступны, а сессионная cookie auth backend'а до чужого origin не доходит. Гость — `auth: null`.
- **Ф-1.10 [пост-MVP].** Жизненный цикл logging-token на клиенте: получение при инициализации плагина, принудительное обновление после `auth.login.success` / `auth.logout`, Токен кэшируется синхронно в памяти — `flush`/`sendBeacon` никогда не ждут запроса за токеном. Недоступность auth backend не блокирует отправку: события уходят с `auth: null` (`userIdTrusted: false`).
- **Ф-1.7.** `sessionId` забираем на клиенте из httpOnly cookie или кладем sid сессии для авторизованного пользователя. `app.session.started` пишется при инициализации.
- **Ф-1.8.** Дедупликация JS-ошибок: одинаковая пара `message+line` не чаще 1 раза в 30 сек.
- **Ф-1.9.** Отказоустойчивость: логгер никогда не бросает исключения; буфер ограничен 200 событиями; ошибки запросов к самому ingest не логируются (нет рекурсии).

### 5.2. Формат конверта батча

Так как заголовки недоступны (Ф-1.5), батч заворачивается в конверт.

**MVP:**

```jsonc
{
  "userId": 42,                    // id пользователя, 0 = гость
  "events": [ { ...event }, ... ]  // 1..50 событий по схеме раздела 4
}
```

**[пост-MVP]** — доверенная атрибуция через logging-token:

```jsonc
{
  "auth": "eyJhbGciOi...",     // logging-token (6.4) или null (гость)
  "events": [ { ...event }, ... ]  // 1..50 событий по схеме раздела 4
}
```

### 5.3. Референсная реализация

```ts
// composables/useLogger.ts
type Level = 'debug' | 'info' | 'warn' | 'error'

const buffer: any[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
const MAX_BUFFER = 200
const BATCH_SIZE = 20
const FLUSH_INTERVAL = 10_000

function getSessionId(): string {
  let id = sessionStorage.getItem('log_sid')
  if (!id) {
    id = 's_' + crypto.randomUUID()
    sessionStorage.setItem('log_sid', id)
    document.cookie = `log_sid=${id}; path=/; SameSite=Lax`
  }
  return id
}

// logging-token кэшируется и обновляется проактивно (Ф-1.10):
// envelope() остаётся синхронным — sendBeacon не может ждать fetch за токеном
let loggingToken: string | null = null
let tokenExp = 0

export async function refreshLoggingToken(force = false) {
  if (!force && loggingToken && tokenExp - Date.now() > 120_000) return
  try {
    const base = useRuntimeConfig().public.authBackendUrl
    const r = await $fetch<{ token: string; expiresIn: number }>(
      `${base}/session/logging-token`,
      { credentials: 'include' }, // cookie-сессия auth backend
    )
    loggingToken = r.token
    tokenExp = Date.now() + r.expiresIn * 1000
  } catch {
    // гость (401) или auth backend недоступен — шлём auth: null (Ф-1.10)
    loggingToken = null
  }
}

function envelope(events: any[]) {
  return JSON.stringify({ auth: loggingToken, events })
}

async function flush(useBeacon = false) {
  if (!buffer.length) return
  const batch = buffer.splice(0, buffer.length)
  const url = useRuntimeConfig().public.logIngestUrl
  const body = envelope(batch)
  try {
    if (useBeacon && navigator.sendBeacon) {
      // text/plain => simple request, preflight не нужен (Ф-1.5)
      navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' }))
    } else {
      await fetch(url, {
        method: 'POST', body, keepalive: true,
        headers: { 'content-type': 'text/plain' },
      })
    }
  } catch { /* Ф-1.9: логгер никогда не бросает */ }
}

export function useLogger() {
  const route = useRoute()
  const config = useRuntimeConfig()

  function log(event: string, ctx: Record<string, any> = {}, level: Level = 'info') {
    buffer.push({
      ts: new Date().toISOString(),
      level, event, ctx,
      sessionId: getSessionId(),
      url: route.fullPath,
      release: config.public.appVersion,
    })
    if (buffer.length > MAX_BUFFER) buffer.shift()
    if (level === 'error' || buffer.length >= BATCH_SIZE) {
      flush()
    } else if (!flushTimer) {
      flushTimer = setTimeout(() => { flushTimer = null; flush() }, FLUSH_INTERVAL)
    }
  }

  return {
    log,
    info: (e: string, c?: any) => log(e, c, 'info'),
    warn: (e: string, c?: any) => log(e, c, 'warn'),
    error: (e: string, c?: any) => log(e, c, 'error'),
    flush,
  }
}
```

```ts
// plugins/logger.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  const { log, error, flush } = useLogger()
  const ingestHost = new URL(useRuntimeConfig().public.logIngestUrl).host

  log('app.session.started', {
    referrer: document.referrer || null,
    viewport: `${innerWidth}x${innerHeight}`,
  })

  // --- logging-token для доверенного userId (Ф-1.10, 6.4) ---
  refreshLoggingToken()
  setInterval(() => refreshLoggingToken(), 5 * 60_000)
  // после auth.login.success / auth.logout бизнес-код обязан вызвать
  // refreshLoggingToken(true)

  // --- сетевые ошибки ---
  const apiFetch = $fetch.create({
    onResponseError({ request, response, options }) {
      const u = new URL(String(request), location.origin)
      if (u.host === ingestHost) return // Ф-1.9: нет рекурсии
      error('network.error', {
        method: options.method ?? 'GET',
        urlPath: u.pathname,
        status: response.status,
      })
    },
    onRequestError({ request, error: err, options }) {
      const u = new URL(String(request), location.origin)
      if (u.host === ingestHost) return
      error('network.error', {
        method: options.method ?? 'GET',
        urlPath: u.pathname, status: 0, message: err.message,
      })
    },
  })
  nuxtApp.provide('apiFetch', apiFetch)

  // --- JS-ошибки с дедупликацией (Ф-1.8) ---
  const seen = new Map<string, number>()
  const dedup = (key: string) => {
    const now = Date.now()
    if ((seen.get(key) ?? 0) > now - 30_000) return true
    seen.set(key, now)
    return false
  }

  window.addEventListener('error', (e) => {
    const key = `${e.message}:${e.lineno}`
    if (dedup(key)) return
    error('js.error', {
      message: e.message, file: e.filename,
      line: e.lineno, col: e.colno,
      stack: e.error?.stack?.slice(0, 2000),
    })
  })

  window.addEventListener('unhandledrejection', (e) => {
    const msg = String(e.reason?.message ?? e.reason).slice(0, 500)
    if (dedup(msg)) return
    error('js.unhandled_rejection', { message: msg, stack: e.reason?.stack?.slice(0, 2000) })
  })

  nuxtApp.hook('vue:error', (err: any, _instance, info) => {
    error('app.vue.error', { message: String(err?.message ?? err).slice(0, 500), info })
  })

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush(true)
  })
})
```

Пример использования в бизнес-коде:

```ts
const { info, error } = useLogger()

async function addToCart(item: CartItem) {
  try {
    await cartStore.add(item)
    info('cart.add', { sku: item.sku, qty: item.qty, price: item.price })
  } catch (e) {
    error('cart.sync.failed', { sku: item.sku, message: (e as Error).message })
    throw e
  }
}
```

> **Правило для команды магазина:** сетевые и JS-ошибки логируются автоматически. Руками добавляем только бизнес-события из таксономии (4.1) в точках изменения состояния auth/cart/checkout.

---

## 6. Компонент 2: log-server (Express.js)

Отдельный репозиторий/сервис. Node 20+, TypeScript, Express 4/5.

### 6.1. Эндпоинты

| Метод и путь | Доступ | Назначение |
|---|---|---|
| `POST /ingest` | Публичный (CORS whitelist origin магазина), rate limit | Батчи из браузера |
| `POST /ingest/server` | Заголовок `x-api-key` (service-to-service) | SSR/серверные логи Nitro |
| `POST /admin/query` | JWT админа (см. 6.5) | Запросы LogsQL для дашборда |
| `GET /health` | Внутренний | Healthcheck |

### 6.2. Требования к ingest

- **Ф-2.1.** `POST /ingest` принимает `text/plain` (см. Ф-1.5) и `application/json`; тело — конверт `{ auth, events[1..50] }`. Больше 50 — обрезка.
- **Ф-2.2.** CORS: `Access-Control-Allow-Origin` только для origin магазина (env `ALLOWED_ORIGINS`, список). Для `/admin/query` — origin admin app. Прочие origin — 403.
- **Ф-2.3.** Валидация каждого события zod-схемой из `@company/log-schema`; невалидные отбрасываются молча (метрика `ingest.dropped`). Ответ всегда `202 { accepted: n }`.
- **Ф-2.4.** Обогащение: `ip` (с учётом `trust proxy`), `ua`, `serverTs`, `source`, `userId` (MVP: из конверта, 0 = гость) + `authenticated` (`userId !== 0`). **[пост-MVP]** `userIdTrusted` из logging-token (6.4).
- **Ф-2.5.** Rate limit `/ingest`: 120 событий/мин с IP (`express-rate-limit`, взвешивание по числу событий в батче). Превышение — `429`, клиент молча дропает.
- **Ф-2.6.** Санитайзер PII (6.3) — ко всем строковым значениям `ctx`.
- **Ф-2.7.** Запись в VictoriaLogs одним `jsonline`-запросом; при недоступности — retry ×1, затем дроп с записью в stderr. Логи не копятся в памяти сервиса.
- **Ф-2.8.** `POST /ingest/server`: тот же пайплайн без CORS; `source: "server"`, `userId` из тела (0 = гость), данные пришли от доверенного сервиса (API key). **[пост-MVP]** `userIdTrusted: true`.

### 6.3. Санитайзер PII

```ts
// src/sanitize.ts
const DENY_KEYS = /pass|token|secret|card|cvv|cvc|auth/i
const EMAIL_RE = /([a-zA-Z0-9._%+-])[a-zA-Z0-9._%+-]*@/g
const CARD_RE = /\b\d{13,19}\b/g

export function sanitizeCtx(ctx: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(ctx)) {
    if (DENY_KEYS.test(k)) { out[k] = '[redacted]'; continue }
    out[k] = typeof v === 'string'
      ? v.replace(EMAIL_RE, '$1***@').replace(CARD_RE, '[card]').slice(0, 1000)
      : v
  }
  return out
}
```

### 6.4. Доверие к userId: logging-token [пост-MVP]

> **В MVP этот раздел не реализуется.** Клиент присылает `userId` (0 = гость) и
> `sessionId` напрямую в конверте (5.2), log-server им доверяет. Ниже — целевой
> дизайн доверенной атрибуции, к которому вернёмся при необходимости.

Контекст: авторизация магазина — cookie-сессии, которыми владеет отдельный auth backend. Сессионная cookie принципиально не доходит до log-server: она httpOnly и привязана к домену auth backend, а ingest живёт на другом origin. Runtime-интроспекция сессии (вызов auth backend из ingest на каждый батч) отвергнута — это связывает доступность логирования с доступностью auth backend и добавляет latency в горячий путь.

**Решение — короткоживущий logging-token:**

1. Auth backend предоставляет эндпоинт `GET /session/logging-token`:
   - требует валидную cookie-сессию (иначе 401);
   - возвращает `{ "token": "<compact JWT>", "expiresIn": 900 }`;
   - CORS с `Allow-Credentials` для origin магазина (если фронт ходит в auth backend кросс-доменно; при проксировании через Nitro не требуется).
2. Формат токена: compact JWT, **HS256** с общим секретом `LOGGING_TOKEN_SECRET` (env у auth backend и log-server; ротация — через одновременную замену в обоих сервисах). Claims:
   - `sub` — userId;
   - `aud` — `"log-server"` (токен нельзя переиспользовать против других сервисов);
   - `iat`, `exp` — TTL **15 минут**;
   - `sidh` — хэш идентификатора сессии (для аудита; сам session id в токен не кладётся).
3. Клиент кэширует токен и кладёт его в поле `auth` конверта (Ф-1.6, Ф-1.10).
4. Log-server на `/ingest` проверяет подпись, `aud` и `exp` **офлайн** (библиотека `jose`), извлекает `sub` → `userId`, ставит `userIdTrusted: true`. Токен отсутствует/просрочен/невалиден → `userId: null`, `userIdTrusted: false`; батч при этом принимается.
5. Гость: клиент получает 401 от `/session/logging-token` и шлёт `auth: null`.
6. SSR-события: Nitro резолвит userId существующим механизмом (у него есть доступ к cookie-сессии) и кладёт его прямо в событие; канал `/ingest/server` доверенный (API key) → `userIdTrusted: true` без токена.

**Принятые компромиссы:**

- После logout уже выданный токен живёт до 15 мин — события этого окна могут атрибутироваться пользователю. Для логов это приемлемо (токен не даёт доступа к данным, только атрибуцию); клиент дополнительно сбрасывает кэш токена при `auth.logout` (Ф-1.10), так что окно фактически схлопывается.
- Компрометация `LOGGING_TOKEN_SECRET` позволяет подделывать атрибуцию логов, но не даёт доступа ни к сессиям, ни к данным. Секрет ≥ 32 байт, хранение — как у прочих секретов сервисов.

**Требования к auth backend (новые):**

- **Ф-6.1.** Эндпоинт `GET /session/logging-token` по спецификации выше.
- **Ф-6.2.** Стандартный rate limit эндпоинта (например, 10 req/мин на сессию) — клиент запрашивает токен не чаще раза в ~13 минут плюс события login/logout.
- **Ф-6.3.** Выдача токена логируется в собственный лог auth backend (аудит выдачи).

### 6.5. Авторизация admin API

- **Ф-2.9 (MVP).** `POST /admin/query` работает **без JWT**: админка контролируемая,
  дополнительные проверки не требуются, доступ ограничивается CORS-whitelist
  admin-origin (`ADMIN_ORIGINS`). `userId` вызывающего берётся из тела запроса и
  пишется в audit-лог (Ф-2.11).
- **Ф-2.9 [пост-MVP].** `POST /admin/query` требует `Authorization: Bearer <JWT>` админа. Источник JWT — существующая авторизация admin app (log-server валидирует по её публичному ключу). Если у admin app нет JWT — log-server ведёт собственную таблицу админов (bcrypt) и эндпоинт `POST /admin/login`; выбор зафиксировать на киокофе (13.3).
- **Ф-2.10.** Тело запроса: `{ endpoint: 'query' | 'hits' | 'stats_query', query: string, start?: string, end?: string, limit?: number }`. Log-server форвардит **только** на `select/logsql/{endpoint}` VictoriaLogs (whitelist), таймаут 30 сек, `limit` по умолчанию 1000, максимум 10000.
- **Ф-2.11.** Все admin-запросы логируются (audit): кто, когда, какой query.

### 6.6. Референсная реализация (ядро)

```ts
// src/app.ts
import express from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { EventSchema } from '@company/log-schema'
import { sanitizeCtx } from './sanitize'
import { verifyUserJwt, requireAdmin } from './auth'
import { vlInsert, vlSelect } from './victorialogs'

const app = express()
app.set('trust proxy', 1)
app.use(express.json({ limit: '512kb' }))
app.use(express.text({ type: 'text/plain', limit: '512kb' })) // Ф-2.1

const ALLOWED = (process.env.ALLOWED_ORIGINS ?? '').split(',')
app.use((req, res, next) => {                                  // Ф-2.2
  const origin = req.headers.origin
  if (origin && ALLOWED.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization')
    res.setHeader('Access-Control-Allow-Methods', 'POST')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

const EnvelopeSchema = z.object({
  auth: z.string().nullable(),
  events: z.array(z.unknown()).min(1).max(50),
})

const ingestLimiter = rateLimit({ windowMs: 60_000, limit: 120 }) // Ф-2.5

app.post('/ingest', ingestLimiter, async (req, res) => {
  const raw = typeof req.body === 'string'
    ? safeJson(req.body)              // text/plain путь (Ф-1.5)
    : req.body
  const env = EnvelopeSchema.safeParse(raw)
  if (!env.success) return res.status(400).end()

  const user = await verifyUserJwt(env.data.auth) // { userId } | null (6.4)
  const now = new Date().toISOString()

  const accepted = env.data.events.flatMap((item) => {
    const p = EventSchema.safeParse(item)
    if (!p.success) return []
    return [{
      ...p.data,
      ctx: sanitizeCtx(p.data.ctx),
      userId: user?.userId ?? null,
      userIdTrusted: Boolean(user),
      ip: req.ip,
      ua: String(req.headers['user-agent'] ?? '').slice(0, 256),
      serverTs: now,
      source: 'client',
    }]
  })

  if (accepted.length) await vlInsert(accepted)
  res.status(202).json({ accepted: accepted.length })
})

app.post('/ingest/server', requireApiKey, async (req, res) => { // Ф-2.8
  // тот же пайплайн, source: 'server', userIdTrusted: true
})

app.post('/admin/query', requireAdmin, async (req, res) => {    // Ф-2.9..2.11
  const { endpoint, query, start, end, limit } = req.body
  if (!['query', 'hits', 'stats_query'].includes(endpoint)) {
    return res.status(400).json({ error: 'endpoint not allowed' })
  }
  auditLog(req.admin.id, endpoint, query)
  const data = await vlSelect(endpoint, { query, start, end, limit: Math.min(limit ?? 1000, 10_000) })
  res.json(data)
})

function safeJson(s: string) { try { return JSON.parse(s) } catch { return null } }
```

```ts
// src/victorialogs.ts
const BASE = process.env.VICTORIA_LOGS_URL ?? 'http://victorialogs:9428'

export async function vlInsert(events: object[], attempt = 0): Promise<void> {
  const body = events.map((e) => JSON.stringify(e)).join('\n')
  try {
    const r = await fetch(
      `${BASE}/insert/jsonline?_time_field=serverTs&_msg_field=event&_stream_fields=source,level`,
      { method: 'POST', body, headers: { 'content-type': 'application/stream+json' } },
    )
    if (!r.ok) throw new Error(`vl insert ${r.status}`)
  } catch (e) {
    if (attempt === 0) return vlInsert(events, 1)   // Ф-2.7: один retry
    console.error('[logs] victorialogs unavailable, batch dropped', e)
  }
}

export async function vlSelect(endpoint: string, params: Record<string, any>) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]),
  )
  const r = await fetch(`${BASE}/select/logsql/${endpoint}`, {
    method: 'POST', body: qs,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    signal: AbortSignal.timeout(30_000),
  })
  if (!r.ok) throw new Error(`vl select ${r.status}`)
  return r.text() // NDJSON — отдаём как есть, admin app парсит построчно
}
```

```ts
// src/auth.ts (фрагмент: офлайн-проверка logging-token, 6.4)
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.LOGGING_TOKEN_SECRET!)

export async function verifyUserJwt(token: string | null) {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secret, { audience: 'log-server' })
    return payload.sub ? { userId: String(payload.sub) } : null
  } catch {
    return null // подпись/exp/aud невалидны → userIdTrusted: false, батч принимается
  }
}
```

---

## 7. Компонент 3: серверные логи Nitro (ecommerce app)

- **Ф-3.1.** В Nitro — `pino` (JSON). Server routes и SSR-ошибки логируются с полями `event` (`server.request.failed`, `server.render.failed`), `requestId`, `sessionId` (cookie `log_sid`), `source: "server"`.
- **Ф-3.2.** Доставка: лёгкий буфер в Nitro (аналогичный клиентскому, flush раз в 5 сек) → `POST {logIngestUrl}/ingest/server` с заголовком `x-api-key` из env. Никаких прямых записей в VictoriaLogs из магазина.
- **Ф-3.3.** Хук `nitroApp.hooks.hook('error', ...)` перехватывает все необработанные ошибки сервера.

```ts
// server/plugins/error-logging.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    enqueueServerLog({ // буфер + flush в /ingest/server (Ф-3.2)
      ts: new Date().toISOString(),
      level: 'error',
      event: 'server.request.failed',
      url: event?.path ?? null,
      sessionId: event ? getCookie(event, 'log_sid') ?? null : null,
      release: useRuntimeConfig().public.appVersion,
      ctx: { message: error.message, stack: error.stack?.slice(0, 2000) },
    })
  })
})
```

---

## 8. Компонент 4: развёртывание (log-server + VictoriaLogs)

### 8.1. docker-compose (стек логирования, отдельный от магазина)

```yaml
services:
  log-server:
    build: ./log-server
    environment:
      VICTORIA_LOGS_URL: http://victorialogs:9428
      ALLOWED_ORIGINS: https://shop.company.com,https://admin.company.com
      INGEST_API_KEY: ${INGEST_API_KEY}         # для /ingest/server
      ADMIN_JWT_JWKS_URL: ${ADMIN_JWT_JWKS_URL} # или ADMIN_USERS для встроенной авторизации
      LOGGING_TOKEN_SECRET: ${LOGGING_TOKEN_SECRET} # общий с auth backend, проверка userId (6.4)
    depends_on: [victorialogs]
    networks: [logging]
    ports: ["8080:8080"]   # за reverse proxy с TLS → https://logs.company.com

  victorialogs:
    image: victoriametrics/victoria-logs:latest
    command:
      - -storageDataPath=/vlogs-data
      - -retentionPeriod=30d
      - -search.maxQueryDuration=30s
    volumes:
      - vlogs-data:/vlogs-data
    networks: [logging]
    # порт 9428 наружу НЕ публикуется

networks:
  logging:

volumes:
  vlogs-data:
```

### 8.2. Требования

- **Ф-4.1.** Retention 30 дней (обсуждаемо; error-события позже можно вынести в отдельный tenant c 90d).
- **Ф-4.2.** Volume под данные + включение в бэкап-скрипт хоста (у VictoriaLogs есть штатный механизм снапшотов).
- **Ф-4.3.** Доступ к 9428 — только из docker-сети `logging`. Наружу смотрит только log-server за reverse proxy (nginx/caddy) с TLS.
- **Ф-4.4.** Healthchecks: `log-server:/health`, `victorialogs:/health` — в мониторинг хоста.

### 8.3. Примеры LogsQL-запросов (основа для дашборда)

```text
# ошибки за час, сгруппированные по событию
_time:1h level:error | stats by (event) count() errors | sort by (errors desc)

# топ падающих эндпоинтов
_time:24h event:network.error | stats by (ctx.urlPath, ctx.status) count() c | sort by (c desc) | limit 20

# error rate по 5-минутным бакетам (time-series)
_time:24h level:error | stats by (_time:5m) count()

# воронка за сутки — счётчики этапов по уникальным сессиям
_time:24h event:in(auth.login.success, cart.add, checkout.started, checkout.order.created)
  | stats by (event) count_uniq(sessionId)

# вся сессия пользователя (режим «трейс», клиент + сервер)
sessionId:"s_9f8a7b" | sort by (serverTs)
```

---

## 9. Компонент 5: дашборд в admin app

### 9.1. Доступ и транспорт

- **Ф-5.1.** Раздел «Логи» в существующем admin app, доступ по существующей ролевой модели (роль `logs:read`).
- **Ф-5.2.** Все данные — через `POST https://logs.company.com/admin/query` с JWT админа (6.5). Admin app **не** знает про VictoriaLogs и не ходит в него.
- **Ф-5.3.** Ответы NDJSON парсятся на клиенте admin app построчно; для time-series используется endpoint `hits`.

### 9.2. Экраны и виджеты (MVP)

| Экран | Виджеты | Данные |
|---|---|---|
| **Обзор** | Error rate (line chart, бакеты 5 мин, разбивка по домену); счётчики за 24ч: errors, network.error, checkout.payment.failed; топ-10 ошибок | `stats by (_time:5m)`, `stats by (event)` |
| **Сетевые ошибки** | Таблица `urlPath × status × count`; фильтр по периоду/статусу | запрос из 8.3 |
| **Воронка** | Bar chart: auth.login → cart.add → checkout.started → order.created + конверсия между шагами | `count_uniq(sessionId)` |
| **Live tail** | Последние N событий, polling 5 сек; фильтры: level, event (prefix), sessionId, userId, release, source | `_time:5m ... | sort by (serverTs desc) | limit 100` |
| **Сессия** | Хронологическая лента всех событий сессии (client + server), подсветка ошибок | `sessionId:"..."` |

### 9.3. UI-требования

- Chart.js или ECharts — на выбор команды admin app.
- Клик по строке любого виджета → экран «Сессия».
- Фильтры сериализуются в query string (шарибельные ссылки на инцидент).
- Polling, не WebSocket (в MVP).

---

## 10. Нефункциональные требования

- **НФ-1.** Логгер добавляет ≤ 5 КБ (gzip) к клиентскому бандлу магазина.
- **НФ-2.** Log-server держит 100 RPS батчей на 1 vCPU / 256 МБ RAM без деградации.
- **НФ-3.** Потеря логов допустима (best effort): падение log-server или VictoriaLogs не влияет на магазин и admin app; события дропаются.
- **НФ-4.** Запросы дашборда за 24-часовой период — < 2 сек на объёме до 5 млн событий.
- **НФ-5.** GDPR/приватность: IP хранится вместе с логом 30 дней (= retention), PII-санитайзер обязателен, сбор технических логов отражается в privacy policy магазина.
- **НФ-6.** Кросс-сервисный контракт (`@company/log-schema`) версионируется; изменение схемы — semver minor/major, log-server поддерживает две последние minor-версии.

---

## 11. План реализации

### Фаза 1 — log-server + хранилище (~4–5 дней)

1. Репозиторий log-server: Express, TypeScript, zod, конфиг из env.
2. VictoriaLogs в docker-compose, проверка insert/select вручную (`curl`).
3. `POST /ingest` (CORS text/plain, конверт, валидация, санитайзер, rate limit, обогащение) + `POST /ingest/server` (API key) + `GET /health`.
4. Пакет `@company/log-schema` (zod + enum таксономии).
5. Reverse proxy + TLS для `logs.company.com`.
6. **DoD:** батч, отправленный `curl` с origin магазина, виден через LogsQL за < 5 сек; запрос с чужим origin отклоняется; невалидные события молча дропаются со счётчиком.

### Фаза 2 — клиентский логгер магазина + auth backend (~3–4 дня)

1. `useLogger()` + `logger.client.ts` (буфер, sendBeacon text/plain, перехват network/js ошибок, конверт с logging-token).
2. **Auth backend:** эндпоинт `GET /session/logging-token` (Ф-6.1..6.3) — задача команды auth-сервиса. Не блокирует остальные пункты: до его готовности события уходят с `auth: null` / `userIdTrusted: false`.
3. Nitro: pino + плагин ошибок + буфер-доставка в `/ingest/server` (userId — из существующего механизма сессий Nitro).
4. Расстановка бизнес-событий по таксономии 4.1 (auth, cart, checkout) + вызовы `refreshLoggingToken(true)` после login/logout.
5. Code review чек-лист: «изменение состояния auth/cart/checkout без лога не мёржится».
6. **DoD:** сценарий «регистрация → корзина → заказ» даёт полную ленту по одному `sessionId`, включая SSR-события; `userIdTrusted: true` для авторизованного пользователя.

### Фаза 3 — дашборд в admin app (~4–5 дней)

1. `POST /admin/query` в log-server: JWT-авторизация, whitelist эндпоинтов, audit.
2. Раздел «Логи» в admin app: «Обзор», Live tail, «Сессия», «Сетевые ошибки», «Воронка».
3. **DoD:** дежурный за ≤ 3 клика от «выросли ошибки» доходит до конкретной сессии и стектрейса.

### Фаза 4 — опционально, по итогам эксплуатации

- Алерты: cron в log-server раз в 5 мин выполняет LogsQL (error rate, checkout.payment.failed) и шлёт в Telegram/Slack webhook при превышении порога.
- GlitchTip для sourcemaps и группировки JS-ошибок.
- Отдельный retention/tenant для error-событий.
- Переезд агрегатов в ClickHouse при потребности в продуктовой аналитике.

---

## 12. Критерии приёмки (сводно)

1. Все события таксономии 4.1 пишутся и находятся в дашборде admin app по фильтрам.
2. Искусственная 500-ошибка API магазина появляется в «Сетевых ошибках» ≤ 10 сек.
3. Закрытие вкладки посреди checkout не теряет уже произошедшие события (sendBeacon с text/plain доставляет кросс-доменно).
4. В хранилище нет PII: выборочная проверка `ctx` на паролях/email/картах из тестовых сценариев.
5. Остановка log-server или VictoriaLogs не влияет на работу магазина и admin app.
6. Порт 9428 недоступен ни снаружи, ни из сетей магазина/admin app; `/admin/query` доступен только с admin-origin (MVP; **[пост-MVP]** — с валидным JWT); `/ingest/server` — без API-ключа отклоняется; `/ingest` с чужим origin отклоняется.
7. Rate limit: > 120 событий/мин с IP → 429, магазин у пользователя не деградирует.
8. **MVP:** `authenticated: false` и `userId: 0` для гостя, `authenticated: true` для авторизованного (`userId !== 0`). **[пост-MVP]** `userIdTrusted: false` для событий с отсутствующим/просроченным/подделанным logging-token (без токена, `exp` в прошлом, неверная подпись, чужой `aud`) — во всех случаях батч принимается, атрибуция сбрасывается.
9. **[пост-MVP]** Недоступность auth backend не влияет на доставку логов (события уходят с `auth: null`).

---

## 13. Открытые вопросы к обсуждению

> Вопрос про механизм доверенного `userId` при cookie-сессионной авторизации (13.2 в v1.1) **закрыт**: целевое решение — logging-token (6.4). В MVP (v1.3) **отложено**: клиент шлёт `userId` напрямую, вопросы 3–4 ниже — тоже пост-MVP.

1. Retention 30 дней — достаточно ли для разбора претензий по заказам (юр. требования)?
2. **[пост-MVP] Источник JWT для admin API (6.5):** переиспользуем авторизацию admin app (нужен её публичный ключ/JWKS) или log-server ведёт собственных админов? В MVP `/admin/query` без JWT (только CORS admin-origin).
3. **[пост-MVP]** TTL logging-token 15 мин — согласовать с безопасностью (окно атрибуции после logout, см. компромиссы в 6.4). Альтернатива — 5 мин ценой более частых запросов к auth backend.
4. **[пост-MVP]** Как фронт магазина получает logging-token: напрямую в auth backend (CORS + credentials) или через прокси-роут Nitro? Зависит от текущей схемы взаимодействия фронта с auth backend.
5. Логируем ли `debug` в prod или начиная с `info`?
6. Sampling info-событий при росте трафика (checkout — всегда 100%)?
7. Формат `release`: git sha или semver из package.json?
8. Владелец таксономии событий (кто апрувит добавления)?
9. Кто владелец/дежурный самого log-server как отдельного сервиса (алерты на его /health)?
