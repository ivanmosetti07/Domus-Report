# 🗄️ Istruzioni Database - Nuove Tabelle

## 📋 Cosa Abbiamo Aggiunto

**10 nuove tabelle** al database per completare le funzionalità del sistema:

### Priorità ALTA (Core Features)
1. **agency_sessions** - Gestione sessioni JWT e logout
2. **lead_statuses** - Status CRM (NEW, CONTACTED, CONVERTED, etc.)
3. **subscriptions** - Gestione piani e billing

### Priorità MEDIA (Enhancement)
4. **audit_logs** - Tracking azioni (GDPR compliance)
5. **agency_settings** - Configurazione personalizzata agenzia
6. **property_attachments** - Upload foto/documenti immobili

### Priorità BASSA (Advanced)
7. **notifications** - Sistema notifiche in-app
8. **analytics_daily** - Metriche e conversion rate
9. **widget_events** - Tracking eventi widget
10. **email_templates** - Template email automazione

---

## 🚀 Come Applicare le Modifiche

### Step 1: Esegui SQL su Neon

1. **Vai su [Neon Dashboard](https://console.neon.tech)**
2. Seleziona il progetto **domus-report-production**
3. Vai su **SQL Editor** (icona `</>` nella sidebar)
4. **Apri il file:** `prisma/migrations/NEON_ADD_TABLES.sql`
5. **Copia tutto il contenuto** del file
6. **Incolla nel SQL Editor** di Neon
7. **Click su "Run"** (o Ctrl/Cmd + Enter)
8. ✅ **Verifica:** Dovresti vedere "Success" per ogni tabella creata

### Step 2: Verifica Tabelle Create

Nel SQL Editor di Neon, esegui:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Dovresti vedere **16 tabelle** totali:
- 6 esistenti (agencies, leads, properties, valuations, conversations, demo_leads)
- 10 nuove (agency_sessions, lead_statuses, subscriptions, audit_logs, agency_settings, property_attachments, notifications, analytics_daily, widget_events, email_templates)

### Step 3: Redeploy Vercel (Automatico)

Il redeploy su Vercel avverrà automaticamente al prossimo push su GitHub.

Se vuoi forzare un redeploy:
1. Vai su **Vercel Dashboard**
2. Seleziona il progetto **domus-report**
3. Click **Deployments**
4. Click **Redeploy** sull'ultimo deployment

---

## 📡 Nuove API Routes Disponibili

### Lead Status (CRM)

```bash
# Ottieni status history lead
GET /api/lead-status?leadId=xxx
Authorization: Bearer {token}

# Crea nuovo status
POST /api/lead-status
{
  "leadId": "xxx",
  "status": "CONTACTED", // NEW, CONTACTED, INTERESTED, CONVERTED, LOST
  "note": "Chiamato e interessato"
}

# Aggiorna status
PUT /api/lead-status
{
  "statusId": "xxx",
  "status": "INTERESTED",
  "note": "Ricontattare la prossima settimana"
}
```

### Subscription

```bash
# Ottieni subscription corrente
GET /api/subscription
Authorization: Bearer {token}

# Upgrade/Downgrade piano
POST /api/subscription
{
  "planType": "premium", // free, basic, premium
  "status": "active",
  "paymentMethodId": "pm_xxx"
}

# Cancella subscription (downgrade a free)
DELETE /api/subscription
```

### Settings Agenzia

```bash
# Ottieni settings
GET /api/settings
Authorization: Bearer {token}

# Aggiorna settings
PUT /api/settings
{
  "notificationsEmail": true,
  "emailOnNewLead": true,
  "timeZone": "Europe/Rome",
  "language": "it",
  "widgetTheme": "default",
  "customCss": "/* custom styles */"
}
```

### Notifications

```bash
# Ottieni notifiche
GET /api/notifications?onlyUnread=true
Authorization: Bearer {token}

# Crea notifica (uso interno)
POST /api/notifications
{
  "type": "NEW_LEAD",
  "leadId": "xxx",
  "title": "Nuovo Lead",
  "message": "Hai ricevuto un nuovo lead da Mario Rossi"
}

# Marca come letta
PUT /api/notifications
{
  "notificationId": "xxx"
}

# Marca tutte come lette
PUT /api/notifications
{
  "markAllAsRead": true
}

# Elimina notifica
DELETE /api/notifications?id=xxx
```

---

## 🔧 Modifiche al Codice

### Schema Prisma Aggiornato

Il file `prisma/schema.prisma` ora include tutti i 10 nuovi modelli con relazioni corrette.

Per rigenerare il Prisma Client dopo modifiche future:

```bash
npm run prisma:generate
```

### Modelli Disponibili

```typescript
// Importa da Prisma Client
import { prisma } from '@/lib/prisma'

// Esempi utilizzo
const sessions = await prisma.agencySession.findMany()
const statuses = await prisma.leadStatus.findMany()
const subscription = await prisma.subscription.findUnique()
const logs = await prisma.auditLog.findMany()
const settings = await prisma.agencySetting.findUnique()
const attachments = await prisma.propertyAttachment.findMany()
const notifications = await prisma.notification.findMany()
const analytics = await prisma.analyticsDaily.findMany()
const events = await prisma.widgetEvent.findMany()
const templates = await prisma.emailTemplate.findMany()
```

---

## 🎯 Prossimi Passi (Opzionali)

### 1. Dashboard UI per Nuove Features

Potrai aggiungere UI per:
- **Status Lead:** Dropdown per cambiare status nella pagina lead detail
- **Subscription:** Pagina settings per upgrade/downgrade piano
- **Notifications:** Badge con count non lette + dropdown notifiche
- **Settings:** Pagina impostazioni agenzia

### 2. Automazioni

Potrai implementare:
- **Auto-create notification** quando arriva nuovo lead
- **Auto-update analytics** daily tramite cron job
- **Email notification** su eventi importanti (usando email_templates)

### 3. Tracking Widget

Potrai tracciare:
- **Widget impressions** quando widget viene caricato
- **Widget clicks** quando utente apre chat
- **Drop-off rate** quando utente chiude senza completare

---

## ❓ Troubleshooting

### Errore: "relation already exists"

Se vedi questo errore, significa che alcune tabelle esistono già. Puoi:

1. **Opzione A:** Elimina le tabelle esistenti e ricrea
   ```sql
   DROP TABLE IF EXISTS agency_sessions CASCADE;
   DROP TABLE IF EXISTS lead_statuses CASCADE;
   -- ... etc per tutte le tabelle
   ```

2. **Opzione B:** Esegui solo le tabelle mancanti
   - Commenta nel file SQL le tabelle che già esistono
   - Esegui solo le rimanenti

### Errore Prisma: "Unknown field"

Se Prisma non riconosce i nuovi campi:

```bash
# Rigenera client Prisma
npm run prisma:generate

# Riavvia dev server
npm run dev
```

### API Routes non funzionano

1. Verifica che le tabelle siano create su Neon
2. Verifica che Prisma Client sia rigenerato
3. Controlla token JWT valido nell'Authorization header
4. Verifica logs errori nel browser console

---

## ✅ Checklist Completamento

- [ ] SQL eseguito su Neon senza errori
- [ ] 16 tabelle totali presenti nel database
- [ ] Prisma Client rigenerato (`npm run prisma:generate`)
- [ ] Vercel redeployato (automatico al push)
- [ ] API routes testate con Postman/curl
- [ ] Nessun errore in production logs

---

## 📞 Support

Se hai problemi:
1. Verifica logs Neon Dashboard → Monitoring
2. Verifica logs Vercel Dashboard → Deployments → Logs
3. Controlla console browser per errori client-side

---

**Tempo stimato:** 5-10 minuti

**Status:** Pronto per esecuzione

---

*Ultimo aggiornamento: 2024-12-03*
