# 🚀 Deployment Guide - Domus Report

Guida per il deployment in produzione su Vercel.

## ⚠️ IMPORTANTE: Variabili d'Ambiente

Il sito in produzione **DEVE** avere queste variabili d'ambiente configurate correttamente su Vercel, altrimenti i redirect da Stripe torneranno su `localhost:3000`.

### 🔧 Come configurare su Vercel

1. **Vai su Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Seleziona il progetto "Domus-Report"

2. **Settings → Environment Variables**

3. **Aggiungi queste variabili (OBBLIGATORIE):**

```bash
# URL Produzione (CRITICO per redirect Stripe)
NEXT_PUBLIC_APP_URL=https://domusreport.mainstream.agency
NEXTAUTH_URL=https://domusreport.mainstream.agency

# JWT Secret (genera con: openssl rand -base64 32)
NEXTAUTH_SECRET=your-production-secret-32-chars-min

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/domusreport?sslmode=require

# Stripe (LIVE KEYS per produzione)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Google Maps
GOOGLE_MAPS_API_KEY=AIza...

# Email (Resend)
RESEND_API_KEY=re_...

# Cron Secret (per analytics)
CRON_SECRET=your-cron-secret-key
```

4. **Environment:** Seleziona "Production" (e opzionalmente "Preview" e "Development")

5. **Salva e Redeploy:**
   - Dopo aver salvato, vai su "Deployments"
   - Seleziona l'ultimo deployment
   - Click su "..." → "Redeploy"

### ✅ Verifica configurazione

Dopo il redeploy, verifica che funzioni correttamente:

1. **Test redirect Stripe:**
   - Vai su https://domusreport.mainstream.agency/dashboard/subscription
   - Clicca su "Upgrade" o "Acquista valutazioni"
   - Verifica che il checkout Stripe si apra
   - Clicca su "← Back to domusreport.mainstream.agency"
   - Dovresti tornare su `https://domusreport.mainstream.agency/dashboard/subscription` (NON localhost)

2. **Controlla i log:**
   - Vercel Dashboard → Deployment → Logs
   - Cerca i log: `🔗 BASE_URL usato: https://domusreport.mainstream.agency`
   - Se vedi `http://localhost:3000`, le variabili non sono caricate correttamente

### 🐛 Troubleshooting

**Problema:** I redirect tornano su `localhost:3000` invece di `domusreport.mainstream.agency`

**Causa:** `NEXT_PUBLIC_APP_URL` non è configurata su Vercel

**Soluzione:**
1. Verifica che la variabile sia presente su Vercel Dashboard → Settings → Environment Variables
2. Controlla che sia applicata a "Production"
3. Fai un redeploy dopo aver aggiunto la variabile

---

**Problema:** Errore "Invalid URL: An explicit scheme must be provided"

**Causa:** `NEXT_PUBLIC_APP_URL` è undefined o non ha `http://` / `https://`

**Soluzione:**
1. Aggiungi `NEXT_PUBLIC_APP_URL=https://domusreport.mainstream.agency` su Vercel
2. Assicurati che inizi con `https://`
3. Redeploy

---

**Problema:** Webhook Stripe non funziona

**Causa:** `STRIPE_WEBHOOK_SECRET` non configurato o sbagliato

**Soluzione:**
1. Vai su Stripe Dashboard → Developers → Webhooks
2. Crea webhook per: `https://domusreport.mainstream.agency/api/webhooks/stripe`
3. Eventi da ascoltare:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copia il "Signing secret" e mettilo in `STRIPE_WEBHOOK_SECRET` su Vercel

---

## 📦 File non committati

Questi file contengono secrets e **NON** devono essere committati:

- `.env.local` (sviluppo locale)
- `.env.production` (produzione - usa Vercel Environment Variables invece)
- `.env` (generico)

Usa sempre `.env.example` come riferimento per le variabili necessarie.

## 🔄 Workflow consigliato

1. **Sviluppo locale:** Usa `.env.local` con `localhost:3000`
2. **Staging/Preview:** Configura variabili su Vercel per branch preview
3. **Produzione:** Configura variabili su Vercel per branch `main`

## 📚 Riferimenti

- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
