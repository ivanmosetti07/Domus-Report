# 📋 Guida Test End-to-End - DomusReport

## Setup Iniziale

### 1. Configurazione Database
```bash
# Crea file .env con:
DATABASE_URL="postgresql://user:password@localhost:5432/domusreport"
NEXTAUTH_SECRET="your-secret-key-change-in-production"

# Opzionali:
GOOGLE_MAPS_API_KEY="your-google-maps-key"
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/valuation"
```

### 2. Setup Database
```bash
# Esegui migrazioni
npx prisma migrate deploy

# Genera client Prisma
npx prisma generate

# (Opzionale) Seed database
npx prisma db seed
```

### 3. Avvia Server
```bash
npm run dev
```

---

## ✅ FLUSSO A: Nuova Agenzia

### Obiettivo
Verificare che una nuova agenzia possa registrarsi, copiare il codice widget, installarlo e ricevere lead.

### Steps

#### 1. Registrazione Agenzia
- [ ] Vai su `http://localhost:3000/register`
- [ ] Compila form:
  - Nome Agenzia: "Agenzia Test 1"
  - Email: `test1@example.com`
  - Password: `Test1234!`
  - Città: "Milano"
- [ ] Clicca "Registrati"
- [ ] **Verifica**: Redirect a `/dashboard`
- [ ] **Verifica**: Messaggio di benvenuto presente

#### 2. Copia Codice Widget
- [ ] Vai su `/dashboard/widget`
- [ ] **Verifica**: Widget ID univoco visibile
- [ ] Clicca "Copia Codice"
- [ ] **Verifica**: Toast "Codice copiato!"
- [ ] Salva il Widget ID per dopo

#### 3. Installa Widget su Pagina Test
- [ ] Crea file `test-widget.html`:
```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Widget DomusReport</title>
</head>
<body>
    <h1>Test Widget Valutazione</h1>
    <p>Il widget apparirà in basso a destra</p>

    <!-- Sostituisci YOUR_WIDGET_ID con il tuo Widget ID -->
    <script src="http://localhost:3000/widget-embed.js?widgetId=YOUR_WIDGET_ID"></script>
</body>
</html>
```
- [ ] Apri il file HTML nel browser
- [ ] **Verifica**: Bottone floating widget visibile in basso a destra

#### 4. Compila Widget Come Utente Finale
- [ ] Clicca sul bottone widget
- [ ] **Verifica**: Chat si apre fullscreen (mobile) o popup (desktop)
- [ ] Segui il flusso conversazione:

  **Step 1: Indirizzo**
  - Input: "Via Roma 15, Milano"
  - **Verifica**: Bot risponde con opzioni tipo immobile

  **Step 2: Tipo Immobile**
  - Clicca: "Appartamento"
  - **Verifica**: Bot chiede metri quadri

  **Step 3: Superficie**
  - Input: "85"
  - **Verifica**: Bot chiede piano (per appartamento)

  **Step 4: Piano**
  - Input: "3"
  - **Verifica**: Bot chiede se c'è ascensore

  **Step 5: Ascensore**
  - Clicca: "Sì"
  - **Verifica**: Bot chiede stato immobile

  **Step 6: Stato**
  - Clicca: "Buono"
  - **Verifica**: Loading "Sto calcolando..." appare
  - **Verifica**: Valutazione appare con range prezzi

  **Step 7: Contatti - Nome**
  - Input: "Mario Rossi"
  - **Verifica**: Bot chiede email

  **Step 8: Email**
  - Input: "mario.rossi@example.com"
  - **Verifica**: Bot chiede telefono

  **Step 9: Telefono (opzionale)**
  - Input: "+39 333 1234567" oppure "no"
  - **Verifica**: Loading "Sto salvando..." appare
  - **Verifica**: Messaggio successo appare
  - **Verifica**: Widget si chiude dopo 3 secondi

#### 5. Verifica Lead in Dashboard
- [ ] Torna su `http://localhost:3000/dashboard/leads`
- [ ] **Verifica**: Lead "Mario Rossi" presente
- [ ] **Verifica**: Email corretta
- [ ] **Verifica**: Telefono corretto (se fornito)
- [ ] **Verifica**: Indirizzo corretto
- [ ] Clicca su "Dettagli"
- [ ] **Verifica**: Dati valutazione presenti (prezzo, superficie, ecc.)
- [ ] **Verifica**: Conversazione completa salvata

