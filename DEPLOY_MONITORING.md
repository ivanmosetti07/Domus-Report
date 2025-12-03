# Setup Monitoring & Error Tracking

## Opzione 1: Sentry (Raccomandato)

### Step 1: Setup Account Sentry

1. Vai su [sentry.io](https://sentry.io)
2. Crea account gratuito (include 5k errori/mese)
3. Crea nuovo progetto: **Next.js**
4. Copia il **DSN** fornito

### Step 2: Installa Sentry SDK

```bash
npm install @sentry/nextjs
```

### Step 3: Configura Sentry

Esegui wizard automatico:

```bash
npx @sentry/wizard@latest -i nextjs
```

Questo creerà automaticamente:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Aggiornamento di `next.config.js`

### Step 4: Aggiungi DSN a Vercel

Vai su Vercel → Settings → Environment Variables:

```bash
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_AUTH_TOKEN="[token per upload sourcemaps]"
SENTRY_ORG="[tua-org]"
SENTRY_PROJECT="domus-report"
```

### Step 5: Test Monitoring

Crea una pagina di test errori (opzionale):

```typescript
// app/api/test-error/route.ts
export async function GET() {
  throw new Error('Test Sentry - Questo è un errore di test')
}
```

Visita `/api/test-error` e verifica l'errore arrivi su Sentry.

### Step 6: Configurazione Avanzata

In `sentry.server.config.ts`:

```typescript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,

  // Filtra errori noti
  ignoreErrors: [
    'Non-Error promise rejection captured',
    'ChunkLoadError',
  ],

  // Filtra informazioni sensibili
  beforeSend(event) {
    // Rimuovi dati sensibili da event.request
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }
    return event
  },
})
```

---

## Opzione 2: Vercel Error Tracking (Beta)

### Setup

1. Vai su Vercel Dashboard → Settings
2. Abilita **Error Tracking** (attualmente in beta)
3. Automaticamente integrato, nessun codice necessario

### Pro/Contro

**Pro:**
- ✅ Zero configurazione
- ✅ Integrato in Vercel
- ✅ Gratis (per ora)

**Contro:**
- ❌ In beta, features limitate
- ❌ Meno configurabile di Sentry
- ❌ Non supporta tutti i casi d'uso

---

## Opzione 3: LogRocket (Session Replay)

Per vedere esattamente cosa fa l'utente quando si verifica un errore:

### Setup

1. Vai su [logrocket.com](https://logrocket.com)
2. Crea account e progetto
3. Installa SDK:

```bash
npm install logrocket logrocket-react
```

4. Configura in `app/layout.tsx`:

```typescript
'use client'
import LogRocket from 'logrocket'

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  LogRocket.init('your-app-id')
}
```

### Integrazione con Sentry

LogRocket può integrarsi con Sentry per avere session replay negli alert:

```typescript
import LogRocket from 'logrocket'
import * as Sentry from '@sentry/nextjs'

LogRocket.getSessionURL((sessionURL) => {
  Sentry.configureScope((scope) => {
    scope.setExtra('sessionURL', sessionURL)
  })
})
```

---

## Performance Monitoring

### Vercel Analytics (Incluso)

1. Vai su Vercel → Analytics
2. Abilita Web Analytics
3. Aggiungi in `app/layout.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Vercel Speed Insights

1. Installa:

```bash
npm install @vercel/speed-insights
```

2. Aggiungi in `app/layout.tsx`:

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

---

## Database Monitoring

### Neon Dashboard

Monitora automaticamente:
- Query performance
- Connection pooling
- Storage usage
- Errori database

Accedi tramite: [Neon Dashboard → Monitoring](https://console.neon.tech)

### Prisma Studio Production (Opzionale)

Per accedere al database production via GUI:

```bash
# Localmente con production DB
DATABASE_URL="[production-url]" npx prisma studio
```

**⚠️ ATTENZIONE:** Usa con cautela su production!

---

## Uptime Monitoring

### Opzione 1: Vercel Monitoring (Incluso)

- Automatic uptime checks
- Notifiche via email se down
- Incluso nel piano Vercel

### Opzione 2: UptimeRobot (Gratis)

1. Vai su [uptimerobot.com](https://uptimerobot.com)
2. Crea monitor HTTP(S)
3. URL: `https://domusreport.mainstream.agency`
4. Check interval: 5 minuti
5. Notifiche: Email, SMS, Slack

### Opzione 3: Better Uptime (Più Features)

- Status page pubblico
- Incident management
- Notifiche multiple canali
- Piano free: 10 monitors

---

## Alert & Notifications

### Setup Slack Notifications (Raccomandato)

1. Crea Slack webhook
2. Integra con Sentry:
   - Sentry → Settings → Integrations → Slack
   - Autorizza workspace
   - Scegli canale (es. `#alerts-production`)

3. Configura regole alert:
   - Nuovi errori
   - Spike di errori (es. >10 in 1h)
   - Errori critici (es. crash server)

### Setup Email Notifications

In Sentry → Settings → Notifications:
- Abilita email per nuovi errori
- Digest giornaliero errori
- Report settimanale

---

## Dashboard Custom (Opzionale)

### Setup con Grafana + Prometheus

Per metriche avanzate:

1. Setup Prometheus export da Next.js
2. Configura Grafana dashboard
3. Monitora:
   - Request rate
   - Error rate
   - Response time
   - Database queries

**Nota:** Complesso, solo se necessario per aziende enterprise.

---

## Raccomandazioni Finali

### Setup Minimo (Gratis)

✅ **Sentry** per error tracking
✅ **Vercel Analytics** per traffico/performance
✅ **UptimeRobot** per uptime monitoring
✅ **Neon Dashboard** per database monitoring

### Setup Completo (Piccolo costo)

✅ **Sentry Pro** ($26/mese) per più errori e features
✅ **LogRocket** ($99/mese) per session replay
✅ **Better Uptime** ($18/mese) per status page
✅ **Vercel Pro** ($20/mese) per analytics avanzati

### Per MVP/Launch

Parti con setup minimo gratis, aggiungi features premium solo quando necessario.

---

## Checklist Post-Setup

- [ ] Sentry configurato e testato
- [ ] Vercel Analytics abilitato
- [ ] Uptime monitor attivo
- [ ] Slack notifications configurate
- [ ] Test errore inviato a Sentry
- [ ] Dashboard Neon verificato
- [ ] Sourcemaps caricate correttamente

✅ Monitoring completo e pronto per production!
