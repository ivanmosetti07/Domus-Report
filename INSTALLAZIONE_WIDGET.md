# 🚀 Guida Installazione Widget DomusReport

## Per installare il widget sul sito https://www.mainstreamagency.it/online/test/

### ✅ PROBLEMI RISOLTI

Prima dell'installazione, abbiamo corretto:
- ✅ **Background bianco rimosso** - L'iframe ora è completamente trasparente
- ✅ **Bottone sempre cliccabile** - Il badge non interferisce più con i click
- ✅ **Trasparenza garantita** - HTML e CSS forzano `background: transparent !important`

---

## 📝 Istruzioni di Installazione

### Metodo 1: WordPress/Elementor (Consigliato)

1. **Accedi al backend WordPress** di mainstreamagency.it
2. **Vai alla pagina /online/test/** in modalità modifica
3. **Aggiungi un widget HTML/Codice Personalizzato** (Custom HTML Widget)
4. **Incolla questo codice:**

```html
<script src="https://domusreport.com/widget-embed.js?widgetId=TUO_WIDGET_ID"></script>
```

5. **Sostituisci `TUO_WIDGET_ID`** con il widgetId della tua agenzia (es: `ABC123`)
6. **Pubblica/Aggiorna la pagina**

### Metodo 2: Inserimento manuale nel footer

1. **Accedi a WordPress** → **Aspetto** → **Editor Tema**
2. **Apri il file `footer.php`** (o usa un plugin come "Insert Headers and Footers")
3. **Aggiungi prima del tag `</body>`:**

```html
<!-- DomusReport Widget -->
<script src="https://domusreport.com/widget-embed.js?widgetId=TUO_WIDGET_ID"></script>
```

4. **Salva le modifiche**

### Metodo 3: Plugin "Insert Headers and Footers"

1. **Installa il plugin** "Insert Headers and Footers"
2. **Vai su Settings** → **Insert Headers and Footers**
3. **Nel campo "Scripts in Footer"** incolla:

```html
<script src="https://domusreport.com/widget-embed.js?widgetId=TUO_WIDGET_ID"></script>
```

4. **Salva**

---

## 🔑 Ottenere il widgetId

Il `widgetId` è il codice univoco del tuo widget. Per ottenerlo:

1. **Accedi alla dashboard DomusReport**: https://domusreport.com/dashboard
2. **Vai su Widget** → **Configurazione Widget**
3. **Copia il Widget ID** (es: `abc123def456`)
4. **Sostituiscilo nel codice** al posto di `TUO_WIDGET_ID`

---

## 🎨 Personalizzazione (Opzionale)

Tutte le personalizzazioni si fanno dalla **Dashboard DomusReport** → **Widget**:

### Colori e Stile
- **Colore primario** e **secondario** del bottone
- **Stile del bottone** (gradient, solid, outline)
- **Animazione** del bubble (pulse, bounce, none)

### Posizionamento
- **Bottom-right** (default)
- **Bottom-left**
- **Bottom-center**

### Comportamento
- **Mostra badge notifica** (pallino rosso)
- **Icona personalizzata** (carica una tua immagine)
- **CSS personalizzato** (per styling avanzato)

---

## 🧪 Testing

Dopo l'installazione, verifica:

✅ **Bottone visibile** in basso a destra
✅ **Nessun overlay bianco** sul contenuto della pagina
✅ **Bottone cliccabile** al primo tentativo
✅ **Chat si apre** in una finestra 400×600px
✅ **Chat chiudibile** e il bottone riappare
✅ **Badge rosso visibile** (se abilitato)

### Test su più dispositivi:
- Desktop (Chrome, Firefox, Safari, Edge)
- Tablet (iPad, Android)
- Mobile (iPhone, Android)

---

## 🐛 Troubleshooting

### Il bottone non appare
- Verifica che il `widgetId` sia corretto
- Controlla la console del browser (F12) per errori
- Verifica che lo script sia caricato: cerca `DomusReport Widget caricato con successo` nei log

### Il bottone non è cliccabile
- **RISOLTO** ✅ con commit `5a2668d`: badge ora ha `pointer-events: none`
- Verifica di avere l'ultima versione del codice

### C'è un overlay bianco
- **RISOLTO** ✅ con commit `5a2668d`: iframe ora ha `background: transparent !important`
- Verifica di avere l'ultima versione del codice
- Svuota la cache del browser (Ctrl+Shift+R o Cmd+Shift+R)

### Il widget non carica
- Verifica che il widget sia **attivo** nella dashboard DomusReport
- Controlla che l'URL del backend sia raggiungibile
- Verifica che non ci siano blocchi CORS

### Il widget appare ma non risponde
- Controlla la configurazione del widget nella dashboard
- Verifica che l'AI assistant sia configurato correttamente
- Controlla i log del server per errori API

---

## 📊 Modalità Inline (Alternativa)

Se preferisci integrare il widget **direttamente nella pagina** invece che come bubble:

1. **Dashboard DomusReport** → **Widget** → **Configurazione**
2. **Modalità**: seleziona **Inline** (invece di Bubble)
3. **Salva** le modifiche
4. **Aggiungi il codice** in un container della pagina (non nel footer)

```html
<div style="width: 100%; height: 600px;">
  <script src="https://domusreport.com/widget-embed.js?widgetId=TUO_WIDGET_ID"></script>
</div>
```

Il widget si adatterà automaticamente al container.

---

## 🔐 Note sulla Sicurezza

- Lo script è **hostato su DomusReport** (https://domusreport.com)
- Tutte le comunicazioni usano **HTTPS**
- Il widget rispetta la **privacy GDPR**
- I dati degli utenti sono **criptati**
- Il widget **non interferisce** con altri script della pagina

---

## 📞 Supporto

Per assistenza:
- **Email**: support@domusreport.com
- **Dashboard**: https://domusreport.com/dashboard/support
- **Documentazione**: https://docs.domusreport.com

---

## 🚀 Deploy in Produzione

Quando sei pronto per il deploy:

1. **Verifica** che tutto funzioni in staging/test
2. **Copia lo script tag** dalla pagina di test
3. **Aggiungi al sito di produzione** usando uno dei metodi sopra
4. **Testa** su dispositivi reali
5. **Monitora** le conversazioni dalla dashboard DomusReport

---

**Ultima modifica**: 2024-12-12
**Versione widget**: 2.0 (commit 5a2668d)
**Problemi risolti**: Background bianco ✅ | Bottone non cliccabile ✅
