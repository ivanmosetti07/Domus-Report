# 🔍 DIAGNOSTICA: Lead Non Salvato nel CRM

## 🚨 Problema Attuale

**SINTOMO**: Quando una persona completa la chat embedded, il lead NON appare nel CRM dell'agenzia nella dashboard `/dashboard/leads`.

## 📋 Checklist Diagnostica

### 1. **Verifica Widget ID**

Prima di tutto, assicurati che il widget embedded abbia un `widgetId` valido:

```bash
# Apri Prisma Studio
npx prisma studio

# Vai alla tabella "WidgetConfig" o "Agency"
# Trova il widgetId che stai usando
# Es: "ck123abc456..."
```

**Copia il `widgetId` e usalo nel passo successivo.**

---

### 2. **Test Widget in Browser**

1. **Avvia il server**:
   ```bash
   npm run dev
   ```

2. **Apri il widget** in un browser:
   ```
   http://localhost:3000/widget/[IL-TUO-WIDGET-ID]
   ```

   Sostituisci `[IL-TUO-WIDGET-ID]` con il widgetId della tua agenzia.

3. **Apri DevTools** (F12 o Cmd+Option+I su Mac)

4. **Vai alla tab Console**

---

### 3. **Completa il Flusso**

Compila la conversazione con dati di test:

1. **Indirizzo**: "Via Roma 15, Milano"
2. **Tipo**: Appartamento
3. **Superficie**: 80 mq
4. **Piano**: 3
5. **Ascensore**: Sì
6. **Condizioni**: Buono
7. **Ricevi valutazione**
8. **Nome**: "Test Mario"
9. **Email**: "test@example.com"
10. **Telefono**: "+39 333 1234567" (o "no")

---

### 4. **Controlla i Log nella Console**

Dopo aver completato il flusso, nella Console dovresti vedere:

#### **✅ Log CORRETTI** (se funziona):

```javascript
[ChatWidget] Sending lead to API: {
  endpoint: "/api/leads",
  widgetId: "ck123abc456...",
  hasPhone: true,
  email: "test@example.com",
  hasValuation: true,
  valuationData: {
    baseOMIValue: 3750,        // DEVE essere > 0
    floorCoefficient: 1.05,    // DEVE essere != 1.0
    conditionCoefficient: 1.0,
    estimatedPrice: 315000
  }
}

[ChatWidget] API Response: {
  status: 200,
  ok: true,
  statusText: "OK"
}
```

**Se vedi questi log con status 200 → il lead È STATO salvato!**

---

#### **❌ Log ERRORI** (se NON funziona):

**CASO 1: Widget ID non valido**
```javascript
[ChatWidget] API Response: {
  status: 404,
  ok: false,
  statusText: "Not Found"
}

[ChatWidget] API Error: {
  status: 404,
  errorData: { error: "Widget non valido" }
}
```

**SOLUZIONE**: Verifica che il `widgetId` sia corretto e che esista nel database.

---

**CASO 2: Agenzia non attiva**
```javascript
[ChatWidget] API Response: {
  status: 403,
  ok: false,
  statusText: "Forbidden"
}

[ChatWidget] API Error: {
  status: 403,
  errorData: { error: "Agenzia non attiva" }
}
```

**SOLUZIONE**: Vai in Prisma Studio → tabella `Agency` → trova l'agenzia e imposta `attiva: true`.

---

**CASO 3: Dati valutazione mancanti**
```javascript
[ChatWidget] Sending lead to API: {
  valuationData: {
    baseOMIValue: 0,     // ❌ ERRORE: dovrebbe essere > 0
    floorCoefficient: 1.0,
    conditionCoefficient: 1.0,
    estimatedPrice: 0    // ❌ ERRORE: dovrebbe essere > 0
  }
}
```

**SOLUZIONE**: La valutazione non è stata calcolata correttamente. Verifica che `/api/valuation` funzioni.

---

**CASO 4: Errore generico**
```javascript
[ChatWidget] CRITICAL ERROR saving lead: {
  error: "Network error" / "Failed to fetch" / altro,
  widgetId: "...",
  isDemo: false,
  hasEmail: true,
  hasValuation: true
}
```

**SOLUZIONE**: Verifica la connessione al database, i log del server, e che l'API `/api/leads` sia raggiungibile.

---

### 5. **Verifica Log Server**

Nella console dove hai eseguito `npm run dev`, cerca questi log:

#### **✅ Log CORRETTI**:

```
POST /api/leads 200 in 234ms

[POST /api/leads] Received request: { widgetId: "ck123...", email: "test@example.com", ... }
[POST /api/leads] Creating lead for agency: { agencyId: "cj789...", agencyName: "Agenzia Test" }
[POST /api/leads] Lead created successfully: { leadId: "cm456...", agencyId: "cj789...", ... }
```

**Se vedi questi log → il lead È STATO salvato nel database!**

---

#### **❌ Log ERRORI**:

**CASO 1: Widget non trovato**
```
POST /api/leads 404 in 45ms

[POST /api/leads] Received request: { widgetId: "wrong-id", ... }
(Nessun log "Creating lead" → widget non trovato)
```

**CASO 2: Errore database**
```
POST /api/leads 500 in 123ms

[POST /api/leads] Error creating lead: {
  error: "Prisma Client Error...",
  stack: "..."
}
```

