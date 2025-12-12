# ✅ BUG RISOLTO: Lead Widget Non Salvato nel Database

## 📋 Riepilogo

**Bug**: I lead completati tramite widget non venivano salvati nel database.

**Causa**: Il flusso di salvataggio era interrotto. La funzione `saveLeadWithEmail()` salvava parzialmente i dati quando l'utente inseriva l'email, ma poi chiamava `showCompletionMessage()` che NON effettuava alcun salvataggio finale. La funzione `completeConversation()` (che aveva la logica completa di salvataggio con gestione errori) non veniva mai chiamata.

## 🔧 Correzioni Implementate

### 1. **Correzione Flusso Widget** ([chat-widget.tsx:315-335](components/widget/chat-widget.tsx#L315-L335))

**Prima** (SBAGLIATO):
```typescript
case "contacts":
  if (input.includes("@")) {
    // Validazione email
    setCollectedData(prev => ({ ...prev, email: input }))

    // ❌ Salvava subito (problematico se poi fallisce)
    saveLeadWithEmail(input)

    addBotMessage("Vuoi lasciare anche un numero di telefono?")
  } else {
    if (input.toLowerCase() !== "no") {
      setCollectedData(prev => ({ ...prev, phone: input }))
      // ❌ Tentava update parziale
      updateLeadWithPhone(input)
    }
    // ❌ Mostrava solo messaggio, NESSUN salvataggio!
    showCompletionMessage()
  }
  break
```

**Dopo** (CORRETTO):
```typescript
case "contacts":
  if (input.includes("@")) {
    // Validazione email
    setCollectedData(prev => ({ ...prev, email: input }))

    addBotMessage("Vuoi lasciare anche un numero di telefono? (Opzionale - scrivi 'no' per saltare)")
  } else {
    // Raccoglie telefono se fornito
    if (input.toLowerCase() !== "no") {
      setCollectedData(prev => ({ ...prev, phone: input }))
    }
    // ✅ SALVA il lead con TUTTI i dati raccolti e gestione errori completa
    completeConversation()
  }
  break
```

### 2. **Rimozione Funzioni Obsolete**

Eliminate 3 funzioni non più necessarie:
- ❌ `saveLeadWithEmail()` - Salvava parzialmente senza gestione errori
- ❌ `updateLeadWithPhone()` - Tentava aggiornamento parziale
- ❌ `showCompletionMessage()` - Mostrava messaggio senza salvare

### 3. **Logging Dettagliato API** ([app/api/leads/route.ts](app/api/leads/route.ts))

Aggiunto logging completo per debugging:

```typescript
// All'inizio della richiesta
console.log('[POST /api/leads] Received request:', {
  widgetId: body.widgetId,
  email: body.email,
  hasPhone: !!body.phone,
  timestamp: new Date().toISOString()
})

// Prima di creare il lead
console.log('[POST /api/leads] Creating lead for agency:', {
  agencyId: agency.id,
  agencyName: agency.nome
})

// Dopo successo
console.log('[POST /api/leads] Lead created successfully:', {
  leadId: lead.id,
  agencyId: agency.id,
  email: body.email,
  timestamp: new Date().toISOString()
})

// In caso di errore
console.error('[POST /api/leads] Error creating lead:', {
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString()
})
```

### 4. **Rate Limiting Development-Friendly** ([app/api/leads/route.ts:51-55](app/api/leads/route.ts#L51-L55))

```typescript
const rateLimitResult = checkRateLimit(
  clientIP,
  process.env.NODE_ENV === 'production' ? 100 : 10000, // 10k in dev, 100 in prod
  24 * 60 * 60 * 1000
)
```

### 5. **Validazioni**

