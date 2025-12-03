# 🚀 Deploy Vercel - Guida Rapida

## ⚠️ Prerequisiti

Prima di deployare su Vercel, assicurati di avere:

1. ✅ **Database Neon** configurato
2. ✅ **OpenAI API Key** attiva
3. ✅ **Tutte le environment variables** pronte

---

## 📋 Step-by-Step Deploy

### 1. **Connetti GitHub a Vercel**

1. Vai su [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Seleziona il repository GitHub: `ivanmosetti07/Domus-Report`
4. Click "Import"

---

### 2. **Configura Environment Variables**

⚠️ **IMPORTANTE**: Aggiungi TUTTE queste variabili in Vercel Dashboard → Settings → Environment Variables

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# JWT Secret (REQUIRED)
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="https://domusreport.mainstream.agency"

# OpenAI (REQUIRED)
OPENAI_API_KEY="sk-proj-..."

# Cron Job Secret (REQUIRED per analytics)
CRON_SECRET="your-cron-secret-key-generate-with-openssl"

# App URLs (REQUIRED)
NEXT_PUBLIC_APP_URL="https://domusreport.mainstream.agency"
NEXT_PUBLIC_WIDGET_CDN_URL="https://cdn.domusreport.mainstream.agency"

# Opzionali
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/..."
GOOGLE_MAPS_API_KEY="AIza..."
```

**Come generare CRON_SECRET:**
```bash
openssl rand -base64 32
```

---

### 3. **Esegui Database Migration**

**IMPORTANTE**: Prima del primo deploy, esegui migrations sul database Neon:

```bash
# Connetti al database production
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Verifica che tutte le tabelle siano create
DATABASE_URL="postgresql://..." npx prisma db push
```

---

### 4. **Deploy**

1. Click "Deploy" su Vercel
2. Attendi il build (~2-3 minuti)
3. ✅ Il sito sarà live su `https://tuoprogetto.vercel.app`

---

## 🔧 Setup Cron Job (Analytics Aggregation)

### Opzione A: Vercel Cron (Consigliato)

**1. Crea file `vercel.json` nella root:**

```json
{
  "crons": [
    {
      "path": "/api/analytics/aggregate",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**2. Commit e push:**
```bash
git add vercel.json
git commit -m "chore: Add Vercel cron job for analytics"
git push
```

**3. Vercel auto-configurerà il cron job al prossimo deploy**

---

### Opzione B: External Cron (Zapier, Make.com)

**Endpoint:** `https://tuodominio.com/api/analytics/aggregate`

**Config:**
- Method: `POST`
- Headers:
  ```json
  {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_CRON_SECRET"
  }
  ```
- Schedule: `0 2 * * *` (ogni giorno alle 02:00)

---

## ✅ Verifica Deploy

Dopo il deploy, testa:

1. **Homepage**: `https://tuodominio.com`
2. **Login**: `https://tuodominio.com/login`
3. **Register**: `https://tuodominio.com/register`
4. **API Health**: `https://tuodominio.com/api/leads` (deve ritornare 401 se non loggato)

---

## 🐛 Troubleshooting

### ❌ Build Failed: "Route couldn't be rendered statically"

**Causa**: Normale per route con autenticazione (usano cookies)

**Soluzione**: ✅ Ignora, non è un errore. Next.js le rende dynamic automaticamente.

---

### ❌ Error: "Prisma Client Validation Error"

**Causa**: Database schema non aggiornato

**Soluzione**:
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma generate
```

---

### ❌ Error: "OPENAI_API_KEY is not defined"

**Causa**: Environment variable mancante

**Soluzione**:
1. Vai su Vercel Dashboard → Settings → Environment Variables
2. Aggiungi `OPENAI_API_KEY`
3. Redeploy

---

### ❌ Widget non funziona su sito esterno

**Causa**: CORS o widgetId sbagliato

**Soluzione**:
1. Verifica widgetId in dashboard
2. Verifica che `NEXT_PUBLIC_APP_URL` sia corretto
3. Testa con:
   ```html
   <script src="https://tuodominio.com/widget.js" data-widget-id="YOUR_WIDGET_ID"></script>
   ```

---

## 📊 Monitoring

### Vercel Dashboard

- **Deployments**: storico deploy
- **Analytics**: traffico e performance
- **Logs**: errori runtime

### Database Neon

- **Dashboard**: metriche database
- **Query Performance**: slow queries
- **Storage**: utilizzo spazio

---

## 🔒 Security Checklist

Dopo il deploy, verifica:

- [x] JWT_SECRET è strong (min 32 caratteri)
- [x] CRON_SECRET è random e sicuro
- [x] DATABASE_URL usa sslmode=require
- [x] Rate limiting attivo su API pubbliche
- [x] CORS configurato correttamente
- [x] Environment variables non in codice

---

## 🎉 Deploy Completato!

Ora puoi:

1. ✅ Registrare un'agenzia
2. ✅ Copiare codice widget
3. ✅ Installare su sito cliente
4. ✅ Ricevere lead
5. ✅ Vedere analytics

---

**Dominio Custom (Opzionale)**

Per usare un dominio custom:

1. Vercel Dashboard → Settings → Domains
2. Aggiungi dominio (es: `domusreport.mainstream.agency`)
3. Configura DNS con CNAME:
   ```
   CNAME   @   cname.vercel-dns.com
   ```
4. Attendi propagazione DNS (~10 minuti)
5. ✅ SSL automatico da Let's Encrypt

---

**Next Steps:**

- 📧 Setup email automation
- 💳 Integra Stripe billing
- 📱 Sviluppa mobile app
- 🤖 Aggiungi AI insights avanzati

---

**Supporto:**

Se hai problemi:
1. Controlla Vercel Logs
2. Controlla Neon Database status
3. Testa API endpoints con Postman
4. Verifica environment variables

**Developed with ❤️ by Mainstream Agency**