**CASO 3: Validazione fallita**
```
POST /api/leads 400 in 12ms

(Nessun log → significa che la validazione è fallita prima di arrivare al database)
```

---

### 6. **Verifica Database**

**Metodo 1: Prisma Studio**

```bash
npx prisma studio
```

1. Apri tabella **`leads`**
2. Ordina per `dataRichiesta` (più recenti prima)
3. Cerca lead con email "test@example.com"
4. **Se il lead c'è**: il problema è nella dashboard
5. **Se il lead NON c'è**: il problema è nel salvataggio

---

**Metodo 2: Query SQL diretta**

```bash
# Connettiti al database
npx prisma db execute --stdin <<EOF
SELECT l.id, l.nome, l.cognome, l.email, l.dataRichiesta, p.indirizzo, v.prezzoStimato
FROM leads l
LEFT JOIN properties p ON p.leadId = l.id
LEFT JOIN valuations v ON v.propertyId = p.id
ORDER BY l.dataRichiesta DESC
LIMIT 5;
EOF
```

Verifica se il lead "Test Mario" appare nei risultati.

---

### 7. **Verifica Dashboard**

Se il lead È nel database ma NON appare nella dashboard:

1. **Apri**: `http://localhost:3000/dashboard/leads`
2. **Login** con le credenziali dell'agenzia
3. **Controlla** se il lead appare

**Se NON appare**:
- Verifica che l'`agenziaId` del lead corrisponda all'ID dell'agenzia loggata
- Controlla i filtri nella dashboard (potrebbero nascondere lead recenti)
- Verifica la query nella pagina dashboard/leads

---

## 🔧 Azioni Correttive Comuni

### **Problema: Widget ID non valido**

```sql
-- Trova tutti i widget disponibili
SELECT id, widgetId, agencyId, name, isActive
FROM WidgetConfig
WHERE isActive = true;

-- Oppure trova il widgetId diretto dall'agenzia (vecchio sistema)
SELECT id, widgetId, nome, attiva
FROM Agency
WHERE attiva = true;
```

Usa uno di questi `widgetId` nel widget embedded.

---

### **Problema: Agenzia non attiva**

```sql
-- Attiva l'agenzia
UPDATE Agency
SET attiva = true
WHERE id = '[ID-AGENZIA]';
```

---

### **Problema: Valutazione sempre 0€**

Verifica l'API di valutazione:

```bash
curl -X POST http://localhost:3000/api/valuation \
  -H "Content-Type: application/json" \
  -d '{
    "address": "Via Roma 15",
    "city": "Milano",
    "propertyType": "APARTMENT",
    "surfaceSqm": 80,
    "floor": 3,
    "hasElevator": true,
    "condition": "GOOD"
  }'
```

**Risposta attesa**:
```json
{
  "success": true,
  "valuation": {
    "minPrice": 293000,
    "maxPrice": 337000,
    "estimatedPrice": 315000,
    "baseOMIValue": 3750,
    "floorCoefficient": 1.05,
    "conditionCoefficient": 1.0,
    "explanation": "..."
  }
}
```

Se `baseOMIValue` è 0, il problema è nei dati OMI.

---

## 📊 Tabella Rapida Troubleshooting

| Sintomo | Log Console | Log Server | Database | Causa Probabile |
|---------|-------------|------------|----------|------------------|
| Nessun log console | Niente | Niente | Vuoto | JavaScript error nel widget |
| Status 404 | `status: 404` | `POST 404` | Vuoto | Widget ID non valido |
| Status 403 | `status: 403` | `POST 403` | Vuoto | Agenzia non attiva |
| Status 400 | `status: 400` | `POST 400` | Vuoto | Validazione fallita |
| Status 500 | `status: 500` | Error log | Vuoto | Errore database/server |
| Status 200 | `status: 200` | `Lead created` | **Lead presente** | ✅ Funziona! |
| Status 200 | `status: 200` | `Lead created` | **Lead NON presente** | Problema transazione DB |

---

## ✅ Test di Successo

Quando tutto funziona, dovresti vedere:

1. **Console Browser**:
   - `[ChatWidget] Sending lead to API` con dati completi
   - `[ChatWidget] API Response: { status: 200, ok: true }`
   - Messaggio "Grazie Test Mario! 🎉..."

2. **Log Server**:
   - `[POST /api/leads] Received request`
   - `[POST /api/leads] Creating lead for agency`
   - `[POST /api/leads] Lead created successfully`

3. **Database (Prisma Studio)**:
   - Lead "Test Mario" presente in tabella `leads`
   - Property collegata in tabella `properties`
   - Valuation con `prezzoStimato: 315000` in tabella `valuations`

4. **Dashboard**:
   - Lead appare in `/dashboard/leads`
   - Dettagli completi visibili

---

## 🆘 Se Ancora Non Funziona

Inviami i seguenti log:

1. **Screenshot Console Browser** dopo aver completato il flusso
2. **Log completi del server** (dalla console dove hai eseguito `npm run dev`)
3. **Screenshot Prisma Studio** della tabella `leads` (ultimi 5 record)
4. **Widget ID** che stai usando
5. **URL** del widget che stai testando

Con questi dati posso identificare esattamente il problema!

---

**IMPORTANTE**: Dopo aver applicato le correzioni nel commit precedente, fai un refresh completo del browser (Cmd+Shift+R su Mac o Ctrl+F5 su Windows) per assicurarti di avere l'ultima versione del widget!
