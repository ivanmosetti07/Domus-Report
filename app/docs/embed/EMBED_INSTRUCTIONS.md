# DomusReport Widget - Istruzioni di Installazione

## Installazione Base

Per aggiungere il widget DomusReport al tuo sito web, basta inserire questo codice HTML prima della chiusura del tag `</body>`:

```html
<script src="https://domusreport.com/widget.js" data-widget-id="IL_TUO_WIDGET_ID"></script>
```

Sostituisci `IL_TUO_WIDGET_ID` con il tuo Widget ID personale che trovi nella dashboard.

---

## Installazione su WordPress

### Metodo 1: Plugin "Insert Headers and Footers"

1. Installa il plugin "Insert Headers and Footers" dal repository WordPress
2. Vai su **Impostazioni → Insert Headers and Footers**
3. Incolla lo script nella sezione **Footer**
4. Clicca su **Salva**

### Metodo 2: Modifica del tema

1. Vai su **Aspetto → Editor del tema**
2. Seleziona il file `footer.php`
3. Incolla lo script prima della chiusura del tag `</body>`
4. Clicca su **Aggiorna file**

### Metodo 3: Blocco HTML Personalizzato

1. Modifica qualsiasi pagina con Gutenberg
2. Aggiungi un blocco **HTML Personalizzato**
3. Incolla lo script
4. Pubblica la pagina

**Nota:** Il metodo 3 aggiunge il widget solo alla pagina specifica.

---

## Installazione su Webflow

1. Vai su **Project Settings → Custom Code**
2. Nella sezione **Footer Code**, incolla lo script
3. Clicca su **Save Changes**
4. Pubblica il sito

**Nota:** Il widget apparirà su tutte le pagine del sito.

---

## Installazione su Shopify

1. Vai su **Temi → Azioni → Modifica codice**
2. Apri il file `theme.liquid`
3. Incolla lo script prima della chiusura del tag `</body>`
4. Clicca su **Salva**

---

## Installazione su Wix

1. Vai su **Impostazioni sito → Avanzate → Codice personalizzato**
2. Clicca su **+ Aggiungi codice personalizzato**
3. Incolla lo script
4. Seleziona **Carica codice su tutte le pagine**
5. Posiziona il codice nel **Body - end**
6. Clicca su **Applica**

---

## Installazione su HTML Statico

Apri il file HTML e incolla lo script prima della chiusura del tag `</body>`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Il mio sito</title>
</head>
<body>
    <!-- Contenuto del sito -->

    <!-- DomusReport Widget -->
    <script src="https://domusreport.com/widget.js" data-widget-id="IL_TUO_WIDGET_ID"></script>
</body>
</html>
```

---

## API JavaScript (Opzionale)

Dopo aver installato il widget, puoi controllarlo programmaticamente:

```javascript
// Apri il widget
window.DomusReportWidget['IL_TUO_WIDGET_ID'].open();

// Chiudi il widget
window.DomusReportWidget['IL_TUO_WIDGET_ID'].close();

// Rimuovi il widget dalla pagina
window.DomusReportWidget['IL_TUO_WIDGET_ID'].destroy();
```

### Eventi personalizzati

Ascolta quando un lead viene inviato:

```javascript
window.addEventListener('domusreport:lead', function(event) {
    console.log('Lead ID:', event.detail.leadId);
    console.log('Widget ID:', event.detail.widgetId);

    // Esempio: invia evento a Google Analytics
    gtag('event', 'lead_submission', {
        'event_category': 'widget',
        'event_label': event.detail.widgetId
    });
});
```

---

## Personalizzazione (Coming Soon)

In futuro sarà possibile personalizzare il widget con opzioni aggiuntive:

```html
<script
    src="https://domusreport.com/widget.js"
    data-widget-id="IL_TUO_WIDGET_ID"
    data-position="bottom-left"
    data-color="#2563eb"
    data-greeting="Ciao! Ti aiuto a valutare la tua casa"
></script>
```

---

## Test e Debugging

### Verifica che il widget sia caricato

Apri la Console del browser (F12) e cerca questi messaggi:

```
[DomusReport] Initializing widget: IL_TUO_WIDGET_ID
[DomusReport] Widget injected successfully
[DomusReport] Widget loaded: IL_TUO_WIDGET_ID
```

### Testa l'API

Nella console, digita:

```javascript
window.DomusReportWidget
```

Dovresti vedere un oggetto con il tuo Widget ID.

---

## Supporto

Per assistenza tecnica:
- Email: support@domusreport.com
- Dashboard: https://domusreport.com/dashboard
- Documentazione: https://domusreport.com/docs

---

## Sicurezza

Il widget è isolato in un iframe con sandbox per garantire la massima sicurezza:
- ✅ Non può accedere ai dati del tuo sito
- ✅ Non può modificare il DOM della pagina principale
- ✅ Non può accedere ai cookie del sito
- ✅ Utilizza HTTPS per tutte le comunicazioni
- ✅ Validazione lato server di tutti i dati

---

## Performance

- Script leggero: ~5 KB (minified)
- Caricamento asincrono: non rallenta il sito
- Lazy loading: l'iframe si carica solo quando necessario
- CDN globale: latenza minima ovunque nel mondo

---

## Requisiti Browser

Il widget è compatibile con:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile: iOS 14+, Android 10+

---

**Versione:** 1.0.0
**Ultimo aggiornamento:** Dicembre 2024
