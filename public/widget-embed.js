/**
 * DomusReport Widget Embed Script
 * Carica dinamicamente il widget React sulla pagina del cliente
 */

(function() {
  // Estrai widgetId dall'URL dello script
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const src = currentScript.src;
  const url = new URL(src);
  const widgetId = url.searchParams.get('widgetId');

  if (!widgetId) {
    console.error('DomusReport Widget: widgetId mancante nell\'URL dello script');
    return;
  }

  // Previeni caricamenti multipli
  if (window.DomusReportWidgetLoaded) {
    console.warn('DomusReport Widget: già caricato');
    return;
  }
  window.DomusReportWidgetLoaded = true;

  // Determina base URL (produzione o sviluppo)
  const baseUrl = src.includes('localhost')
    ? 'http://localhost:3000'
    : src.split('/widget-embed.js')[0];

  // Crea container per il widget
  const container = document.createElement('div');
  container.id = 'domusreport-widget-root';
  document.body.appendChild(container);

  // Carica React e ReactDOM da CDN
  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = function() {
      console.error('DomusReport Widget: Errore caricamento script', src);
    };
    document.head.appendChild(script);
  }

  // Carica React se non già presente
  if (typeof React === 'undefined') {
    loadScript('https://unpkg.com/react@18/umd/react.production.min.js', function() {
      loadReactDOM();
    });
  } else {
    loadReactDOM();
  }

  function loadReactDOM() {
    if (typeof ReactDOM === 'undefined') {
      loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', function() {
        initWidget();
      });
    } else {
      initWidget();
    }
  }

  // Carica configurazione widget dal backend
  async function loadWidgetConfig() {
    try {
      const response = await fetch(`${baseUrl}/api/widget-config/public?widgetId=${widgetId}`);
      const data = await response.json();

      if (!data.widgetConfig || !data.widgetConfig.isActive) {
        console.error('DomusReport Widget: widget non attivo o non trovato');
        return null;
      }

      return data.widgetConfig;
    } catch (error) {
      console.error('DomusReport Widget: errore caricamento configurazione', error);
      return null;
    }
  }

  async function initWidget() {
    // Carica configurazione widget
    const config = await loadWidgetConfig();
    if (!config) {
      console.error('DomusReport Widget: impossibile caricare la configurazione');
      return;
    }

    // Rispetta il mode configurato dall'agenzia
    const mode = config.mode || 'bubble';

    if (mode === 'inline') {
      // Modalità inline: crea iframe inline (non floating)
      createInlineWidget(config);
    } else {
      // Modalità bubble: crea bottone + iframe on-demand
      createBubbleWidget(config);
    }

    console.log('DomusReport Widget caricato con successo (widgetId:', widgetId, 'mode:', mode + ')');
  }

  function createInlineWidget(config) {
    // Crea container inline nella pagina
    const inlineContainer = document.createElement('div');
    inlineContainer.id = 'domusreport-widget-inline';
    inlineContainer.style.cssText = `
      width: 100%;
      height: ${config.inlineHeight || '600px'};
      border: ${config.showBorder ? '1px solid #e5e7eb' : 'none'};
      border-radius: ${config.borderRadius || '8px'};
      overflow: hidden;
    `;

    // Crea iframe per widget inline
    const iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/widget/${widgetId}?embed=inline`;
    iframe.style.cssText = 'width: 100%; height: 100%; border: none;';
    iframe.id = 'domusreport-widget-iframe';

    inlineContainer.appendChild(iframe);

    // Append al container dove è stato incluso il tag script
    container.appendChild(inlineContainer);
  }

  function createBubbleWidget(config) {
    // Variabile per iframe (creato solo al primo click)
    let iframe = null;

    // Crea bottone floating per aprire il widget
    const button = document.createElement('div');

    // Usa colori dalla configurazione
    const primaryColor = config.primaryColor || '#3b82f6';
    const secondaryColor = config.secondaryColor || '#2563eb';
    const bubblePosition = config.bubblePosition || 'bottom-right';

    // Posizionamento del bottone in base alla configurazione
    let positionStyles = 'bottom: 24px; right: 24px;';
    if (bubblePosition === 'bottom-left') {
      positionStyles = 'bottom: 24px; left: 24px;';
    } else if (bubblePosition === 'bottom-center') {
      positionStyles = 'bottom: 24px; left: 50%; transform: translateX(-50%);';
    }

    button.style.cssText = `
      position: fixed;
      ${positionStyles}
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      cursor: pointer;
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      border: none;
      pointer-events: auto;
    `;

    // Icona personalizzata o default
    if (config.bubbleIcon) {
      button.innerHTML = `<img src="${config.bubbleIcon}" alt="Chat" style="width: 32px; height: 32px; object-fit: contain;" />`;
    } else {
      button.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;
    }

    // Badge notifica (se configurato)
    if (config.showBadge !== false) {
      const badge = document.createElement('div');
      badge.style.cssText = `
        position: absolute;
        top: -4px;
        right: -4px;
        width: 20px;
        height: 20px;
        background: #ef4444;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: bold;
        color: white;
      `;
      badge.textContent = '1';
      button.appendChild(badge);
    }

    // Effetto hover
    button.onmouseenter = function() {
      button.style.transform = bubblePosition === 'bottom-center'
        ? 'translateX(-50%) scale(1.1)'
        : 'scale(1.1)';
    };
    button.onmouseleave = function() {
      button.style.transform = bubblePosition === 'bottom-center'
        ? 'translateX(-50%) scale(1)'
        : 'scale(1)';
    };

    // Click handler - crea iframe solo al primo click
    button.onclick = function() {
      if (iframe) {
        // Iframe già creato, mostralo
        iframe.style.display = 'block';
        button.style.display = 'none';
        return;
      }

      // Crea iframe per isolare stili (solo modalità bubble)
      iframe = document.createElement('iframe');

      // Posiziona iframe in base al bubblePosition
      let iframePosition = 'right: 0;';
      if (bubblePosition === 'bottom-left') {
        iframePosition = 'left: 0;';
      } else if (bubblePosition === 'bottom-center') {
        iframePosition = 'left: 50%; transform: translateX(-50%);';
      }

      iframe.style.cssText = `
        border: none;
        position: fixed;
        bottom: 0;
        ${iframePosition}
        width: 400px;
        max-width: 100%;
        height: 600px;
        max-height: 100vh;
        z-index: 999999;
        box-shadow: 0 4px 24px rgba(0,0,0,0.15);
        border-radius: 12px 12px 0 0;
        background: transparent;
      `;
      iframe.id = 'domusreport-widget-iframe';

      document.body.appendChild(iframe);

      // Scrivi contenuto nell'iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>DomusReport Widget</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              background: transparent;
            }
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
          <div id="widget-root"></div>

          <!-- Carica il widget Next.js -->
          <script>
            // Notifica parent window quando pronto
            window.addEventListener('DOMContentLoaded', function() {
              window.parent.postMessage({ type: 'WIDGET_READY' }, '*');
            });
          </script>

          <!-- Redirect alla pagina widget Next.js con parametro embed=bubble -->
          <script>
            window.location.href = '${baseUrl}/widget/${widgetId}?embed=bubble';
          </script>
        </body>
        </html>
      `);
      iframeDoc.close();

      button.style.display = 'none';
    };

    // Listen per chiusura widget
    window.addEventListener('message', function(event) {
      if (event.data.type === 'CLOSE_WIDGET' || event.data.type === 'DOMUS_WIDGET_CLOSE') {
        if (iframe) {
          iframe.style.display = 'none';
        }
        button.style.display = 'flex';
      }
    });

    document.body.appendChild(button);
  }
})();
