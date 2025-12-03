# 🚀 Checklist Deploy Production - Domus Report

## Pre-Deploy

### 1. Codice & Repository

- [x] FASE 5 completata (Landing Page, About, Terms, Privacy)
- [x] FASE 6 completata (Testing, ottimizzazioni)
- [x] Tutti i file committati su Git
- [ ] Branch `main` aggiornato
- [ ] No console.log o debug code in production
- [ ] README.md aggiornato

### 2. Environment Variables

Prepara questi valori **PRIMA** del deploy:

#### 🔐 Database (Neon)
```bash
DATABASE_URL="postgresql://[user]:[password]@[host]/[db]?sslmode=require&pgbouncer=true"
```
- [ ] Database Neon creato
- [ ] Connection string copiata (POOLED version)
- [ ] Testata localmente (opzionale)

#### 🔑 Authentication
```bash
NEXTAUTH_SECRET="[genera con: openssl rand -base64 32]"
NEXTAUTH_URL="https://domusreport.mainstream.agency"
```
- [ ] JWT Secret generato
- [ ] URL production configurato

#### 🤖 OpenAI
```bash
OPENAI_API_KEY="sk-proj-..."
```
- [ ] API Key attiva
- [ ] Crediti sufficienti verificati
- [ ] Rate limits controllati

#### 🌐 Google Maps
```bash
GOOGLE_MAPS_API_KEY="AIza..."
```
- [ ] Geocoding API abilitata su Google Cloud
- [ ] Billing account configurato (free tier ok)
- [ ] API Key con restrizioni appropriate

#### 🔗 N8N (Temporaneo)
```bash
N8N_WEBHOOK_URL="https://placeholder.com/webhook"
```
- [ ] Placeholder configurato (aggiornerai dopo)

#### 🌍 App URLs
```bash
NEXT_PUBLIC_APP_URL="https://domusreport.mainstream.agency"
NEXT_PUBLIC_WIDGET_CDN_URL="https://domusreport.mainstream.agency"
```
- [ ] URL production decisi
- [ ] Dominio disponibile

---

## Deploy Steps

### Step 1: Setup Database Neon

📄 **Segui:** [DEPLOY_NEON.md](./DEPLOY_NEON.md)

- [ ] Database production creato
- [ ] Connection string salvata in 1Password/sicuro
- [ ] Region Frankfurt selezionata (vicina a Vercel fra1)

### Step 2: Setup Vercel

