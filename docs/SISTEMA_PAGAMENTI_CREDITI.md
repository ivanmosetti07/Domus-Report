# Sistema Pagamenti e Crediti - Documentazione Tecnica

## 📋 Panoramica

Il sistema di pagamenti e crediti è gestito tramite:
1. **Stripe** - Per pagamenti ricorrenti mensili
2. **Cron Jobs** - Per reset automatico crediti
3. **Webhook Stripe** - Per accreditare crediti al pagamento

---

## 🔄 Flusso Pagamenti Mensili

### 1. Creazione Abbonamento

Quando un utente si iscrive a un piano (Basic/Premium):

**File**: `app/api/subscription/checkout/route.ts`

```typescript
// Crea sessione Stripe Checkout
stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price_data: {
      recurring: { interval: 'month' }  // ← Pagamento mensile
    }
  }]
})
```

**Risultato**:
- Stripe crea una subscription ricorrente
- Addebita automaticamente ogni mese
- Invia webhook `invoice.payment_succeeded`

---

### 2. Ricezione Pagamento Mensile

Quando Stripe addebita il pagamento mensile:

**File**: `app/api/webhooks/stripe/route.ts:397-479`

**Evento**: `invoice.payment_succeeded`

**Azioni**:
1. ✅ Resetta `valuationsUsedThisMonth` a 0
2. ✅ Aggiorna `valuationsResetDate` al mese corrente
3. ✅ **NON** tocca `extraValuationsPurchased` (crediti extra cumulativi)
4. ✅ Invia email con conferma pagamento + crediti accreditati
5. ✅ Crea notifica "Crediti accreditati"

**Crediti Accreditati**:
- **Free**: 5 valutazioni/mese
- **Basic**: 50 valutazioni/mese
- **Premium**: 150 valutazioni/mese

```typescript
// Al pagamento:
await prisma.subscription.update({
  data: {
    valuationsUsedThisMonth: 0,        // ← Reset contatore
    valuationsResetDate: startOfMonth, // ← Aggiorna data reset
    // extraValuationsPurchased NON viene toccato!
  }
})
```

---

## 📅 Cron Job - Reset Crediti Mensili

### Quando viene eseguito

**Schedule**: `0 1 1 * *` (1° giorno del mese, ore 01:00)

**File**: `app/api/cron/reset-monthly-credits/route.ts`

**Configurazione**: `vercel.json:7-10`

### Cosa fa

1. Trova tutte le subscription attive (`active`, `trial`, `past_due`)
2. Per ogni subscription:
   - Verifica se è già stata resettata questo mese
   - Se NO:
     - ✅ Resetta `valuationsUsedThisMonth` a 0
     - ✅ Aggiorna `valuationsResetDate`
     - ✅ **MANTIENE** `extraValuationsPurchased` (crediti extra cumulativi)
     - ✅ Crea notifica per l'utente

### Protezione

Endpoint protetto tramite `CRON_SECRET` in header `Authorization`:

```bash
curl -H "Authorization: Bearer ${CRON_SECRET}" \
  https://domusreport.com/api/cron/reset-monthly-credits
```

---

## 💳 Crediti Extra (Cumulativi)

### Come funzionano

I crediti extra acquistati tramite `POST /api/subscription/buy-valuations`:

✅ **SONO cumulativi** - non scadono a fine mese
✅ **SI accumulano** se non vengono usati
✅ **SI sommano** ai crediti del piano

### Esempio

```
Piano: Basic (50 crediti/mese)
Crediti extra acquistati: 100

Mese 1:
  - Crediti disponibili: 50 (piano) + 100 (extra) = 150
  - Usate: 30 valutazioni
  - Rimangono: 120 crediti

Mese 2 (dopo reset):
  - Crediti disponibili: 50 (piano) + 100 (extra) = 150
  - (i crediti extra rimangono!)
```

### Calcolo Limite Totale

**File**: `lib/subscription-limits.ts:112`

```typescript
const totalLimit = limits.valuationsPerMonth + extraValuations
// Esempio: 50 (Basic) + 100 (extra) = 150 crediti totali
```

---

