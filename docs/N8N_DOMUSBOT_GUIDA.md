# DomusBot - Workflow n8n per Valutazioni Immobiliari

Workflow n8n per chatbot conversazionale di valutazioni immobiliari, **allineato al 100%** con la webapp DomusReport esistente.

## File

- **`n8n-domusbot-complete.json`** - Workflow pronto per import in n8n

## Requisiti

- n8n v1.20+ (con supporto AI Agent)
- Credenziali Google Gemini API
- La webapp DomusReport già funzionante

## Installazione Rapida

### 1. Import Workflow

1. Apri n8n > **Workflows** > **Import from File**
2. Seleziona `n8n-domusbot-complete.json`
3. Clicca **Import**

### 2. Configura Credenziali

1. Vai su **Credentials** > **Add Credential** > **Google Gemini API**
2. Inserisci la tua API Key da [Google AI Studio](https://aistudio.google.com/)
3. Nel workflow, collega le credenziali al nodo **Google Gemini**

### 3. Attiva e Testa

1. Attiva il workflow (toggle ON)
2. Copia l'URL del webhook: `https://your-n8n.com/webhook/domusbot`
3. Configura `N8N_WEBHOOK_URL` nella webapp (file `.env`)

## Architettura

```
                    ┌─────────────────┐
                    │ CORS Preflight  │──► CORS Response (204)
                    └─────────────────┘

┌─────────┐    ┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ Webhook │───►│ Has Message? │───►│ DomusBot Agent  │───►│ Format Response │───►│ Respond Webhook  │
└─────────┘    └──────────────┘    │                 │    └─────────────────┘    └──────────────────┘
                     │             │  ┌───────────┐  │
                     │             │  │  Gemini   │  │
                     ▼             │  └───────────┘  │
            ┌────────────────┐     │  ┌───────────┐  │
            │ Handle No Msg  │     │  │  Memory   │  │
            └────────────────┘     │  └───────────┘  │
                     │             └─────────────────┘
                     ▼
            ┌────────────────┐
            │ Respond No Msg │
            └────────────────┘
```

## API

### POST `/webhook/domusbot`

**Request:**
```json
{
  "message": "Ciao",
  "sessionId": "widget-abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ciao! Ti aiuto a scoprire quanto vale la tua casa. Dove si trova?",
  "sessionId": "widget-abc123",
  "timestamp": "2024-12-17T10:30:00.000Z",
  "hasValuation": false,
  "valuation": null
}
```

**Response con valutazione:**
```json
{
  "success": true,
  "message": "Ecco la valutazione!\n\nRange: €350.000 - €420.000\n\nStima: €385.000\n\nValutazione basata su dati OMI per Milano...",
  "sessionId": "widget-abc123",
  "timestamp": "2024-12-17T10:35:00.000Z",
  "hasValuation": true,
  "valuation": {
    "minPrice": 350000,
    "maxPrice": 420000,
    "estimatedPrice": 385000
  }
}
```

### OPTIONS `/webhook/domusbot`

Preflight CORS. Response: HTTP 204

## Flusso Conversazione

### Fase 1: Dati Immobile (17 domande)

| # | Campo | Tipo | Opzioni |
|---|-------|------|---------|
| 1 | Città | testo | - |
| 2 | Quartiere/zona | testo | + via opzionale |
| 3 | Tipo immobile | enum | Appartamento, Attico, Villa, Ufficio, Negozio, Box, Terreno, Altro |
| 4 | Metri quadri | numero | 10-10000 |
| 5 | Camere letto | numero | 1, 2, 3, 4+ (solo residenziale) |
| 6 | Camere totali | numero | (solo residenziale) |
| 7 | Bagni | numero | 1, 2, 3+ |
| 8 | Piano + Ascensore | enum | Terra, 1-2 senza/con, 3+ senza/con, Ultimo senza/con |
| 9 | Spazi esterni | enum | Nessuno, Balcone, Terrazzo, Giardino |
| 10 | Box/posto auto | boolean | Sì/No |
| 11 | Stato | enum | Nuovo, Ristrutturato, Buono, Da ristrutturare |
| 12 | Riscaldamento | enum | Autonomo, Centralizzato, Assente |
| 13 | Aria condizionata | boolean | Sì/No |
| 14 | Classe energetica | enum | A-G, Non disponibile, Non so |
| 15 | Anno costruzione | numero/testo | Anno o "non so" |
| 16 | Occupazione | enum | Libero, Occupato |
| 17 | Scadenza contratto | testo | Solo se occupato |

### Fase 2: Dati Contatto (4 domande)

| # | Campo | Validazione |
|---|-------|-------------|
| 18 | Nome | min 2 char |
| 19 | Cognome | min 2 char |
| 20 | Email | contiene @ |
| 21 | Telefono | formato italiano |

## Algoritmo Valutazione

### Database OMI (€/mq)

Valori allineati con `lib/omi.ts`:

| Città | Appartamento | Attico | Villa | Ufficio | Negozio | Box |
|-------|--------------|--------|-------|---------|---------|-----|
| Milano | 4800 | 6000 | 5500 | 4200 | 3800 | 2000 |
| Roma | 3800 | 4800 | 4500 | 3500 | 3200 | 1800 |
| Firenze | 3900 | 5000 | 4800 | 3400 | 3000 | 1700 |
| Venezia | 4200 | 5500 | 5000 | 3600 | 3300 | 1900 |
| Bologna | 3200 | 4200 | 3800 | 2900 | 2600 | 1500 |
| Torino | 2400 | 3200 | 3200 | 2200 | 2000 | 1200 |
| Napoli | 2800 | 3600 | 3500 | 2500 | 2200 | 1300 |
| Genova | 2600 | 3400 | 3400 | 2400 | 2100 | 1200 |
| Altre | 2000 | 2700 | 2800 | 1800 | 1600 | 1000 |

### Coefficienti (da `lib/n8n.ts`)

**Piano:**
| FloorType | Coefficiente |
|-----------|--------------|
| Terra (no ascensore) | 0.92 |
| 1-2 senza ascensore | 0.97 |
| 1-2 con ascensore | 1.00 |
| 3 senza ascensore | 0.98 |
| 3 con ascensore | 1.06 |
| 4+ senza ascensore | 1.00 |
| 4+ con ascensore | 1.08 |
| Ultimo senza ascensore | 1.00 |
| Ultimo con ascensore | 1.08 |

**Stato:**
| Condizione | Coefficiente |
|------------|--------------|
| Nuovo | 1.25 |
| Ristrutturato | 1.12 |
| Buono | 1.00 |
| Da ristrutturare | 0.82 |

### Formula

```
stimato = OMI_base × mq × coeff_piano × coeff_stato
minimo = stimato × 0.93
massimo = stimato × 1.07
```

## Integrazione con Webapp

Il workflow n8n è progettato per essere chiamato dal file `lib/n8n.ts` della webapp.

**Variabile ambiente richiesta:**
```env
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/domusbot
```

**Comportamento:**
- Se `N8N_WEBHOOK_URL` è configurato → chiama n8n
- Se non configurato o errore → usa calcolo locale (fallback)

## Tipi TypeScript Allineati

Il workflow usa gli stessi enum della webapp (`types/index.ts`):

```typescript
// PropertyType
Appartamento | Attico | Villa | Ufficio | Negozio | Box | Terreno | Altro

// PropertyCondition
Nuovo | Ristrutturato | Buono | Da ristrutturare

// FloorType
Terra (senza ascensore) | 1-2 senza ascensore | 1-2 con ascensore |
3+ senza ascensore | 3+ con ascensore |
Ultimo piano (senza ascensore) | Ultimo piano (con ascensore)

// OutdoorSpace
Nessuno | Balcone | Terrazzo | Giardino

// HeatingType
Autonomo | Centralizzato | Assente

// EnergyClass
A | B | C | D | E | F | G | Non disponibile | Non so

// OccupancyStatus
Libero | Occupato
```

## Personalizzazione

### Modificare System Prompt

1. Apri workflow in n8n
2. Click su **DomusBot Agent**
3. Modifica **System Message** nelle Options
4. Salva

### Aggiungere Città al Database OMI

Modifica il system prompt nella sezione "DATABASE OMI" aggiungendo:
```
NomeCittà: [valore_appartamento] | ...
```

### Modificare Coefficienti

Modifica la sezione "COEFFICIENTI DI CALCOLO" nel system prompt.

## Troubleshooting

### Bot non risponde
1. Verifica workflow attivo
2. Controlla credenziali Gemini
3. Guarda i log di esecuzione in n8n

### Errori CORS
1. Verifica nodo **CORS Preflight** configurato
2. Controlla headers nella risposta

### Memory non funziona
1. Verifica `sessionId` passato nelle richieste
2. Controlla nodo **Chat Memory** collegato

### Valutazioni diverse da webapp
1. Verifica che i coefficienti nel prompt siano allineati con `lib/n8n.ts`
2. Verifica che i valori OMI siano allineati con `lib/omi.ts`

## Note Tecniche

- **Temperature**: 0.6 (bilanciata tra creatività e coerenza)
- **Max Iterations**: 40 (supporta conversazioni lunghe)
- **Context Window**: 30 messaggi
- **Timeout**: 30 secondi

---

*Versione 2.0.0 - Dicembre 2024*