Verificato che la validazione del telefono sia opzionale ([lib/validation.ts:58-74](lib/validation.ts#L58-L74)):
```typescript
export function validatePhone(phone: string) {
  const sanitized = sanitizeString(phone).replace(/\s/g, "")

  if (!sanitized) {
    return { valid: true, sanitized: "" } // ✅ Telefono opzionale
  }

  // Validazione solo se fornito
  const phoneRegex = /^(\+39|0039)?[0-9]{9,13}$/
  if (!phoneRegex.test(sanitized)) {
    return { valid: false, sanitized, error: "Formato telefono non valido" }
  }

  return { valid: true, sanitized }
}
```

## ✅ Flusso Corretto Finale

1. **Utente completa conversazione** (indirizzo, tipo, superficie, piano, ascensore, condizioni)
2. **Riceve valutazione** con stima prezzi
3. **Inserisce nome completo**
4. **Inserisce email** → validazione frontend
5. **Widget chiede telefono** (opzionale)
6. **Utente inserisce telefono o "no"**
7. **`completeConversation()` viene chiamata** →
   - Mostra "Sto salvando i tuoi dati... ⏳"
   - Crea payload completo con tutti i dati
   - POST `/api/leads` con timeout 10s
   - Gestisce errori (400, 429, 500) con messaggi appropriati
   - In caso di successo: salva `leadId`, traccia evento, mostra messaggio finale
   - In caso di errore: mostra messaggio comunque (fallback graceful)

## 🧪 Come Testare

### Test End-to-End

1. Apri il widget su una pagina di test
2. Completa il flusso:
   - Indirizzo: "Via Roma 15, Milano"
   - Tipo: Appartamento
   - Superficie: 80 mq
   - Piano: 3
   - Ascensore: Sì
   - Condizioni: Buono
3. Ricevi valutazione
4. Inserisci:
   - Nome: "Mario Rossi"
   - Email: "mario.rossi@example.com"
   - Telefono: "+39 333 1234567" (o "no")
5. **Verifica**:
   - ✅ Messaggio "Sto salvando..." appare
   - ✅ Messaggio successo "Grazie Mario! 🎉" appare
   - ✅ Widget si chiude dopo 3 secondi

### Test Database

```bash
# Apri Prisma Studio
npx prisma studio

# Verifica tabelle:
# - leads: nuovo record "Mario Rossi"
# - properties: property collegata al lead
# - valuations: valutazione collegata alla property
# - conversations: messaggi della conversazione
```

### Test Console Logs

Apri DevTools → Console e verifica i log:

```
[POST /api/leads] Received request: { widgetId: "...", email: "mario.rossi@example.com", ... }
[POST /api/leads] Creating lead for agency: { agencyId: "...", agencyName: "..." }
[POST /api/leads] Lead created successfully: { leadId: "...", ... }
```

### Test Errori

**Email invalida:**
```
Input: "mario.rossi@"
Atteso: "L'email non sembra valida. Puoi inserirla di nuovo?"
```

**Widget ID invalido:**
```
Response: 404 "Widget non valido"
Console: Widget non trovato in WidgetConfig né Agency
```

**Rate limit (in produzione):**
```
Dopo 100 richieste nello stesso giorno:
Response: 429 "Limite di richieste giornaliere raggiunto"
```

## 📊 Impatto

- ✅ Lead salvati correttamente nel database
- ✅ Dashboard `/dashboard/leads` mostra i nuovi lead
- ✅ Tutti i dati (property, valuation, conversation) vengono creati in transazione atomica
- ✅ Gestione errori migliorata con messaggi utente appropriati
- ✅ Logging dettagliato per debugging futuro
- ✅ Rate limiting development-friendly (10k req/day in dev vs 100 in prod)
- ✅ Telefono opzionale funzionante

## 🔍 File Modificati

1. **components/widget/chat-widget.tsx**
   - Corretto flusso step "contacts" (linea 315-335)
   - Rimossa `saveLeadWithEmail()` (obsoleta)
   - Rimossa `updateLeadWithPhone()` (obsoleta)
   - Rimossa `showCompletionMessage()` (obsoleta)
   - Rimossi import inutilizzati (`Label`, `Card`)

2. **app/api/leads/route.ts**
   - Aggiunto logging dettagliato (linee 71-76, 233, 286-291, 300-304)
   - Rate limiting environment-aware (linea 53)
   - Logging per rate limit (linea 58)
   - Logging per agency/widget non attivi (linee 217, 226)

3. **lib/validation.ts**
   - Nessuna modifica (già corretto: telefono opzionale)

## 🎯 Criteri di Accettazione

- [x] Lead salvato nel database quando utente completa conversazione
- [x] Email validata correttamente
- [x] Telefono opzionale (accetta "no" o numero valido)
- [x] Errori mostrati all'utente in modo chiaro
- [x] Lead appare in `/dashboard/leads`
- [x] Property, Valuation, Conversation creati in transazione
- [x] Logging dettagliato per debug
- [x] Rate limiting non blocca sviluppo locale
- [x] Messaggio successo mostrato dopo salvataggio
- [x] Widget si chiude automaticamente dopo 3 secondi (modalità bubble)

## 🚀 Deployment

```bash
# Verifica build
npm run build

# Test locale
npm run dev

# Deploy
git add .
git commit -m "fix: Risolto bug lead widget non salvato nel database

- Corretto flusso salvataggio in chat-widget.tsx
- Rimosso codice obsoleto (saveLeadWithEmail, updateLeadWithPhone, showCompletionMessage)
- Aggiunto logging dettagliato in /api/leads
- Rate limiting environment-aware (10k dev, 100 prod)
- Lead ora salvato correttamente con tutti i dati"

git push
```

## 📚 Riferimenti

- Bug Report: [BUG_FIX_WIDGET_MODE.md](BUG_FIX_WIDGET_MODE.md)
- API Leads: [app/api/leads/route.ts](app/api/leads/route.ts)
- Widget Component: [components/widget/chat-widget.tsx](components/widget/chat-widget.tsx)
- Validazioni: [lib/validation.ts](lib/validation.ts)
