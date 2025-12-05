# 🛡️ Sentry Setup - Error Tracking & Performance Monitoring

## 📋 Panoramica

Sentry è stato integrato per:
- **Error Tracking**: Catturare e tracciare errori in produzione
- **Performance Monitoring**: Monitorare performance delle API e rendering
- **Session Replay**: Riprodurre le sessioni utente con errori
- **Alerts**: Notifiche immediate in caso di errori critici

## 🚀 Step di Configurazione

### 1. Crea Account Sentry

1. Vai su [sentry.io](https://sentry.io)
2. Crea un account gratuito (fino a 5K eventi/mese)
3. Crea un nuovo progetto:
   - **Platform**: Next.js
   - **Project Name**: `domusreport`
   - **Organization**: Il nome della tua organizzazione

### 2. Ottieni le Credenziali

Dopo la creazione del progetto, troverai:

- **DSN**: `https://xxx@xxx.ingest.sentry.io/xxx`
  - Visibile su: Settings → Client Keys (DSN)

- **Organization Slug**: `your-org`
  - Visibile su: Settings → General Settings

- **Project Name**: `domusreport`

- **Auth Token**:
  - Vai su: Settings → Auth Tokens
  - Crea nuovo token con permessi:
    - `project:read`
    - `project:releases`
    - `org:read`

### 3. Configura le Variabili d'Ambiente su Vercel

Vai su **Vercel Dashboard** → Tuo Progetto → **Settings** → **Environment Variables**

Aggiungi le seguenti variabili per tutti gli ambienti (Production, Preview, Development):

```bash
# Sentry DSN (pubblico - può essere esposto nel client)
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# Sentry Organization Slug
SENTRY_ORG=your-org

# Sentry Project Name
SENTRY_PROJECT=domusreport

# Sentry Auth Token (segreto - solo server)
SENTRY_AUTH_TOKEN=your-auth-token
```

### 4. Redeploy su Vercel

Dopo aver configurato le variabili:
1. Vai su **Deployments**
2. Clicca sui 3 puntini dell'ultimo deployment
3. Clicca **Redeploy**

### 5. Verifica Installazione

1. Visita la tua app in produzione
2. Naviga tra alcune pagine
3. Vai su Sentry Dashboard → Issues
4. Dovresti vedere eventi di "Session Started" e tracking automatico

## 📊 Cosa Viene Tracciato

### Automaticamente

- ✅ **Errori JavaScript**: Tutti gli errori non gestiti nel browser
- ✅ **Errori Server**: Errori nelle API routes e Server Components
- ✅ **Performance**: Tempi di caricamento pagine e API
- ✅ **Session Replay**: Registrazione sessioni con errori (10% di tutte, 100% con errori)
- ✅ **Breadcrumbs**: Azioni dell'utente prima dell'errore

### Privacy & Security

Il setup include filtri automatici per NON inviare a Sentry:
- ❌ Cookie
- ❌ Authorization headers
- ❌ Variabili d'ambiente sensibili
- ❌ Testo e media sono mascherati nelle session replay

## 🔧 Utilizzo nel Codice

### Catturare Errori Personalizzati

```typescript
import * as Sentry from "@sentry/nextjs"

try {
  // Operazione rischiosa
  await processPayment()
} catch (error) {
  // Log all'utente via logger
  logger.error("Payment failed", error)

  // Invia a Sentry con contesto
  Sentry.captureException(error, {
    tags: {
      section: "payments",
      severity: "critical"
    },
    extra: {
      userId: user.id,
      amount: payment.amount
    }
  })
}
```

### Tracciare Eventi Custom

```typescript
Sentry.captureMessage("Subscription upgraded", {
  level: "info",
  tags: {
    plan: "premium",
    userId: user.id
  }
})
```

### Performance Monitoring

```typescript
const transaction = Sentry.startTransaction({
  name: "Process CSV Upload",
  op: "task"
})

// ... operazione ...

transaction.finish()
```

## 🔔 Configurare Alerts

1. Su Sentry: **Alerts** → **Create Alert**
2. Scegli tipo:
   - **Issues**: Errori che si verificano
   - **Performance**: API lente, timeout
3. Configura trigger (es: "Più di 10 errori in 1 ora")
4. Aggiungi notifiche (Email, Slack, etc.)

## 📈 Dashboard Consigliati

1. **Issues Overview**: Errori più frequenti
2. **Performance**: API più lente
3. **Releases**: Confronto errori tra versioni
4. **User Feedback**: Feedback degli utenti con errori

## 💰 Limiti Piano Gratuito

- **Events**: 5.000/mese
- **Session Replay**: 50/mese
- **Retention**: 30 giorni

Per un'app in crescita, considera l'upgrade quando raggiungi:
- 1.000+ utenti attivi/mese
- Più di 100 errori/settimana

## 🎯 Best Practices

1. **Non tracciare errori noti**:
   ```typescript
   if (error instanceof ValidationError) {
     // Log solo localmente
     logger.warn("Validation failed", error)
     return
   }
   // Solo errori inaspettati vanno su Sentry
   Sentry.captureException(error)
   ```

2. **Aggiungi contesto**:
   ```typescript
   Sentry.setContext("payment", {
     method: "stripe",
     plan: subscription.plan
   })
   ```

3. **User Identification**:
   ```typescript
   Sentry.setUser({
     id: agency.id,
     email: agency.email,
     username: agency.nome
   })
   ```

## 🔗 Risorse

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Monitoring Best Practices](https://docs.sentry.io/product/issues/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)

---

📝 **Nota**: In sviluppo locale, Sentry è attivo ma con `dryRun: true` (non invia eventi reali).