---

## ✅ FLUSSO B: Widget Multiplo

### Obiettivo
Verificare che ogni agenzia veda solo i propri lead.

### Steps

#### 1. Registra Seconda Agenzia
- [ ] Logout dalla prima agenzia
- [ ] Vai su `/register`
- [ ] Registra "Agenzia Test 2" con email `test2@example.com`
- [ ] Salva Widget ID della seconda agenzia

#### 2. Usa Entrambi i Widget
- [ ] Crea `test-widget-2.html` con Widget ID della seconda agenzia
- [ ] Compila widget prima agenzia → Lead "Giovanni Bianchi"
- [ ] Compila widget seconda agenzia → Lead "Laura Verdi"

#### 3. Verifica Separazione Dati
- [ ] Login come `test1@example.com`
- [ ] Vai su `/dashboard/leads`
- [ ] **Verifica**: Solo "Mario Rossi" e "Giovanni Bianchi" visibili
- [ ] **Verifica**: "Laura Verdi" NON visibile

- [ ] Logout e login come `test2@example.com`
- [ ] Vai su `/dashboard/leads`
- [ ] **Verifica**: Solo "Laura Verdi" visibile
- [ ] **Verifica**: "Mario Rossi" e "Giovanni Bianchi" NON visibili

---

## ✅ FLUSSO C: Validazioni

### Obiettivo
Verificare che tutti gli errori siano gestiti correttamente.

### Test 1: Registrazione con Email Duplicata
- [ ] Vai su `/register`
- [ ] Usa email già esistente: `test1@example.com`
- [ ] **Verifica**: Errore "Email già registrata"

### Test 2: Login con Password Errata
- [ ] Vai su `/login`
- [ ] Email: `test1@example.com`
- [ ] Password: `passwordsbagliata`
- [ ] **Verifica**: Errore "Email o password errati"

### Test 3: Widget Senza Email
- [ ] Apri widget, completa fino a step "Nome"
- [ ] Input nome: "Test User"
- [ ] Input email: `emailsenzachiocciola` (senza @)
- [ ] **Verifica**: Bot dice "L'email non sembra valida. Puoi inserirla di nuovo?"

### Test 4: Superficie Non Numerica
- [ ] Apri widget, completa fino a step "Superficie"
- [ ] Input: "molto grande" (testo invece di numero)
- [ ] **Verifica**: Bot dice "Per favore inserisci un numero valido tra 20 e 1000 m²"

### Test 5: Superficie Fuori Range
- [ ] Input: "5" (troppo piccolo)
- [ ] **Verifica**: Errore validazione
- [ ] Input: "5000" (troppo grande)
- [ ] **Verifica**: Errore validazione
- [ ] Input: "85" (valido)
- [ ] **Verifica**: Procede allo step successivo

### Test 6: Piano Fuori Range
- [ ] Input piano: "50"
- [ ] **Verifica**: Bot dice "Per favore inserisci un numero valido tra 0 e 30"

---

## ✅ FLUSSO D: Edge Cases

### Obiettivo
Verificare comportamento con dati anomali.

### Test 1: Città Non in Database OMI
- [ ] Apri widget
- [ ] Input indirizzo: "Via Test 1, PaeseInesistente"
- [ ] Completa tutto il flusso
- [ ] **Verifica**: Valutazione usa "Media Nazionale" come source
- [ ] **Verifica**: Lead salvato correttamente

### Test 2: N8N Down (Fallback Locale)
- [ ] Assicurati che `N8N_WEBHOOK_URL` non sia configurato o non risponda
- [ ] Completa un flusso widget
- [ ] **Verifica**: Valutazione completata comunque (calcolo locale)
- [ ] **Verifica**: Console log: "N8N_WEBHOOK_URL not configured, using local calculation"

### Test 3: Conversazione Molto Lunga
- [ ] Apri widget
- [ ] Invece di seguire il flusso, scrivi messaggi casuali 20 volte
- [ ] Poi completa normalmente
- [ ] **Verifica**: Widget gestisce >50 messaggi senza crash
- [ ] **Verifica**: Conversazione salvata completamente

### Test 4: Indirizzo Non Geocodabile
- [ ] Se `GOOGLE_MAPS_API_KEY` configurato:
  - Input indirizzo: "asdfghjkl qwerty"
  - **Verifica**: Geocoding fallisce silenziosamente
  - **Verifica**: Valutazione procede senza coordinate
