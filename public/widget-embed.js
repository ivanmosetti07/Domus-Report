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

  function initWidget() {
    // Crea iframe per isolare stili
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'border: none; position: fixed; bottom: 0; right: 0; width: 100%; height: 100%; z-index: 999999;';
    iframe.id = 'domusreport-widget-iframe';

    // Nascondi iframe inizialmente
    iframe.style.display = 'none';

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

        <!-- Redirect alla pagina widget Next.js -->
        <script>
          window.location.href = '${baseUrl}/widget/${widgetId}';
        </script>
      </body>
      </html>
    `);
    iframeDoc.close();

    // Crea bottone floating per aprire il widget
    const button = document.createElement('div');
    button.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      cursor: pointer;
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-center: center;
      transition: transform 0.2s;
    `;
    button.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;

    // Badge notifica
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

    // Effetto hover
    button.onmouseenter = function() {
      button.style.transform = 'scale(1.1)';
    };
    button.onmouseleave = function() {
      button.style.transform = 'scale(1)';
    };

    // Click handler
    button.onclick = function() {
      iframe.style.display = 'block';
      button.style.display = 'none';
      badge.style.display = 'none';
    };

    // Listen per chiusura widget
    window.addEventListener('message', function(event) {
      if (event.data.type === 'CLOSE_WIDGET') {
        iframe.style.display = 'none';
        button.style.display = 'flex';
      }
    });

    document.body.appendChild(button);

    console.log('DomusReport Widget caricato con successo (widgetId:', widgetId + ')');
  }
})();
