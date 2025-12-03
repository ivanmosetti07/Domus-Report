# 🏠 DomusReport - Valutazioni Immobiliari Intelligenti

**Sistema SaaS completo per agenzie immobiliari che genera lead qualificati tramite un chatbot AI di valutazione immobiliare.**

DomusReport è una piattaforma full-stack production-ready che combina intelligenza artificiale conversazionale, valutazioni immobiliari automatiche basate su dati OMI ufficiali e un CRM integrato per la gestione dei lead.

---

## ✨ Features Principali

### 🤖 Widget Conversazionale AI
- Chatbot interattivo con OpenAI GPT-4 per raccolta dati immobile
- Conversazione naturale guidata per estrazione informazioni (indirizzo, superficie, tipologia, stato)
- Quick replies intelligenti per accelerare il flusso
- Geocoding automatico degli indirizzi
- Widget embeddabile con singola riga di codice JavaScript
- Isolamento completo multi-tenant (ogni agenzia ha widget_id univoco)

### 💰 Valutazioni Immobiliari Automatiche
- Algoritmo di valutazione basato su dati OMI (Osservatorio Mercato Immobiliare)
- Calcolo coefficienti per piano, presenza ascensore e stato di conservazione
- Range di valutazione (min-max-stimato) con spiegazione dettagliata
- Integrazione esterna per calcoli complessi (supporto n8n workflow)
- Fallback locale in caso di indisponibilità servizi esterni

### 📊 Dashboard CRM Completa
- **Vista Lead**: lista completa con filtri, ordinamento e ricerca
- **Dettaglio Lead**: scheda completa con contatti, immobile e valutazione
- **Gestione Status**: workflow CRM (NEW → CONTACTED → INTERESTED → CONVERTED → LOST)
- **Conversazioni**: visualizzazione completa dello storico chat con il cliente
- **Statistiche**: metriche real-time (lead totali, ultimi 7 giorni, valutazioni generate)
- **Profilo Agenzia**: gestione dati, cambio password, impostazioni

### 🔐 Sistema Autenticazione & Sicurezza
- Registrazione agenzia con validazione email univoca
- Login sicuro con password hashing (bcrypt)
- Gestione sessioni JWT con refresh automatico
- Middleware protezione route dashboard
- Audit log completo per compliance GDPR
- Rate limiting su API pubbliche

### 📈 Funzionalità Avanzate (Database Ready)
- **Subscriptions**: gestione piani free/basic/premium con billing
- **Notifications**: sistema notifiche in-app per nuovi lead ed eventi
- **Analytics**: metriche giornaliere aggregrate (impressioni, conversioni, tassi)
- **Email Templates**: sistema templating email personalizzabili
- **Property Attachments**: supporto upload documenti e foto immobili
- **Widget Events Tracking**: tracciamento eventi widget per ottimizzazioni

---

## 🛠️ Stack Tecnologico

### Frontend
- **Next.js 15** (App Router) - Framework React con SSR/SSG
- **React 18** - UI Components con Hooks
- **TypeScript** - Type safety completo
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library accessibile
- **Lucide Icons** - Iconografia moderna

### Backend
- **Next.js API Routes** - Serverless functions
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** (Neon) - Database relazionale cloud
- **bcrypt** - Password hashing
- **jose** - JWT management

### AI & Integrazioni
- **OpenAI GPT-4** - Conversational AI
- **Google Maps API / Nominatim** - Geocoding
- **n8n Webhook** (opzionale) - Calcolo valutazioni esterno

### DevOps & Monitoring
- **Vercel** - Deployment platform
- **Sentry** (ready) - Error tracking
- **ESLint + Prettier** - Code quality

---

## 📁 Architettura del Progetto

