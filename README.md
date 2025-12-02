# DomusReport - Valutazioni Immobiliari Intelligenti

DomusReport è una piattaforma SaaS B2B per agenzie immobiliari che genera valutazioni immobiliari tramite chatbot AI e raccoglie lead qualificati.

## 🚀 Stack Tecnologico

- **Framework**: Next.js 15 (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI + Radix UI
- **Icone**: Lucide React
- **Database**: PostgreSQL + Prisma ORM (da configurare)
- **AI**: OpenAI API (da configurare)

## 📁 Struttura del Progetto

```
/app
  /page.tsx                  # Landing page pubblica
  /register/page.tsx         # Registrazione agenzia
  /login/page.tsx            # Login agenzia
  /dashboard                 # Area riservata agenzie
    /layout.tsx              # Layout dashboard con sidebar
    /page.tsx                # Home dashboard con statistiche
    /leads                   # Gestione lead
      /page.tsx              # Lista lead
      /[id]/page.tsx         # Dettaglio singolo lead
    /widget/page.tsx         # Pagina codice widget
    /profile/page.tsx        # Profilo agenzia
  /docs                      # Documentazione pubblica
    /wordpress/page.tsx
    /webflow/page.tsx
    /html/page.tsx

/components
  /ui                        # Componenti UI Shadcn
  /widget                    # Widget chatbot
    /chat-widget.tsx         # Componente principale widget
    /message.tsx             # Componente singolo messaggio
    /widget-trigger.tsx      # Bottone floating per aprire widget
  /dashboard
    /sidebar.tsx             # Sidebar navigazione dashboard
  /layout
    /navbar.tsx              # Navbar pagine pubbliche
    /footer.tsx              # Footer sito

/lib
  /design-tokens.ts          # Colori, spacing, typography
  /utils.ts                  # Utility functions
  /mock-data.ts              # Dati di esempio per demo

/types
  /index.ts                  # TypeScript interfaces (Lead, Property, etc.)
```

## 🎨 Design System

### Colori
- **Primary**: #2563eb (Blu)
- **Secondary**: #64748b (Grigio)
- **Success**: #10b981 (Verde)
- **Danger**: #ef4444 (Rosso)
- **Warning**: #f59e0b (Arancione)

### Componenti Custom
- `PageHeader`: Header pagine con titolo, sottotitolo e azioni
- `StatCard`: Card statistiche con icona, valore e trend
- `EmptyState`: Stato vuoto con icona, testo e CTA

## 🔧 Setup Locale

### Installazione
```bash
npm install
```

### Avvio Development Server
```bash
npm run dev
```

Il sito sarà disponibile su [http://localhost:3000](http://localhost:3000)

### Build Production
```bash
npm run build
npm start
```

## 📝 TODO per MVP Funzionante

### Backend da Implementare

1. **Database Setup**
   - Configurare PostgreSQL su Neon
   - Eseguire `prisma migrate dev` per creare tabelle
   - Seed database con dati iniziali

2. **Autenticazione**
   - Implementare API `/api/auth/register`
   - Implementare API `/api/auth/login`
   - Setup JWT o NextAuth.js per sessioni
   - Middleware protezione route dashboard

3. **Lead Management**
   - API `/api/leads/create` per salvare lead da widget
   - API `/api/leads` per lista lead dashboard
   - API `/api/leads/[id]` per dettaglio lead

4. **Integrazione OpenAI**
   - File `/lib/openai.ts` con configurazione API
   - Gestione conversazioni AI nel widget
   - Estrazione dati strutturati dalle risposte utente

5. **Integrazione n8n**
   - Workflow n8n per calcolo valutazione
   - Webhook endpoint per ricevere dati immobile
   - Calcolo coefficienti (piano, stato) e prezzo finale
   - File `/lib/n8n.ts` per chiamare webhook

6. **Geocoding**
   - Integrazione Google Maps API o Nominatim
   - Conversione indirizzo → coordinate geografiche

7. **Database OMI**
   - File JSON con valori OMI per città principali
   - Fallback a valore medio nazionale se città non trovata

### Variabili Ambiente

Creare file `.env.local`:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
OPENAI_API_KEY="sk-..."
N8N_WEBHOOK_URL="https://..."
GOOGLE_MAPS_API_KEY="..."
```

## 🎯 Feature Implementate (Frontend)

✅ Landing page completa con hero, benefici, demo widget, pricing
✅ Sistema di autenticazione UI (login/registrazione)
✅ Dashboard agenzia con statistiche
✅ Lista lead con tabella responsive e card mobile
✅ Dettaglio lead con conversazione completa
✅ Widget chatbot funzionante (logica conversazionale)
✅ Calcolo valutazione immobile (mock)
✅ Pagina gestione widget con codice embed
✅ Documentazione installazione (WordPress, Webflow, HTML)
✅ Profilo agenzia con modifica dati
✅ Design system completo e coerente
✅ Mobile-first responsive
✅ Dark mode ready (via Tailwind)

## 📱 Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

## 🎨 Componenti Principali

### Widget Chatbot
Il widget conversazionale guida l'utente attraverso:
1. Richiesta indirizzo immobile
2. Selezione tipo (Appartamento, Villa, Ufficio, Altro)
3. Superficie in mq
4. Piano e ascensore (se applicabile)
5. Stato immobile (Nuovo, Ottimo, Buono, Da ristrutturare)
6. Calcolo valutazione con prezzi min/max/stimato
7. Raccolta contatti (nome, email, telefono)

### Dashboard
- Statistiche in tempo reale (lead totali, ultimi 7gg, valutazioni)
- Codice widget con copia automatica
- Lista lead con filtri e search (da implementare)
- Dettaglio lead con conversazione completa

## 🚀 Deployment

### Vercel (Consigliato)
1. Connetti repository GitHub
2. Configura variabili ambiente
3. Deploy automatico

### Altre Piattaforme
- Netlify
- Railway
- DigitalOcean App Platform

## 📖 Documentazione Utente

Le guide di installazione sono disponibili in:
- [/docs/wordpress](http://localhost:3000/docs/wordpress) - Per siti WordPress
- [/docs/webflow](http://localhost:3000/docs/webflow) - Per siti Webflow
- [/docs/html](http://localhost:3000/docs/html) - Per siti HTML statici

## 🤝 Supporto

Per domande o problemi: [info@domusreport.it](mailto:info@domusreport.it)

## 📄 Licenza

Proprietario: Mainstream Agency
Copyright © 2024 DomusReport

---

**Versione**: 0.1.0 (MVP)
**Ultimo aggiornamento**: Dicembre 2024