📄 **Segui:** [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

- [ ] Progetto importato su Vercel
- [ ] Environment Variables configurate (Production + Preview + Development)
- [ ] Build command verificato: `npm run vercel-build`
- [ ] Framework preset: Next.js
- [ ] Region: Frankfurt (fra1)

### Step 3: Configura Dominio

- [ ] Dominio `domusreport.mainstream.agency` aggiunto su Vercel
- [ ] DNS configurato (CNAME record)
- [ ] SSL certificate generato (automatico Vercel)
- [ ] Dominio verificato e attivo

### Step 4: Deploy!

- [ ] Click su **Deploy** da Vercel dashboard
- [ ] Build completata con successo
- [ ] Prisma migrations eseguite
- [ ] Deploy live e funzionante

---

## Post-Deploy Verification

### Test Base (Critici)

- [ ] Homepage carica: https://domusreport.mainstream.agency
- [ ] Registrazione nuova agenzia funziona
- [ ] Login agenzia funziona
- [ ] Dashboard carica correttamente
- [ ] Logout funziona

### Test Widget

- [ ] Codice embed copiato dalla dashboard
- [ ] Widget si carica su pagina HTML test
- [ ] Chat si apre e risponde
- [ ] Conversazione completa funziona
- [ ] Valutazione immobile generata correttamente

### Test Database

- [ ] Vai su Neon Dashboard
- [ ] Verifica tabelle create:
  - [ ] agencies
  - [ ] leads
  - [ ] properties
  - [ ] valuations
  - [ ] conversations
  - [ ] demo_leads
- [ ] Verifica i dati della registrazione test salvati

### Test API Endpoints

- [ ] `/api/auth/register` - 200/201
- [ ] `/api/auth/login` - 200
- [ ] `/api/leads` - 200 (autenticato)
- [ ] `/api/widget/chat` - 200
- [ ] `/api/widget/valuation` - 200

### Test Pages

- [ ] `/` - Homepage
- [ ] `/dashboard` - Dashboard (autenticato)
- [ ] `/docs/wordpress` - Documentazione WordPress
- [ ] `/docs/webflow` - Documentazione Webflow
- [ ] `/docs/html` - Documentazione HTML
- [ ] `/about` - About page
- [ ] `/terms` - Terms & Conditions
- [ ] `/privacy` - Privacy Policy
- [ ] `404` - Error page personalizzata

### Test Mobile

- [ ] Homepage responsive
- [ ] Widget responsive
- [ ] Dashboard responsive
- [ ] Chat widget funziona su mobile

---

## Seed Demo Data (Opzionale)

Per popolare database con dati demo:

```bash
# Opzione 1: Localmente
DATABASE_URL="[production-url]" npm run prisma:seed

# Opzione 2: Vercel CLI
vercel env pull
npm run prisma:seed
```

- [ ] Script seed eseguito
- [ ] Agenzia demo creata: demo@mainstream.agency
- [ ] 5 lead di esempio creati
- [ ] Login con credenziali demo verificato

**Credenziali Demo:**
- Email: `demo@mainstream.agency`
- Password: `demo123456`

---

## Setup Monitoring

📄 **Segui:** [DEPLOY_MONITORING.md](./DEPLOY_MONITORING.md)

### Minimo (Gratis)

- [ ] Sentry configurato per error tracking
- [ ] Vercel Analytics abilitato
- [ ] UptimeRobot monitor creato
- [ ] Test errore inviato e ricevuto su Sentry

### Avanzato (Opzionale)

- [ ] LogRocket per session replay
- [ ] Slack notifications configurate
- [ ] Better Uptime status page
- [ ] Dashboard custom setup

---

## Security Checklist

### Variables & Secrets

- [ ] `.env` file nel `.gitignore`
- [ ] Nessun secret hardcoded nel codice
- [ ] API keys con restrizioni appropriate
- [ ] JWT secret strong e unico

### CORS & Headers

- [ ] CORS configurato per widget embed
- [ ] Headers security configurati in `vercel.json`
- [ ] CSP headers configurati (opzionale)

### Database

- [ ] Connection string con SSL (`sslmode=require`)
- [ ] Connection pooling abilitato (`pgbouncer=true`)
- [ ] Accesso database ristretto a IP Vercel (opzionale Neon Pro)

### Authentication

- [ ] Password hashate con bcrypt
- [ ] Session JWT sicure
- [ ] CSRF protection abilitato (NextAuth default)

---

## Performance Checklist

### Build Optimization

- [ ] Build completata in <2 minuti
- [ ] No warning critici nel build log
- [ ] Bundle size ragionevole (<500kb first load JS)

### Runtime Performance

- [ ] Homepage carica in <2s
- [ ] Dashboard carica in <3s
- [ ] Widget si carica in <1s
- [ ] API response time <500ms (media)

### Database

- [ ] Indexes configurati (Prisma schema)
- [ ] Connection pooling attivo
- [ ] Query ottimizzate (no N+1)

---

## SEO & Analytics

### Meta Tags

- [ ] Title tags su tutte le pagine
- [ ] Meta descriptions
- [ ] Open Graph tags (per social sharing)
- [ ] Favicon configurato

### Analytics

- [ ] Vercel Analytics attivo
- [ ] Google Analytics configurato (opzionale)
- [ ] Conversion tracking setup (opzionale)

### SEO

- [ ] Sitemap.xml generato (Next.js automatico)
- [ ] Robots.txt configurato
- [ ] Canonical URLs corretti

---

## Documentation Checklist

- [x] README.md completo
- [x] DEPLOY_NEON.md creato
- [x] DEPLOY_VERCEL.md creato
- [x] DEPLOY_MONITORING.md creato
- [x] DEPLOY_CHECKLIST.md creato (questo file)
- [ ] API documentation (opzionale)
- [ ] Changelog (opzionale)

---

## N8N Webhook Setup (Da Fare Dopo)

**⏸️ POSPOSTO - Non blocca il launch**

Quando configurerai n8n:

1. [ ] Crea workflow n8n per gestione lead
2. [ ] Configura webhook URL
3. [ ] Testa invio lead a n8n
4. [ ] Aggiorna `N8N_WEBHOOK_URL` su Vercel
5. [ ] Redeploy applicazione

---

## Final Checks Before Launch

### Pre-Launch

- [ ] Tutti i test sopra passati ✅
- [ ] Monitoring attivo e funzionante
- [ ] Backup strategy definita
- [ ] Team informato del launch
- [ ] Support channels pronti

### Launch Day

- [ ] Deploy production completato
- [ ] DNS propagato (24-48h)
- [ ] SSL certificate attivo
- [ ] Monitoring nessun errore
- [ ] Performance metrics OK

### Post-Launch (Prime 24h)

- [ ] Monitora error rate su Sentry
- [ ] Verifica uptime monitor
- [ ] Check performance Vercel Analytics
- [ ] Verifica nessun spike errori database
- [ ] User feedback raccolto

---

## Rollback Plan (Se Necessario)

Se qualcosa va male:

1. **Rollback Vercel:**
   - Vai su Deployments
   - Trova ultimo deploy funzionante
   - Click "Promote to Production"

2. **Rollback Database:**
   - Neon supporta Point-in-Time Recovery
   - Neon Dashboard → Branches → Restore

3. **Comunicazione:**
   - Notifica team
   - Status page update (se configurato)
   - Email clienti se necessario

---

## 🎉 Launch Complete!

Una volta completata questa checklist:

✅ **App Production Live**
✅ **Monitoring Attivo**
✅ **Database Configurato**
✅ **Performance Ottimizzate**
✅ **Security Verificata**

**Next Steps:**
1. Configura n8n webhook quando pronto
2. Inizia acquisizione clienti
3. Monitor performance e errori
4. Itera basandosi su feedback utenti

---

## Contatti & Supporto

- **Vercel Support:** https://vercel.com/support
- **Neon Support:** https://neon.tech/docs/introduction
- **Sentry Support:** https://sentry.io/support/
- **OpenAI Status:** https://status.openai.com/

---

**Data Deploy:** _____________

**Deployed by:** _____________

**Production URL:** https://domusreport.mainstream.agency

**Status:** 🟢 Live / 🟡 In Progress / 🔴 Issues

---

*Document Version: 1.0*
*Last Updated: 2024-12-03*
