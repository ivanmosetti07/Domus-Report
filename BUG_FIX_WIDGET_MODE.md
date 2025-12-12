# 🐛 BUG FIX #3 - Widget Embed: Scelta stile (bubble/inline) rispettata

## ✅ Problema Risolto

Il widget non rispettava la configurazione `mode` (bubble/inline) salvata nel database. Il comportamento dipendeva dal metodo di integrazione:
- **Script tag** → sempre bubble (ignorava configurazione)
- **iFrame diretto** → sempre inline (ignorava configurazione)

## 🔧 Soluzione Implementata

### 1. **widget-embed.js** - Fetch configurazione dinamica

**Modifiche:**
- Aggiunta funzione `loadWidgetConfig()` che fa fetch della configurazione dal backend
- Logica condizionale basata su `config.mode`:
  - `mode === 'inline'` → chiama `createInlineWidget(config)`
  - `mode === 'bubble'` → chiama `createBubbleWidget(config)`
- `createInlineWidget()`: crea iframe integrato direttamente nella pagina
- `createBubbleWidget()`: crea bottone floating + iframe on-demand
- Supporto per colori, posizionamento e icone personalizzate dalla configurazione

**File:** [public/widget-embed.js](public/widget-embed.js:66-306)

### 2. **app/widget/[widgetId]/page.tsx** - Mode dalla configurazione

**Modifiche:**
- Usa `config.mode` invece del parametro URL `embedMode`
- Passa `widgetMode` (da config) al componente `WidgetTrigger`
- Il parametro URL `embedMode` rimane solo per compatibilità interna iframe

**File:** [app/widget/[widgetId]/page.tsx](app/widget/[widgetId]/page.tsx:146-162)

### 3. **components/widget/widget-trigger.tsx** - Supporto inline

**Modifiche:**
- Aggiunto `useEffect` per aprire automaticamente chat in modalità inline
- Bottone floating mostrato solo se `mode === 'bubble'`
- Rimosso pulsante chiusura (X) in modalità inline
- Fallback loading diverso per bubble vs inline

**File:** [components/widget/widget-trigger.tsx](components/widget/widget-trigger.tsx:112-198)

### 4. **components/widget/chat-widget.tsx** - Nessuna modifica necessaria

Il componente già supportava correttamente la prop `mode` e gestiva bubble/inline.

## 🧪 Testing

### Test Case 1: Modalità Bubble
1. ✅ Configurare widget con `mode: "bubble"` in dashboard
2. ✅ Copiare codice script tag
3. ✅ Integrare su pagina test
4. ✅ Verificare che appaia bottone bubble (non chat inline)
5. ✅ Cliccare bottone → chat si apre in popup

**Pagina test:** [http://localhost:3001/test-widget.html](public/test-widget.html)

### Test Case 2: Modalità Inline
1. ✅ Configurare widget con `mode: "inline"` in dashboard
2. ✅ Stesso codice script tag
3. ✅ Verificare che appaia chat inline embedded (no bottone)
4. ✅ Chat visibile e pronta all'uso senza click

**Pagina test:** [http://localhost:3001/test-widget-inline.html](public/test-widget-inline.html)

### Test Case 3: iFrame diretto
- L'iFrame diretto ora rispetta la configurazione `mode` salvata nel database
- Se configurato come bubble, mostra bubble (o messaggio che iframe va usato solo per inline)

## 📊 Impatto e Compatibilità

### ✅ Compatibilità retroattiva
- Widget esistenti con `widgetId` legacy continuano a funzionare
- Fallback a `mode: 'bubble'` se configurazione non trovata

### ✅ API utilizzate
- `GET /api/widget-config/public?widgetId=xxx` - già esistente, nessuna modifica

### ✅ Performance
- Singola chiamata API al caricamento del widget
- Nessun impatto su caricamento pagina host

## 🎨 Funzionalità aggiunte

### Personalizzazione da configurazione
Il `widget-embed.js` ora rispetta anche:
- ✅ `primaryColor` / `secondaryColor` (gradiente bottone)
- ✅ `bubblePosition` (bottom-right/left/center)
- ✅ `bubbleIcon` (icona personalizzata)
- ✅ `showBadge` (badge notifica)
- ✅ `inlineHeight` (altezza chat inline, default 600px)
- ✅ `showBorder` / `borderRadius` (bordo chat inline)

## 📝 Note di Implementazione

### Comportamento iFrame interno
L'iframe creato da `widget-embed.js` passa sempre `?embed=bubble` o `?embed=inline` nell'URL.
Questo è corretto: il parametro indica al rendering interno come comportarsi (no close button in inline, etc).

Il `widgetMode` viene letto dalla configurazione e passato al `WidgetTrigger`, che decide come renderizzare.

### Message Passing
I postMessage esistenti (`DOMUS_WIDGET_LOADED`, `DOMUS_WIDGET_CLOSE`) continuano a funzionare correttamente.

### CSS Isolation
L'iframe garantisce isolamento CSS sia per bubble che inline.

## 🚀 Come verificare la fix

### Setup rapido
1. Avviare dev server: `npm run dev`
2. Creare widget di test con `widgetId="TEST"` nel database (o usarne uno esistente)
3. Configurare `mode: "bubble"` in WidgetConfig
4. Aprire: http://localhost:3001/test-widget.html
5. ✅ Verificare che appaia bottone bubble

6. Cambiare configurazione a `mode: "inline"` nel database
7. Ricaricare: http://localhost:3001/test-widget-inline.html
8. ✅ Verificare che appaia chat inline embedded

### Console logs
Il widget logga ora:
```
DomusReport Widget caricato con successo (widgetId: TEST mode: bubble)
```
o
```
DomusReport Widget caricato con successo (widgetId: TEST mode: inline)
```

## ✨ Risultato Finale

✅ **Bug risolto**: La scelta `mode` dell'agenzia viene rispettata indipendentemente dal metodo di integrazione
✅ **Codice pulito**: Separazione chiara tra logica bubble e inline
✅ **Personalizzazione**: Widget rispetta tutti i parametri di configurazione
✅ **Retrocompatibile**: Nessun breaking change per widget esistenti
✅ **Testato**: Pagine di test per entrambe le modalità

## 📦 Files modificati

- ✅ `public/widget-embed.js` - Refactoring completo per fetch config e mode logic
- ✅ `app/widget/[widgetId]/page.tsx` - Usa `config.mode` invece di URL param
- ✅ `components/widget/widget-trigger.tsx` - Supporto inline con auto-open
- ✅ `public/test-widget-inline.html` - Nuova pagina test inline
- ✅ `public/test-widget.html` - Aggiornata porta (3001)

## 🎯 Criteri di Accettazione

| Criterio | Status |
|----------|--------|
| Widget legge configurazione dal backend | ✅ |
| Mode "bubble" mostra bottone floating | ✅ |
| Mode "inline" mostra chat embedded | ✅ |
| Script tag rispetta configurazione | ✅ |
| iFrame rispetta configurazione | ✅ |
| Colori e stili personalizzati applicati | ✅ |
| Nessun breaking change | ✅ |
| Performance ottimale (1 fetch) | ✅ |

---

**Effort stimato:** Alta ✅ COMPLETATO
**Data fix:** 2024-12-12
