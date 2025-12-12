# 🔴 FIX URGENTE: Widget 404 in Produzione

## 🚨 Problema

**URL usato** (SBAGLIATO):
```
https://domusreport.mainstream.agency/widgets/wgt_KqoseGGHNRk3URSx
                                    ^^^^^^^^ PLURALE - SBAGLIATO!
```

**Errore**: `404 Not Found`

---

## ✅ Soluzione Rapida

### **1. Correggi URL - Usa SINGOLARE**

**URL CORRETTO**:
```
https://domusreport.mainstream.agency/widget/wgt_KqoseGGHNRk3URSx
                                    ^^^^^^^ SINGOLARE - CORRETTO!
```

Le rotte disponibili sono:
- ✅ `/widget/[widgetId]` - Widget bubble/inline configurabile
- ✅ `/widget/inline/[widgetId]` - Widget inline dedicato
- ❌ `/widgets/[widgetId]` - NON ESISTE

---

### **2. Verifica Widget ID in Database**

Il `widgetId` potrebbe non esistere. Per verificarlo:

**Opzione A: Dashboard**
1. Vai a: `https://domusreport.mainstream.agency/dashboard/widgets`
2. Cerca il widget `wgt_KqoseGGHNRk3URSx`
3. **Se NON appare**: crea un nuovo widget o usa un widget esistente

**Opzione B: Verifica tramite API** (da browser con DevTools):
```javascript
// Apri Console (F12) su qualsiasi pagina del sito loggato
fetch('/api/widget-config/public?widgetId=wgt_KqoseGGHNRk3URSx')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Risultato atteso**:
- ✅ Status 200 + dati widget → Widget esiste, usa URL corretto
- ❌ Status 404 → Widget NON esiste, devi crearlo o usare un altro ID

---

### **3. Ottieni Widget ID Corretto**

Se il widget non esiste o vuoi ottenere l'ID corretto:

**A. Dalla Dashboard** (se loggato come agenzia):
```
https://domusreport.mainstream.agency/dashboard/widget
```

Qui troverai:
- **Widget ID** da usare nell'embed
- **Codice embed** già pronto con l'ID corretto
- **Anteprima live** del widget

**B. Dalla Pagina Widgets** (se admin o multi-widget):
```
https://domusreport.mainstream.agency/dashboard/widgets
```

Lista di tutti i widget configurati con i loro ID.

---

## 🔧 Correzione URL Embed

### **Codice Embed Attuale** (SBAGLIATO):

Se stai usando un embed script, assicurati che l'URL sia corretto:

```html
<!-- ❌ SBAGLIATO -->
<iframe src="https://domusreport.mainstream.agency/widgets/wgt_KqoseGGHNRk3URSx"></iframe>
```

### **Codice Embed Corretto**:

```html
<!-- ✅ CORRETTO -->
<iframe
  src="https://domusreport.mainstream.agency/widget/wgt_KqoseGGHNRk3URSx?embed=bubble"
  style="position: fixed; bottom: 20px; right: 20px; width: 400px; height: 600px; border: none; z-index: 9999;"
  allow="clipboard-write"
></iframe>
```

Oppure usa lo **script embed ufficiale** (migliore):

```html
<script>
  (function() {
    var widgetId = 'wgt_KqoseGGHNRk3URSx'; // ⚠️ SOSTITUISCI CON IL TUO ID
    var iframe = document.createElement('iframe');
    iframe.src = 'https://domusreport.mainstream.agency/widget/' + widgetId + '?embed=bubble';
    iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;z-index:9999';
    iframe.allow = 'clipboard-write';
    document.body.appendChild(iframe);
  })();
</script>
```

---

## 🧪 Test Rapido

### **Test 1: Verifica URL Corretto**

Apri in un browser (anche non loggato):
```
https://domusreport.mainstream.agency/widget/wgt_KqoseGGHNRk3URSx
```

**Risultati possibili**:

1. **✅ Widget si carica** → URL corretto, widget esiste!
2. **❌ "Widget non trovato"** → Widget ID non esiste nel database
3. **❌ "Widget non attivo"** → Widget esiste ma è disattivato
4. **❌ 404 Not Found** → Ancora usando `/widgets/` (plurale) invece di `/widget/` (singolare)

---

### **Test 2: Verifica con DevTools**

1. Apri il widget (URL corretto)
2. Apri DevTools (F12)
3. Vai alla tab **Console**
4. Completa il flusso
5. Cerca log:
   ```javascript
   [ChatWidget] Sending lead to API: { widgetId: "wgt_...", ... }
   [ChatWidget] API Response: { status: 200, ok: true }
   ```

Se vedi status 200 → **LEAD SALVATO!** Controlla dashboard.

---

## 📋 Checklist Diagnostica Completa

- [ ] Ho corretto l'URL da `/widgets/` a `/widget/` (singolare)
- [ ] Ho verificato che il `widgetId` esiste nel database
- [ ] Ho verificato che il widget sia **attivo** (`isActive: true`)
- [ ] Ho verificato che l'agenzia sia **attiva** (`attiva: true`)
- [ ] Ho testato l'URL diretto in un browser
- [ ] Ho completato un test end-to-end con DevTools aperto
- [ ] Ho verificato i log del server (se hai accesso)
- [ ] Ho controllato la dashboard `/dashboard/leads` dopo il test

---

## 🔍 Trova Tutti i Widget Disponibili

Se non sai quale widget ID usare, puoi:

**Opzione 1: Dashboard Widgets**
```
https://domusreport.mainstream.agency/dashboard/widgets
```

**Opzione 2: API Call** (se loggato):
```javascript
fetch('/api/widget-config')
  .then(r => r.json())
  .then(data => {
    console.table(data.widgetConfigs.map(w => ({
      ID: w.widgetId,
      Nome: w.name,
      Attivo: w.isActive,
      Agenzia: w.agency?.nome
    })))
  })