```
Domus-Report/
├── app/
│   ├── (auth)/                   # Gruppo autenticazione
│   │   ├── login/page.tsx        # ✅ Login agenzia
│   │   └── register/page.tsx     # ✅ Registrazione agenzia
│   ├── dashboard/                # Dashboard protetta
│   │   ├── page.tsx              # ✅ Home: widget code + statistiche
│   │   ├── leads/
│   │   │   ├── page.tsx          # ✅ Lista lead con tabella
│   │   │   └── [id]/page.tsx     # ✅ Dettaglio singolo lead
│   │   ├── analytics/page.tsx    # ✅ Dashboard analytics completa
│   │   ├── profile/page.tsx      # ✅ Profilo agenzia
│   │   ├── widget/page.tsx       # ✅ Configurazione widget
│   │   └── layout.tsx            # Layout sidebar
│   ├── widget/[widgetId]/page.tsx # ✅ Widget embeddabile
│   ├── docs/                     # Documentazione pubblica
│   │   ├── wordpress/page.tsx    # ✅ Guida WordPress
│   │   ├── webflow/page.tsx      # ✅ Guida Webflow
│   │   └── html/page.tsx         # ✅ Guida HTML
│   ├── about/page.tsx            # ✅ Chi siamo
│   ├── privacy/page.tsx          # ✅ Privacy Policy
│   ├── terms/page.tsx            # ✅ Termini Servizio
│   ├── page.tsx                  # ✅ Landing page pubblica
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts    # ✅ POST login
│       │   ├── register/route.ts # ✅ POST registrazione
│       │   └── logout/route.ts   # ✅ POST logout
│       ├── leads/route.ts        # ✅ POST crea lead + GET lista
│       ├── demo-leads/route.ts   # ✅ POST demo lead landing
│       ├── chat/route.ts         # ✅ POST conversazione AI
│       ├── valuation/route.ts    # ✅ POST calcolo valutazione
│       ├── lead-status/route.ts  # ✅ PUT aggiorna status CRM
│       ├── subscription/route.ts # ✅ Gestione piani (DB ready)
│       ├── settings/route.ts     # ✅ Impostazioni agenzia
│       ├── notifications/route.ts # ✅ Notifiche in-app
│       ├── widget-events/route.ts # ✅ POST tracking eventi widget
│       └── analytics/
│           ├── route.ts          # ✅ GET dati aggregati
│           ├── live/route.ts     # ✅ GET statistiche real-time
│           └── aggregate/route.ts # ✅ POST job cron aggregazione
├── components/
│   ├── widget/
│   │   ├── ChatWidget.tsx        # ✅ Widget conversazionale
│   │   ├── Message.tsx           # ✅ Singolo messaggio chat
│   │   └── QuickReplies.tsx      # ✅ Bottoni risposta rapida
│   ├── dashboard/
│   │   ├── Sidebar.tsx           # ✅ Menu laterale
│   │   ├── StatsCards.tsx        # ✅ Card statistiche
│   │   ├── LeadTable.tsx         # ✅ Tabella lead
│   │   └── ConversationView.tsx  # ✅ Visualizzatore chat
│   └── ui/                       # Shadcn UI components
├── lib/
│   ├── openai.ts                 # ✅ Client OpenAI
│   ├── geocoding.ts              # ✅ Google Maps/Nominatim
│   ├── omi.ts                    # ✅ Database valori OMI
│   ├── valuation.ts              # ✅ Algoritmo calcolo
│   ├── auth.ts                   # ✅ JWT utilities
│   └── prisma.ts                 # ✅ Prisma client singleton
├── prisma/
│   └── schema.prisma             # ✅ Schema database (17 modelli)
├── public/
│   ├── widget.js                 # ✅ Script embed widget
│   └── EMBED_INSTRUCTIONS.md     # ✅ Guida installazione
└── middleware.ts                 # ✅ Auth middleware

```

---

## 🗄️ Database Schema (17 Tabelle)

### Core Tables
- **Agency** - Agenzie registrate (email, password, widgetId, piano, città)
- **Lead** - Lead generati dal widget (nome, cognome, email, telefono)
- **Property** - Immobili dei lead (indirizzo, tipo, superficie, piano, ascensore, stato)
- **Valuation** - Valutazioni generate (prezzi min/max/stimato, coefficienti, spiegazione)
- **Conversation** - Storico conversazioni chat (messaggi JSON)
- **DemoLead** - Lead demo landing page (separati da lead reali)

### Sistema Autenticazione & Sessioni
- **AgencySession** - Gestione token JWT e logout (tokenHash, expiresAt, ipAddress)

### CRM & Workflow
- **LeadStatus** - Tracking stato lead (NEW, CONTACTED, INTERESTED, CONVERTED, LOST)

### Billing & Subscription
- **Subscription** - Gestione piani e billing (planType, status, trialEndsAt, nextBillingDate)

### Features Avanzate (Ready to Use)
- **AuditLog** - Log azioni GDPR (action, entityType, oldValue, newValue)
- **AgencySetting** - Impostazioni personalizzate (theme, notifiche, timezone)
- **PropertyAttachment** - Upload documenti immobili (foto, PDF, planimetrie)
- **Notification** - Notifiche in-app (NEW_LEAD, SUBSCRIPTION_EXPIRING, ecc.)
- **AnalyticsDaily** - Metriche aggregate giornaliere (impressions, clicks, leads, conversioni)
- **WidgetEvent** - Tracking eventi widget (OPEN, CLOSE, MESSAGE, VALUATION_VIEW)
- **EmailTemplate** - Template email personalizzabili (NEW_LEAD, WELCOME, ecc.)

---

## 🚀 Setup Locale

### Prerequisiti
- Node.js 18+
- PostgreSQL (locale o Neon cloud)
- Account OpenAI con API key

### Installazione

```bash
# Clona repository
git clone https://github.com/mainstream-agency/domus-report.git
cd domus-report

# Installa dipendenze
npm install

# Setup environment variables
cp .env.example .env.local
# Edita .env.local con:
# DATABASE_URL="postgresql://..."
# OPENAI_API_KEY="sk-..."
# JWT_SECRET="your-secret-key"

# Setup database
npx prisma migrate dev
npx prisma generate

# Avvia dev server
npm run dev
```

