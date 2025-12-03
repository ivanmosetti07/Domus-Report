# 🚀 Deploy Production - Quick Start

## 📋 Documentazione Completa

- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Checklist completa step-by-step
- **[DEPLOY_NEON.md](./DEPLOY_NEON.md)** - Setup database PostgreSQL Neon
- **[DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)** - Deploy su Vercel (completo)
- **[DEPLOY_MONITORING.md](./DEPLOY_MONITORING.md)** - Setup monitoring & error tracking

---

## ⚡ Quick Deploy (5 minuti)

### 1. Setup Database Neon

```bash
# 1. Vai su https://neon.tech
# 2. Crea progetto: domus-report-production
# 3. Region: Frankfurt (eu-central-1)
# 4. Copia POOLED connection string
```

### 2. Prepara Environment Variables

```bash
# Genera JWT secret
openssl rand -base64 32

# Copia questo template e compila i valori
cp .env.production.example .env.production.local
```

Variabili obbligatorie:
- ✅ `DATABASE_URL` - Connection string Neon (POOLED)
- ✅ `NEXTAUTH_SECRET` - Output comando sopra
- ✅ `NEXTAUTH_URL` - https://domusreport.mainstream.agency
- ✅ `OPENAI_API_KEY` - Chiave API OpenAI
- ✅ `GOOGLE_MAPS_API_KEY` - Chiave Google Maps
- ⚠️ `N8N_WEBHOOK_URL` - Placeholder per ora (https://placeholder.com/webhook)
- ✅ `NEXT_PUBLIC_APP_URL` - https://domusreport.mainstream.agency
- ✅ `NEXT_PUBLIC_WIDGET_CDN_URL` - https://domusreport.mainstream.agency

### 3. Deploy su Vercel

```bash
# 1. Vai su https://vercel.com/new
# 2. Importa repository domus-report
# 3. Configura Environment Variables (step 2)
# 4. Build command: npm run vercel-build
# 5. Framework: Next.js
# 6. Region: Frankfurt (fra1)
# 7. Click Deploy
```

### 4. Configura Dominio

```bash
# Vercel → Settings → Domains
# Aggiungi: domusreport.mainstream.agency
# Configura DNS CNAME → cname.vercel-dns.com
```

### 5. Test & Verify

```bash
# Homepage
https://domusreport.mainstream.agency

# Test registrazione + login
# Test widget embed
# Verifica database su Neon Dashboard
```

### 6. Seed Demo Data (Opzionale)

```bash
# Localmente con production DB
DATABASE_URL="[production-url]" npm run prisma:seed

# Login demo:
# Email: demo@mainstream.agency
# Password: demo123456
```

---

## 🔧 Utility Commands

```bash
# Verifica environment variables
npm run check:env

# Genera Prisma client
npm run prisma:generate

# Esegui migrations
npm run prisma:migrate:deploy

# Seed database
npm run prisma:seed

# Apri Prisma Studio
npm run prisma:studio
```

---

## 🆘 Troubleshooting

### Build fails: "Prisma Client not found"
```bash
# Verifica vercel-build script includa prisma generate
npm run vercel-build
```

### Cannot connect to database
```bash
# Verifica DATABASE_URL include:
# - postgresql:// prefix
# - ?sslmode=require
# - &pgbouncer=true
```

### Widget non si carica
```bash
# Verifica CORS headers in vercel.json
# Verifica widget-embed.js sia pubblico
```

---

## 📊 Monitoring (Opzionale)

### Setup Sentry (5 min)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
# Aggiungi SENTRY_DSN a Vercel env vars
```

### Vercel Analytics (1 min)
```bash
# Vercel Dashboard → Analytics → Enable
npm install @vercel/analytics
# Aggiungi <Analytics /> in app/layout.tsx
```

---

## 📞 Support

- **Vercel Issues:** [vercel.com/support](https://vercel.com/support)
- **Neon Issues:** [neon.tech/docs](https://neon.tech/docs)
- **Project Issues:** [GitHub Issues](https://github.com/...)

---

## ✅ Deploy Status

- [ ] Database Neon configurato
- [ ] Environment variables su Vercel
- [ ] Deploy completato
- [ ] Dominio configurato
- [ ] SSL attivo
- [ ] Test base passati
- [ ] Seed data caricati
- [ ] Monitoring attivo

**Una volta completato, segui [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) per verifica completa**

---

*Last Updated: 2024-12-03*
