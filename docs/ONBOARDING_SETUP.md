# Sistema Onboarding - Guida Setup

Questo documento descrive come è stato implementato il nuovo sistema di onboarding con scelta del piano e trial configurabile fino a 7 giorni.

## 📋 Panoramica

Il nuovo flusso onboarding guida l'utente attraverso questi step:

1. **Registrazione** - Form registrazione base (nome, email, password, città)
2. **Scelta Piano** - Selezione tra Free, Basic (€29/mese) o Premium (€99/mese)
3. **Conferma Trial** - Per piani a pagamento, conferma trial gratuito 7 giorni
4. **Welcome** - Pagina benvenuto con checklist setup guidato
5. **Dashboard** - Accesso completo alla dashboard con banner trial

## 🗂️ File Creati/Modificati

### Schema Database
- ✅ `prisma/schema.prisma` - Aggiunto `trialDays` e `onboardingCompletedAt` a Subscription
- ✅ `prisma/migrations/add_trial_onboarding_fields.sql` - Migration SQL

### Configurazione Piani
- ✅ `lib/plan-limits.ts` - Aggiornato con limiti e prezzi corretti:
  - Free: 5 val/mese, 1 widget
  - Basic: €50/mese, 50 val/mese, 3 widget, 7 giorni trial
  - Premium: €100/mese, 150 val/mese, 10 widget, 7 giorni trial

### API Endpoints
- ✅ `app/api/auth/register/route.ts` - Modificato per NON creare subscription automaticamente
- ✅ `app/api/onboarding/select-plan/route.ts` - Nuovo endpoint per salvare scelta piano
- ✅ `app/api/cron/check-trial-expiry/route.ts` - Cron job per gestire scadenza trial

### Pagine Frontend
- ✅ `app/register/page.tsx` - Modificato redirect da `/dashboard` a `/onboarding/plan`
- ✅ `app/onboarding/plan/page.tsx` - Nuova pagina scelta piano con 3 card comparative
- ✅ `app/onboarding/welcome/page.tsx` - Nuova pagina welcome con checklist

### Componenti UI
- ✅ `components/onboarding/plan-card.tsx` - Card piano con pricing e features
- ✅ `components/onboarding/welcome-checklist.tsx` - Checklist setup interattiva
- ✅ `components/dashboard/trial-banner.tsx` - Aggiornato per supportare trial configurabile

### Scripts & Config
- ✅ `scripts/check-trial-expiry.ts` - Script test manuale cron job
- ✅ `vercel.json` - Aggiunto cron job `/api/cron/check-trial-expiry` alle 04:00 UTC

## 🚀 Setup e Deploy

### 1. Eseguire Migration Database

Su ambiente di produzione (Neon/Vercel):

```bash
# Esegui migration Prisma
npx prisma migrate deploy

# OPPURE esegui manualmente SQL
psql $DATABASE_URL < prisma/migrations/add_trial_onboarding_fields.sql
```

### 2. Configurare Variabili Ambiente

Assicurati che queste variabili siano configurate su Vercel:

```bash
# Già esistente - NON modificare
CRON_SECRET=your-cron-secret-key-change-in-production

# Verifica che sia configurato correttamente
NEXT_PUBLIC_APP_URL=https://domusreport.com
```

### 3. Deploy su Vercel

```bash
git add .
git commit -m "feat: Implementato sistema onboarding con trial configurabile"
git push origin main
```

Vercel eseguirà automaticamente:
- Build dell'app
- Deploy in produzione
- Configurazione cron job per trial expiry (ore 04:00 UTC ogni giorno)

## 🧪 Testing

### Test Flusso Completo

1. **Registrazione**
   - Vai su `/register`
   - Compila form registrazione
   - Verifica redirect a `/onboarding/plan`

2. **Scelta Piano Free**
   - Seleziona "Inizia Gratis"
   - Verifica redirect a `/onboarding/welcome`
   - Verifica messaggio "Piano Free attivo"
   - Nessun trial banner in dashboard

3. **Scelta Piano Basic/Premium con Trial**
   - Seleziona "Prova 7 Giorni Gratis"
   - Verifica modale conferma trial
   - Clicca "Attiva Prova Gratuita"
   - Verifica redirect a `/onboarding/welcome`
   - Verifica messaggio "Piano Basic/Premium - 7 giorni trial"
   - Vai a `/dashboard` → verifica banner trial con countdown

4. **Scadenza Trial (Manuale)**
   ```bash
   # Test cron job manualmente
   npx tsx scripts/check-trial-expiry.ts
   ```

### Test Database