Server disponibile su [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

### Flusso Completo End-to-End

1. **Registrazione Agenzia**
   - Vai su `/register`
   - Compila form (nome agenzia, email, password, città)
   - Login automatico e redirect a dashboard

2. **Configurazione Widget**
   - Dashboard home mostra codice embed personalizzato
   - Copia codice con widget_id univoco dell'agenzia

3. **Installazione Widget**
   - Incolla codice in pagina HTML/WordPress/Webflow
   - Widget appare come bubble floating bottom-right

4. **Simulazione Cliente Finale**
   - Apri widget sul sito
   - Conversazione guidata AI raccoglie dati immobile
   - Geocoding automatico indirizzo
   - Calcolo valutazione istantaneo
   - Inserimento contatti (nome, cognome, email, telefono)
   - Salvataggio lead nel database

5. **Gestione Lead in Dashboard**
   - Vai su `/dashboard/leads`
   - Visualizza nuovo lead in tabella
   - Click "Dettagli" per vedere:
     - Contatti completi
     - Dati immobile
     - Valutazione con range prezzo
     - Storico conversazione completa
   - Aggiorna status CRM (es. da NEW a CONTACTED)

### Test Separazione Multi-Tenant
- Registra 2 agenzie diverse
- Ogni agenzia ha widget_id univoco
- Genera lead con entrambi i widget
- Verifica che ogni agenzia vede solo i propri lead

---

## 📦 Deploy Production

### Vercel + Neon (Consigliato)

1. **Setup Database Neon**
   ```bash
   # Crea progetto su https://neon.tech
   # Copia connection string
   ```

2. **Deploy Vercel**
   ```bash
   # Connetti GitHub repo a Vercel
   # Imposta variabili ambiente:
   # - DATABASE_URL (Neon)
   # - OPENAI_API_KEY
   # - JWT_SECRET
   # - NEXTAUTH_URL (https://tuodominio.com)
   ```

3. **Migrate Database**
   ```bash
   npx prisma migrate deploy
   ```

4. **Configura Dominio**
   - Dominio principale: `domusreport.mainstream.agency`
   - CDN widget: `cdn.domusreport.mainstream.agency`

### Variabili Ambiente Production

```env
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Auth
JWT_SECRET="generate-strong-secret-key-here"
NEXTAUTH_URL="https://domusreport.mainstream.agency"

# Opzionale: n8n Webhook
N8N_WEBHOOK_URL="https://n8n.example.com/webhook/valuation"

# Opzionale: Geocoding
GOOGLE_MAPS_API_KEY="AIza..."
```

---

## 🔄 Roadmap Completamento

### ✅ Fase 1-7: Completate (MVP Production Ready)
- [x] Setup base Next.js + Tailwind + Shadcn UI
- [x] Database Prisma con 17 modelli completi
- [x] Widget conversazionale AI funzionante
- [x] Sistema geocoding e dati OMI
- [x] Calcolo valutazioni automatiche
- [x] Registrazione/Login agenzie
- [x] Dashboard CRM con lista e dettaglio lead
- [x] Sistema status lead (CRM workflow)
- [x] Landing page pubblica con demo widget
- [x] Script embed widget.js
- [x] Documentazione installazione (WordPress, Webflow, HTML)
- [x] Deploy production su Vercel + Neon
- [x] 10 nuove tabelle database per features avanzate

### 🎯 Prossimi Step (Post-MVP)

#### ✅ Completati
- [x] **Dashboard Analytics**: grafici conversioni, trend temporali, funnel analysis
- [x] **Widget Event Tracking**: tracking completo eventi utente con batching
- [x] **Export CSV**: scarica dati analytics in CSV

#### Priorità Alta
- [ ] **Email Automation**: invia email a nuovi lead + notifiche agenzia
- [ ] **Password Reset**: flow reset password via email
- [ ] **Export Lead**: scarica CSV/Excel lista lead

#### Priorità Media
- [ ] **Subscription Billing**: integrazione Stripe per piani paid
- [ ] **Notifiche In-App**: sistema notifiche real-time
- [ ] **Widget Customization**: personalizza colori/logo widget da dashboard
- [ ] **Lead Notes**: aggiungi note private ai lead
- [ ] **Team Management**: invita collaboratori agenzia

#### Priorità Bassa
- [ ] **Mobile App**: app React Native per agenzie
- [ ] **WhatsApp Integration**: invia valutazioni via WhatsApp
- [ ] **Advanced Analytics**: heatmaps, funnel analysis, A/B testing
- [ ] **Multi-Language**: widget in più lingue

---

## 🤝 Contributi

Progetto sviluppato da [Mainstream Agency](https://mainstream.agency).

Per segnalare bug o richiedere features, apri una issue su GitHub.

---

## 📄 Licenza

Proprietario: Mainstream Agency
Tutti i diritti riservati

---

## 📞 Supporto

- Website: [https://mainstream.agency](https://mainstream.agency)
- Email: info@mainstream.agency

---

**DomusReport** - Trasforma i visitatori del tuo sito in lead qualificati 🚀
