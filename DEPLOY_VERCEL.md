# Deploy su Vercel - Guida Completa

## Pre-requisiti

- [ ] Account Vercel creato
- [ ] Database Neon configurato (vedi [DEPLOY_NEON.md](DEPLOY_NEON.md))
- [ ] Connection string Neon salvata
- [ ] OpenAI API Key attiva
- [ ] JWT Secret generato (usa: `openssl rand -base64 32`)

---

## Step 1: Importa Progetto su Vercel

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Importa il repository GitHub: `domus-report`
3. **NON fare ancora il deploy** - prima configuriamo le variabili

---

## Step 2: Configura Environment Variables

### Vai su: Settings → Environment Variables

Configura le seguenti variabili per **Production**, **Preview** e **Development**:

### 🔐 Database

```bash
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true"
```
- Usa la **pooled connection string** di Neon
- Deve includere `sslmode=require`
- Deve includere `pgbouncer=true` per connection pooling

### 🔑 Authentication

```bash
NEXTAUTH_SECRET="[genera con: openssl rand -base64 32]"
NEXTAUTH_URL="https://domusreport.mainstream.agency"
```

**IMPORTANTE per Preview/Development:**
- Preview: usa `NEXTAUTH_URL="https://${VERCEL_URL}"`
- Development: usa `NEXTAUTH_URL="http://localhost:3000"`

### 🤖 OpenAI

```bash
OPENAI_API_KEY="sk-proj-..."
```
- Usa la tua chiave API OpenAI
- Assicurati che abbia crediti sufficienti

### 🌐 Google Maps (Geocoding)

```bash
GOOGLE_MAPS_API_KEY="AIza..."
```
- Per convertire indirizzi in coordinate
- Abilita Geocoding API su Google Cloud Console

### 🔗 N8N Webhook (TEMPORANEO)

```bash
N8N_WEBHOOK_URL="https://placeholder.com/webhook"
```
- Per ora usa un placeholder
- Aggiornerai dopo aver configurato n8n

### 🌍 App URLs

```bash
NEXT_PUBLIC_APP_URL="https://domusreport.mainstream.agency"
NEXT_PUBLIC_WIDGET_CDN_URL="https://domusreport.mainstream.agency"
```

**IMPORTANTE per Preview/Development:**
- Preview: usa `NEXT_PUBLIC_APP_URL="https://${VERCEL_URL}"`
- Development: usa `NEXT_PUBLIC_APP_URL="http://localhost:3000"`

---

## Step 3: Configura Build Settings

### General Settings

- **Framework Preset:** Next.js
- **Root Directory:** `./`
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### Node Version

- **Node Version:** 18.x o superiore

---

## Step 4: Configura Dominio

1. Vai su **Settings → Domains**
2. Aggiungi dominio: `domusreport.mainstream.agency`
3. Segui le istruzioni per configurare DNS:
   - Se dominio su Cloudflare/altro: aggiungi CNAME record
   - Se dominio su Vercel: configurazione automatica

### Configurazione DNS (se esterno)

```
Type: CNAME
Name: domusreport
Value: cname.vercel-dns.com
```

---

## Step 5: Deploy!

1. Clicca **Deploy** dalla dashboard
2. Vercel eseguirà:
   - `npm install`
   - `npm run vercel-build` (include prisma generate, migrate, e next build)
   - Deploy automatico

### Monitoraggio Deploy

- Controlla i logs in tempo reale
- Verifica che le migrations Prisma siano eseguite correttamente
- Verifica build Next.js completata con successo

---

## Step 6: Post-Deploy Verification

### Test Base

1. Visita: `https://domusreport.mainstream.agency`
2. Verifica homepage carichi correttamente
3. Testa registrazione nuova agenzia
4. Testa login
5. Verifica dashboard funzioni

### Test Widget

1. Copia il codice embed dal dashboard
2. Incollalo in una pagina HTML di test
3. Verifica widget si carichi e funzioni
4. Testa conversazione completa

### Check Database

1. Vai su Neon dashboard
2. Verifica tabelle create correttamente:
   - agencies
   - leads
   - properties
   - valuations
   - conversations
   - demo_leads

---

## Step 7: Seed Data (Opzionale)

Per creare dati di esempio per demo:

```bash
# Localmente con DB production
DATABASE_URL="[production-url]" npm run prisma:seed

# O tramite Vercel CLI
vercel env pull
npm run prisma:seed
```

Questo creerà un'agenzia demo con lead di esempio.

---

## Troubleshooting Comuni

### ❌ Build fails: "Prisma Client not found"

**Soluzione:** Verifica che `vercel-build` script includa `prisma generate`

### ❌ Runtime error: "Cannot connect to database"

**Soluzione:**
- Verifica `DATABASE_URL` configurata correttamente
- Verifica include `sslmode=require`
- Verifica Neon database sia attivo

### ❌ NextAuth error: "Invalid callback URL"

**Soluzione:**
- Verifica `NEXTAUTH_URL` corrisponde al dominio
- Per preview: usa `https://${VERCEL_URL}`

### ❌ Widget non si carica

**Soluzione:**
- Verifica `NEXT_PUBLIC_WIDGET_CDN_URL` configurato
- Controlla CORS headers in next.config.js
- Verifica widget-embed.js sia pubblicamente accessibile

---

## Performance & Monitoring

### Setup Vercel Analytics (Opzionale)

1. Vai su **Analytics** tab
2. Abilita Web Analytics
3. Aggiungi `<Analytics />` component in app/layout.tsx

### Speed Insights (Opzionale)

1. Vai su **Speed Insights** tab
2. Abilita monitoring
3. Aggiungi `<SpeedInsights />` component in app/layout.tsx

---

## 🚀 Deploy Completato!

Una volta completati tutti gli step:

- ✅ App live su: https://domusreport.mainstream.agency
- ✅ Database production configurato e migrato
- ✅ Widget embed funzionante
- ✅ Dashboard agenzie operativa

**Next Steps:**
1. Configura n8n webhook e aggiorna `N8N_WEBHOOK_URL`
2. Setup monitoring errori (vedi [DEPLOY_MONITORING.md](DEPLOY_MONITORING.md))
3. Test completo delle funzionalità
4. Seed data per demo clienti

---

## 📞 Supporto

Per problemi durante il deploy:
- Check Vercel logs: Dashboard → Deployments → [deployment] → Logs
- Check Neon logs: Neon Dashboard → Monitoring
- Documentazione: [docs.vercel.com](https://vercel.com/docs)
