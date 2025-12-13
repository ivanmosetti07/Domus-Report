# ✅ VERIFICA FIX TELEFONO - Guida Rapida

## 🎯 Obiettivo
Verificare che il numero di telefono venga salvato correttamente nella tabella `leads` campo `telefono`.

---

## 📋 PRIMA DI TESTARE

### Situazione Attuale (Database)
```
Tabella: leads
Campo: telefono (String?)
Status PRIMA del fix: 0/14 lead avevano telefono (100% NULL)
```

### Fix Applicato
**Problema**: React state batching - `collectedData.phone` era undefined quando veniva inviato al server
**Soluzione**: Usato `setTimeout(() => calculateValuation(), 0)` per garantire che lo stato sia aggiornato

---

## 🧪 PROCEDURA DI TEST

### Step 1: Verifica Deploy Completato
```bash
# Attendi 1-2 minuti dopo il push, poi verifica:
curl -I https://domusreport.mainstream.agency/
# Dovrebbe rispondere 200 OK
```

### Step 2: Test Widget in Produzione

1. **Apri browser**: https://domusreport.mainstream.agency/
2. **Apri DevTools**: F12 → Console tab
3. **Avvia il widget** (click sul pulsante floating)
4. **Completa il flusso**:
   - Indirizzo: Milano
   - Quartiere: Centro
   - Tipo: Appartamento
   - Superficie: 85 mq
   - Locali: 3
   - Bagni: 2
   - Piano: 1-2 con ascensore
   - Spazi esterni: Balcone
   - Posto auto: Sì
   - Stato: Buono
   - Riscaldamento: Autonomo
   - Aria condizionata: Sì
   - Classe energetica: C
   - Anno costruzione: 2000
   - Occupazione: Libero
   - **Nome**: Test Verifica
   - **Email**: test@test.it
   - **Telefono**: 3497494871 ← **CRITICO**

5. **Attendi la valutazione** e conferma salvataggio

### Step 3: Verifica Console Browser

Cerca questi log nella Console:
```
[calculateValuation] CollectedData BEFORE API call:
  phone: "3497494871"  ← DEVE essere presente!

[completeConversation] 🔍 CRITICAL DEBUG - CollectedData at start:
  phone: "3497494871"  ← DEVE essere presente!

[ChatWidget] Phone data before sending:
  phone: "3497494871"  ← DEVE essere presente!
```

**Se phone è presente** → Il fix ha funzionato lato client ✅

### Step 4: Verifica Database

```bash
cd /Users/ivanmosetti/Documents/APP\ GEMINI/Domus\ Report/Domus-Report
node scripts/check-phone-in-db.mjs
```

**Output atteso**:
```
📊 Totale lead nel database: 15
✅ Lead CON telefono: 1 (7%)    ← DEVE essere almeno 1!
❌ Lead SENZA telefono: 14 (93%)

Ultimi lead:
[1] Test Verifica
    Email: test@test.it
    Telefono: 3497494871  ← DEVE essere presente!
```

### Step 5: Query Diretta Database (Opzionale)

Se hai accesso al database Neon:
```sql
SELECT id, nome, email, telefono, "data_richiesta"
FROM leads
ORDER BY "data_richiesta" DESC
LIMIT 5;
```

**Risultato atteso**: L'ultimo lead deve avere `telefono = '3497494871'`

---

## ✅ CRITERI DI SUCCESSO

Il fix è riuscito se:

1. ✅ Console browser mostra `phone: "3497494871"` in tutti e 3 i log
2. ✅ Script check-phone-in-db mostra almeno 1 lead con telefono
3. ✅ Database query mostra l'ultimo lead con telefono non-null

---

## ❌ SE IL TEST FALLISCE

### Scenario A: Console mostra phone undefined
→ Il fix React state batching non ha funzionato
→ Verificare che il deploy sia completato
→ Provare hard refresh (Ctrl+Shift+R)

### Scenario B: Console mostra phone OK ma database ha NULL
→ Problema server-side nella validazione o salvataggio
→ Controllare log Vercel: `vercel logs production --since 10m`
→ Cercare errori nella chiamata POST /api/leads

### Scenario C: Errore durante la valutazione
→ Controllare Network tab per vedere la risposta
→ Verificare se c'è un errore 400/500

---

## 🔍 DEBUG AVANZATO

Se serve ulteriore debug, apri Network tab in DevTools e:

1. Filter: `leads`
2. Completa la valutazione
3. Click sulla richiesta POST /api/leads
4. Vai a **Payload** tab
5. Verifica che contenga:
   ```json
   {
     "firstName": "Test",
     "lastName": "Verifica",
     "email": "test@test.it",
     "phone": "3497494871",  ← DEVE essere qui!
     ...
   }
   ```

Se `phone` è presente nel payload ma non viene salvato:
→ Il problema è nel server (validation.ts o route.ts)

Se `phone` è assente dal payload:
→ Il problema è ancora nel widget (state batching non risolto)

---

## 📊 TRACKING PROGRESSI

| Test | Data | Risultato | Note |
|------|------|-----------|------|
| Test 1 | ___ | ⏳ Pending | Primo test dopo fix |
| Test 2 | ___ | ___ | ___ |
| Test 3 | ___ | ___ | ___ |

---

## 🚀 PROSSIMI PASSI SE TUTTO FUNZIONA

1. ✅ Rimuovere i log di debug (console.log) per pulire il codice
2. ✅ Documentare il fix nel changelog
3. ✅ Monitorare i prossimi lead per confermare che il problema è risolto
4. ✅ Considerare di aggiungere un test automatico per prevenire regressioni