## 🔍 Verifica Limiti

### Controllo On-Demand

Quando un utente crea una valutazione, il sistema:

**File**: `lib/subscription-limits.ts:69-130`

1. Verifica se è necessario un reset (se `valuationsResetDate < startOfMonth`)
2. Se SÌ:
   - Resetta `valuationsUsedThisMonth` a 0
   - **MANTIENE** `extraValuationsPurchased`
   - Aggiorna `valuationsResetDate`
3. Calcola limite totale: `pianο + extra`
4. Verifica se `valuationsUsed >= totalLimit`

### Incremento Contatore

**File**: `lib/subscription-limits.ts:133-172`

Quando viene creata una valutazione:

```typescript
await prisma.subscription.update({
  data: {
    valuationsUsedThisMonth: { increment: 1 }
  }
})
```

---

## 🎯 Schema Database

### Tabella `subscriptions`

```prisma
model Subscription {
  planType                  String    // free, basic, premium
  status                    String    // active, cancelled, expired, trial, past_due

  // Tracking valutazioni
  valuationsUsedThisMonth   Int       // Reset a 0 ogni mese
  extraValuationsPurchased  Int       // Crediti extra (CUMULATIVI)
  valuationsResetDate       DateTime  // Data ultimo reset

  // Stripe
  stripeCustomerId          String
  stripeSubscriptionId      String
  nextBillingDate           DateTime
}
```

---

## ✅ Flusso Completo - Esempio

### Scenario: Utente con Piano Basic

**1. Iscrizione (1 Gennaio)**
- Piano: Basic (50 valutazioni/mese)
- Pagamento: €50/mese
- Crediti: 50

**2. Acquisto Crediti Extra (15 Gennaio)**
- Acquista: 100 crediti extra
- Crediti totali: 50 + 100 = 150

**3. Utilizzo (Gennaio)**
- Usa: 80 valutazioni
- Rimangono: 70 crediti

**4. Reset Mensile (1 Febbraio - Cron Job)**
- `valuationsUsedThisMonth`: 80 → 0
- `extraValuationsPurchased`: 100 (invariato)
- `valuationsResetDate`: 1 Feb
- Crediti disponibili: 50 + 100 = 150

**5. Pagamento Stripe (1 Febbraio - Webhook)**
- Stripe addebita €50
- Webhook `invoice.payment_succeeded`:
  - Conferma crediti resettati
  - Invia email: "50 crediti accreditati"
  - Notifica dashboard

**6. Utilizzo (Febbraio)**
- Crediti disponibili: 50 (piano) + 100 (extra) = 150
- I 100 crediti extra sono ancora lì!

---

## 🛠️ Manutenzione

### Test Cron Job Manualmente

```bash
# Imposta CRON_SECRET nel .env
export CRON_SECRET="your-secret-here"

# Chiama endpoint
curl -X GET https://domusreport.com/api/cron/reset-monthly-credits \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### Monitoraggio

**Vercel Dashboard** → Cron Jobs:
- Visualizza esecuzioni
- Log di ogni run
- Errori e successi

### Debug

**File**: `app/api/subscription/usage/route.ts`

Ottieni usage corrente:

```bash
GET /api/subscription/usage
Authorization: Bearer {token}

Response:
{
  "widgets": { "current": 2, "limit": 3 },
  "valuations": {
    "current": 30,
    "limit": 50,
    "extra": 100,
    "total": 150
  }
}
```

---

## ⚠️ Note Importanti

1. **Crediti Extra Cumulativi**: Non scadono mai, si accumulano di mese in mese
2. **Doppio Reset**: Sia Stripe webhook CHE cron job resettano i crediti (sicurezza)
3. **Reset On-Demand**: Se un utente non usa l'app per mesi, il reset avviene al primo accesso
4. **Trial**: Il cron job `check-trial-expiry` gestisce separatamente i trial scaduti

---

## 📞 Riferimenti

- **Stripe Docs**: https://stripe.com/docs/billing/subscriptions/webhooks
- **Vercel Cron**: https://vercel.com/docs/cron-jobs
- **Next.js API Routes**: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