```

**Opzione 3: Database Query** (se hai accesso DB):
```sql
-- Nuovo sistema (preferito)
SELECT wc.widgetId, wc.name, wc.isActive, a.nome as agenzia
FROM WidgetConfig wc
JOIN Agency a ON a.id = wc.agencyId
WHERE wc.isActive = true;

-- Vecchio sistema (fallback)
SELECT widgetId, nome as agenzia, attiva
FROM Agency
WHERE widgetId IS NOT NULL AND attiva = true;
```

---

## 🚀 Quick Fix - 3 Step

### **Step 1: Ottieni Widget ID Corretto**

Vai a: `https://domusreport.mainstream.agency/dashboard/widget`

Copia il **Widget ID** mostrato (es: `wgt_xyz123...`)

---

### **Step 2: Testa URL Diretto**

Apri in un nuovo tab:
```
https://domusreport.mainstream.agency/widget/[TUO-WIDGET-ID]
```

Sostituisci `[TUO-WIDGET-ID]` con l'ID copiato.

**Il widget si carica?**
- ✅ **SÌ** → Perfetto! Usa questo URL nell'embed
- ❌ **NO** → Vai a Step 3

---

### **Step 3: Attiva Widget/Agenzia**

Se il widget non si carica:

**A. Dashboard Widget** → `https://domusreport.mainstream.agency/dashboard/widget`
   - Verifica che il toggle "Attivo" sia **ON** (verde)

**B. Dashboard Profilo** → `https://domusreport.mainstream.agency/dashboard/profile`
   - Verifica che l'agenzia sia **attiva**

**C. Crea Nuovo Widget** (se necessario):
   - Vai a: `https://domusreport.mainstream.agency/dashboard/widgets`
   - Clicca "Crea Nuovo Widget"
   - Configura e salva
   - Usa il nuovo Widget ID

---

## ✅ Esempio Completo Funzionante

Una volta ottenuto il Widget ID corretto (es: `wgt_ABC123DEF456`):

**HTML Embed**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Il Mio Sito</title>
</head>
<body>
  <h1>Benvenuto</h1>
  <p>Il tuo contenuto...</p>

  <!-- Widget Domus Report -->
  <script>
    (function() {
      var widgetId = 'wgt_ABC123DEF456'; // ⚠️ IL TUO WIDGET ID QUI
      var iframe = document.createElement('iframe');
      iframe.src = 'https://domusreport.mainstream.agency/widget/' + widgetId + '?embed=bubble';
      iframe.style.cssText = 'position:fixed;bottom:20px;right:20px;width:400px;height:600px;border:none;z-index:9999;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15)';
      iframe.allow = 'clipboard-write';
      document.body.appendChild(iframe);
    })();
  </script>
</body>
</html>
```

**Test**: Salva come `test.html` e apri in un browser. Il widget dovrebbe apparire in basso a destra.

---

## 🆘 Ancora Problemi?

Se dopo aver corretto l'URL continui ad avere problemi:

1. **Inviami**:
   - URL esatto che stai usando
   - Screenshot dell'errore
   - Widget ID che stai tentando di usare
   - Screenshot della pagina `/dashboard/widgets` (se hai accesso)

2. **Verifica log server** (se hai accesso SSH/logs):
   ```bash
   # Cerca errori recenti
   tail -n 100 /path/to/logs/production.log | grep -i "widget\|404"
   ```

3. **Test API manuale** (da terminale con curl):
   ```bash
   curl -I https://domusreport.mainstream.agency/widget/wgt_KqoseGGHNRk3URSx
   ```

   Dovrebbe restituire `HTTP/2 200` se il widget esiste.

---

## 📚 Documenti Correlati

- [DIAGNOSTICA_LEAD_NON_SALVATO.md](DIAGNOSTICA_LEAD_NON_SALVATO.md) - Debug completo lead
- [FIX_DATI_VALUTAZIONE_MANCANTI.md](FIX_DATI_VALUTAZIONE_MANCANTI.md) - Fix dati valutazione
- [BUG_FIX_WIDGET_LEAD_SALVATO.md](BUG_FIX_WIDGET_LEAD_SALVATO.md) - Fix salvataggio lead

---

**RIEPILOGO FIX**:
1. ✅ Usa `/widget/` (singolare) NON `/widgets/` (plurale)
2. ✅ Verifica che il Widget ID esista nel database
3. ✅ Verifica che widget e agenzia siano attivi
4. ✅ Testa con DevTools aperto per vedere log dettagliati