Verifica dati nel database dopo onboarding:

```sql
-- Controlla subscription creata
SELECT
  a.nome,
  a.piano,
  s.plan_type,
  s.status,
  s.trial_days,
  s.trial_ends_at,
  s.onboarding_completed_at
FROM agencies a
JOIN subscriptions s ON s.agency_id = a.id
WHERE a.email = 'test@example.com';
```

### Test Cron Job Trial Expiry

1. Crea utente con trial che scade oggi:
   ```sql
   UPDATE subscriptions
   SET trial_ends_at = NOW()
   WHERE agency_id = 'xxx';
   ```

2. Esegui script:
   ```bash
   npx tsx scripts/check-trial-expiry.ts
   ```

3. Verifica risultati:
   - Se NO metodo pagamento → downgrade a free
   - Se SÌ metodo pagamento → conversione a active

## 📊 Flusso Dati

### Registrazione → Onboarding

```
1. POST /api/auth/register
   ↓
   Crea Agency (piano: 'free', SENZA subscription)
   ↓
2. POST /api/auth/login (auto-login)
   ↓
   Salva token in localStorage
   ↓
3. Redirect /onboarding/plan
```

### Scelta Piano Free

```
1. Click "Inizia Gratis"
   ↓
2. POST /api/onboarding/select-plan
   {
     planType: 'free',
     trialDays: 0
   }
   ↓
   Update Agency (piano: 'free')
   Create Subscription (planType: 'free', status: 'active')
   ↓
3. Redirect /onboarding/welcome
```

### Scelta Piano Basic/Premium

```
1. Click "Prova 7 Giorni Gratis"
   ↓
   Mostra modale conferma trial
   ↓
2. Click "Attiva Prova Gratuita"
   ↓
3. POST /api/onboarding/select-plan
   {
     planType: 'basic', // o 'premium'
     trialDays: 7
   }
   ↓
   Update Agency (piano: 'basic')
   Create Subscription (
     planType: 'basic',
     status: 'trial',
     trialDays: 7,
     trialEndsAt: NOW() + 7 giorni
   )
   ↓
4. Redirect /onboarding/welcome
```

### Scadenza Trial (Cron Job)

```
Cron eseguito ogni giorno alle 04:00 UTC

1. GET /api/cron/check-trial-expiry
   Header: Authorization: Bearer {CRON_SECRET}
   ↓
2. Trova subscription con:
   - status = 'trial'
   - trialEndsAt <= NOW()
   ↓
3. Per ogni trial scaduto:

   SE ha metodo pagamento (stripeCustomerId + paymentMethodId):
     → Update subscription (status: 'active', nextBillingDate: +30 giorni)
     → Trigger addebito Stripe (TODO)
     → Invia email conferma (TODO)

   SE NON ha metodo pagamento:
     → Update agency (piano: 'free')
     → Update subscription (planType: 'free', status: 'active')
     → Invia email downgrade (TODO)
```

## 🔧 Personalizzazioni Future

### Cambiare Durata Trial

Modifica in `lib/plan-limits.ts`:

```typescript
export const TRIAL_DAYS = {
  free: 0,
  basic: 14, // Cambia da 7 a 14 giorni
  premium: 14,
} as const
```

### Cambiare Prezzi Piani

Modifica in `lib/plan-limits.ts`:

```typescript
export const PLAN_PRICES = {
  free: 0,
  basic: 3900, // €39/mese (in centesimi)
  premium: 12900, // €129/mese
} as const
```

### Aggiungere Reminder Email

Nel cron job `app/api/cron/check-trial-expiry/route.ts`, decommentare le sezioni TODO per Stripe e Email.

Esempio reminder 3 giorni prima scadenza:

```typescript
// Aggiungi query per trial che scadono tra 3 giorni
const upcomingTrialExpiry = await prisma.subscription.findMany({
  where: {
    status: 'trial',
    trialEndsAt: {
      gte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      lte: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
    }
  }
})

// Invia email reminder
for (const sub of upcomingTrialExpiry) {
  // TODO: send reminder email
}
```

## ⚠️ Note Importanti

1. **CRON_SECRET**: Assicurati che sia configurato su Vercel e corrisponda in tutti gli ambienti
2. **Stripe**: Il cron job ha TODO per addebito Stripe - implementare prima di andare live
3. **Email**: I template email non sono ancora implementati - usare Resend
4. **Timezone**: Cron eseguito in UTC (04:00 UTC = 05:00 CET)
5. **Backward Compatibility**: Gli utenti esistenti con trial premium 14 giorni continueranno a funzionare

## 📚 Risorse

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
