# 🐛 Analisi Bug: Numero di Telefono Non Salvato nel Database

**Data**: 2025-12-13
**Ambiente**: Produzione (https://domusreport.mainstream.agency/)
**Database**: Neon PostgreSQL

---

## 📋 Sintesi del Problema

Il numero di telefono inserito dall'utente nel chatbot widget **non viene salvato nel database**, anche se l'utente completa correttamente il flusso.

---

## 🔍 Analisi del Flusso

### 1. Frontend - Raccolta Dati (chat-widget.tsx)

**Step `contacts_phone` (righe 583-595)**:
```typescript
case "contacts_phone":
  const phoneRegex = /^(\+39|0039)?[0-9]{9,13}$/
  const sanitizedPhone = input.replace(/\s/g, "")

  if (!phoneRegex.test(sanitizedPhone)) {
    addBotMessage("Il numero di telefono non sembra valido...")
    return
  }

  setCollectedData(prev => ({ ...prev, phone: sanitizedPhone }))
  calculateValuation()  // → Poi chiama completeConversation()
  break
```

✅ **FUNZIONA**: Il numero viene salvato in `collectedData.phone`

---

### 2. Frontend - Invio al Server (chat-widget.tsx:792-841)

**Preparazione payload (righe 792-840)**:
```typescript
const payload = {
  firstName: collectedData.firstName,
  lastName: collectedData.lastName,
  email: collectedData.email,
  phone: collectedData.phone,  // ✅ Viene incluso
  // ... altri campi
}

console.log('[ChatWidget] Phone data before sending:', {
  phone: collectedData.phone,
  phoneType: typeof collectedData.phone,
})

const response = await fetch(endpoint, {
  method: "POST",
  body: JSON.stringify(payload),
})
```

✅ **FUNZIONA**: Il numero viene inviato al server (con logging dettagliato)

---

### 3. Backend - Validazione (app/api/leads/route.ts)

**Logging dettagliato phone (righe 83-92)**:
```typescript
console.log('[POST /api/leads] 🔍 PHONE DEBUG - Received request:', {
  phone: body.phone,
  phoneType: typeof body.phone,
  phoneLength: body.phone?.length,
  hasPhone: !!body.phone,
})
```

**Chiamata validazione (riga 127)**:
```typescript
const phoneValidation = validatePhone(body.phone)
```

**Logging validazione (righe 129-137)**:
```typescript
console.log('[POST /api/leads] 📞 PHONE VALIDATION RESULT:', {
  input: body.phone,
  sanitized: phoneValidation.sanitized,
  valid: phoneValidation.valid,
  willSaveAsNull: phoneValidation.sanitized === null,
})
```

**Check fallimento validazione (righe 139-145)**:
```typescript
if (!phoneValidation.valid) {
  console.log('[POST /api/leads] ❌ PHONE VALIDATION FAILED - Rejecting request')
  return NextResponse.json({ error: phoneValidation.error }, { status: 400 })
}
```

❓ **POSSIBILE PROBLEMA**: Se la validazione fallisce, la richiesta viene rifiutata con 400

---

### 4. Backend - Funzione validatePhone (lib/validation.ts)

**Problema identificato alla riga 110**:
```typescript
if (!isValid) {
  console.log('[validatePhone] ❌ VALIDATION FAILED')
  // 🐛 BUG: Ritorna sanitized: null invece di sanitized
  return {
    valid: false,
    sanitized: null,  // ← PROBLEMA!
    error: "Formato telefono non valido..."
  }
}
```

**Regex usata (riga 102)**:
```typescript
const phoneRegex = /^(\+39|0039)?[0-9]{9,13}$/
```

---

## 🎯 Bug Identificati

### Bug #1: Perdita dati in caso di validazione fallita ❌ CRITICO

**File**: `lib/validation.ts` (riga 110)
**Problema**: Se il numero non passa la validazione, viene ritornato `sanitized: null` invece del valore sanitizzato.

**Impatto**:
- Perdita del dato per logging/debugging
- Impossibilità di capire cosa ha inserito l'utente
- Nessun dato per recovery manuale

**Fix**:
```typescript
// PRIMA (SBAGLIATO)
return { valid: false, sanitized: null, error: "..." }

// DOPO (CORRETTO)
return { valid: false, sanitized, error: "..." }
```

---

### Bug #2 (Possibile): Divergenza validazione client/server

**Client** (chat-widget.tsx:584-585):
```typescript
const phoneRegex = /^(\+39|0039)?[0-9]{9,13}$/
const sanitizedPhone = input.replace(/\s/g, "")
if (!phoneRegex.test(sanitizedPhone)) { ... }
```

**Server** (validation.ts:73-82):
```typescript
let sanitized = phoneStr
  .trim()
  .replace(/\s/g, "")       // Remove spaces
  .replace(/-/g, "")        // Remove dashes
  .replace(/\./g, "")       // Remove dots
  .replace(/\(/g, "")       // Remove parentheses
  .replace(/\)/g, "")       // Remove parentheses
  .replace(/[^\d+]/g, "")   // Remove any other non-digit, non-plus
```

**Problema**: Il server rimuove più caratteri del client. Se l'utente inserisce caratteri speciali che il client non rimuove ma il server sì, potrebbe causare discrepanze.

---

## 🧪 Scenari di Test

### Scenario 1: Numero valido standard
- **Input**: `3331234567`
- **Atteso**: ✅ Salvato
- **Reale**: ✅ Dovrebbe funzionare

### Scenario 2: Numero con spazi
- **Input**: `333 123 4567`
- **Client**: Rimuove spazi → `3331234567` ✅
- **Server**: Rimuove spazi → `3331234567` ✅
- **Atteso**: ✅ Salvato
- **Reale**: ✅ Dovrebbe funzionare

### Scenario 3: Numero con +39
- **Input**: `+39 333 123 4567`
- **Client**: Rimuove spazi → `+393331234567` ✅
- **Server**: Rimuove spazi → `+393331234567` ✅
- **Atteso**: ✅ Salvato
- **Reale**: ✅ Dovrebbe funzionare

### Scenario 4: Numero troppo corto
- **Input**: `12345`
- **Client**: ❌ Validazione fallisce → Non invia
- **Server**: Non riceve richiesta
- **Atteso**: ❌ Non salvato (corretto)

### Scenario 5: Numero con caratteri speciali
- **Input**: `333-123-4567`
- **Client**: NON rimuove trattini! → `333-123-4567` ❌ FALLISCE REGEX
- **Server**: Non riceve richiesta
- **Atteso**: ❌ Non salvato
- **Reale**: 🐛 **POSSIBILE BUG!**

---

## 🎯 Root Cause Analysis

### Causa Principale: Discrepanza Client-Server

Il **client** rimuove SOLO gli spazi:
```typescript
const sanitizedPhone = input.replace(/\s/g, "")
```

Il **server** rimuove spazi, trattini, punti, parentesi, ecc:
```typescript
.replace(/\s/g, "")
.replace(/-/g, "")
.replace(/\./g, "")
// ... etc
```

**Risultato**: Se un utente inserisce `333-123-4567`, il client fallisce la validazione perché non rimuove i trattini prima del test regex.

---

## ✅ Soluzioni Proposte

### Fix #1: Allineare Sanitizzazione Client-Server (PRIORITÀ ALTA)

**File**: `components/widget/chat-widget.tsx` (riga 584-585)

```typescript
// PRIMA (SBAGLIATO)
const phoneRegex = /^(\+39|0039)?[0-9]{9,13}$/
const sanitizedPhone = input.replace(/\s/g, "")

// DOPO (CORRETTO)
const phoneRegex = /^(\+39|0039)?[0-9]{9,13}$/
const sanitizedPhone = input
  .trim()
  .replace(/\s/g, "")       // Remove spaces
  .replace(/-/g, "")        // Remove dashes
  .replace(/\./g, "")       // Remove dots
  .replace(/\(/g, "")       // Remove parentheses
  .replace(/\)/g, "")       // Remove parentheses
  .replace(/[^\d+]/g, "")   // Remove any other non-digit, non-plus
```

**Beneficio**: La stessa logica di sanitizzazione del server, garantisce validazione coerente.

---

### Fix #2: Preservare Valore Sanitizzato (PRIORITÀ ALTA)

**File**: `lib/validation.ts` (riga 110)

```typescript
// PRIMA
return { valid: false, sanitized: null, error: "..." }

// DOPO
return { valid: false, sanitized, error: "..." }
```

**Beneficio**: Anche se la validazione fallisce, il valore sanitizzato viene preservato per logging.

---

### Fix #3: Migliorare Logging Database (PRIORITÀ MEDIA)

**File**: `app/api/leads/route.ts` (dopo riga 372)

Aggiungere verifica post-salvataggio:

```typescript
const lead = await prisma.lead.create({ ... })

// Verifica che il telefono sia stato salvato
if (body.phone && phoneValidation.sanitized && !lead.telefono) {
  console.error('[POST /api/leads] 🚨 CRITICAL: Phone NOT saved to database!', {
    inputPhone: body.phone,
    validatedPhone: phoneValidation.sanitized,
    savedPhone: lead.telefono
  })

  // Opzionale: Invia alert
}
```

---

## 📊 Verifica in Produzione

Per verificare il problema reale su Vercel, controlla:

1. **Logs di Vercel** → Cerca `[POST /api/leads] 🔍 PHONE DEBUG`
2. **Logs di Vercel** → Cerca `[validatePhone]` per vedere i dettagli validazione
3. **Database Neon** → Query per verificare quanti lead hanno `telefono` NULL

```sql
-- Verifica lead senza telefono
SELECT COUNT(*) FROM leads WHERE telefono IS NULL;

-- Verifica lead recenti con/senza telefono
SELECT id, nome, email, telefono, "data_richiesta"
FROM leads
ORDER BY "data_richiesta" DESC
LIMIT 20;
```

---

## 🚀 Prossimi Passi

1. ✅ Applicare Fix #1 (allineare sanitizzazione)
2. ✅ Applicare Fix #2 (preservare valore)
3. 🔄 Testare in locale con vari formati telefono
4. 🔄 Deploy su Vercel
5. 🔄 Verificare nei log che il telefono viene salvato
6. 🔄 Verificare nel database Neon che i nuovi lead hanno il telefono