- [ ] Se `GOOGLE_MAPS_API_KEY` non configurato:
  - **Verifica**: Warning in console
  - **Verifica**: Valutazione procede normalmente

### Test 5: Rate Limiting
- [ ] Completa 100 richieste dallo stesso IP
- [ ] **Verifica**: 101esima richiesta → Errore 429
- [ ] **Verifica**: Widget mostra: "Limite di richieste giornaliere raggiunto"

---

## 📱 Test Mobile

### Obiettivo
Verificare esperienza mobile ottimale.

### Steps
- [ ] Apri DevTools → Toggle Device Toolbar
- [ ] Imposta dispositivo: iPhone SE (375px width)

#### Test Widget Mobile
- [ ] Widget si apre fullscreen
- [ ] **Verifica**: Nessun scroll orizzontale
- [ ] **Verifica**: Bottoni min 44x44px (touch-friendly)
- [ ] **Verifica**: Input altezza 44px
- [ ] **Verifica**: Testo leggibile (min 14px)

#### Test Dashboard Mobile
- [ ] Vai su `/dashboard/leads`
- [ ] **Verifica**: Tabella diventa card list
- [ ] **Verifica**: Sidebar diventa hamburger menu
- [ ] Clicca hamburger menu
- [ ] **Verifica**: Menu si apre con overlay
- [ ] **Verifica**: Click overlay chiude menu

---

## 🔒 Test Sicurezza

### Test 1: Accesso Dashboard Senza Login
- [ ] Logout
- [ ] Vai direttamente su `/dashboard`
- [ ] **Verifica**: Redirect a `/login`

### Test 2: XSS Prevention
- [ ] Nel widget, input nome: `<script>alert('XSS')</script>`
- [ ] **Verifica**: Script NON eseguito
- [ ] **Verifica**: Lead salvato con testo sanitizzato

### Test 3: SQL Injection Prevention
- [ ] Login email: `admin' OR '1'='1`
- [ ] **Verifica**: Login fallisce (Prisma previene injection)

---

## ⚡ Test Performance

### Obiettivo
Verificare caricamento veloce e caching.

### Test Cache Valutazioni
- [ ] Completa valutazione: Milano, Appartamento, 85mq, Piano 3, Ascensore Sì, Buono
- [ ] Nota il tempo di risposta
- [ ] Completa STESSA valutazione di nuovo
- [ ] **Verifica**: Console log "Returning cached valuation"
- [ ] **Verifica**: Risposta istantanea (< 50ms)

### Test Lazy Loading Widget
- [ ] Apri homepage
- [ ] Apri DevTools → Network tab
- [ ] **Verifica**: `chat-widget.tsx` NON caricato
- [ ] Clicca bottone widget
- [ ] **Verifica**: Spinner "Caricamento..." appare brevemente
- [ ] **Verifica**: `chat-widget.tsx` caricato ora

---

## 📊 Checklist Finale

Prima di considerare i test completati, verifica:

- [ ] Tutti i flussi A, B, C, D completati con successo
- [ ] Tutti i test mobile passati
- [ ] Tutti i test sicurezza passati
- [ ] Test performance positivi
- [ ] Zero errori in console (eccetto warnings attesi)
- [ ] Database contiene lead di test corretti
- [ ] Build production compila: `npm run build`

---

## 🐛 Problemi Comuni

### Widget Non Appare
- Verifica Widget ID corretto
- Verifica server in esecuzione su porta 3000
- Controlla console per errori

### Valutazione Fallisce
- Verifica DATABASE_URL configurato
- Verifica tabelle database create
- Controlla log console per dettagli errore

### Lead Non Appare in Dashboard
- Verifica Widget ID corretto
- Verifica agenzia attiva (attiva: true)
- Controlla separazione dati (widget ID diverso?)

---

## 📝 Report Bug

Se trovi un bug durante i test, documenta:
1. **Flusso**: Quale test (A/B/C/D)?
2. **Step**: A quale punto è fallito?
3. **Comportamento atteso**: Cosa doveva succedere?
4. **Comportamento reale**: Cosa è successo?
5. **Console errors**: Copia errori dalla console
6. **Screenshot**: Se applicabile

Crea issue su GitHub con questi dettagli.
