/**
 * DomusReport Widget Embed Script
 * Version: 3.0.0
 *
 * Usage:
 * <script src="https://domusreport.com/widget.js" data-widget-id="YOUR_WIDGET_ID" async></script>
 */

(function () {
  'use strict';

  // Ricava il dominio host dall'URL dello script stesso (mai hardcoded)
  var currentScript = document.currentScript || document.querySelector('script[data-widget-id]');
  if (!currentScript) return;

  var WIDGET_HOST = new URL(currentScript.src).origin;
  var widgetId = currentScript.getAttribute('data-widget-id');

  if (!widgetId) {
    console.error('[DomusReport] data-widget-id mancante');
    return;
  }

  // Previeni caricamenti doppi
  if (window['__domusreport_' + widgetId]) return;
  window['__domusreport_' + widgetId] = true;

  console.log('[DomusReport] Init widget:', widgetId, 'host:', WIDGET_HOST);

  // ─── Carica configurazione dal backend ───────────────────────────────────────
  function loadConfig(cb) {
    fetch(WIDGET_HOST + '/api/widget-config/public?widgetId=' + widgetId)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.widgetConfig && data.widgetConfig.isActive) {
          cb(data.widgetConfig);
        } else {
          cb(null);
        }
      })
      .catch(function () { cb(null); });
  }

  // ─── Crea il bubble button nativo nel DOM del sito padre ─────────────────────
  function createBubble(config) {
    var primaryColor = (config && config.primaryColor) || '#2563eb';
    var secondaryColor = (config && config.secondaryColor) || primaryColor;
    var position = (config && config.bubblePosition) || 'bottom-right';
    var showBadge = config ? config.showBadge !== false : true;
    var bubbleIcon = config && config.bubbleIcon;

    var posStyle = 'bottom:24px;right:24px;';
    if (position === 'bottom-left') posStyle = 'bottom:24px;left:24px;';
    else if (position === 'bottom-center') posStyle = 'bottom:24px;left:50%;transform:translateX(-50%);';

    var btn = document.createElement('button');
    btn.id = 'domusreport-bubble-' + widgetId;
    btn.setAttribute('aria-label', 'Apri chat valutazione immobiliare');
    btn.style.cssText = [
      'position:fixed',
      posStyle,
      'width:60px',
      'height:60px',
      'border-radius:50%',
      'background:linear-gradient(135deg,' + primaryColor + ',' + secondaryColor + ')',
      'box-shadow:0 4px 16px rgba(0,0,0,0.25)',
      'border:none',
      'cursor:pointer',
      'z-index:2147483646',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'transition:transform .2s',
    ].join(';');

    if (bubbleIcon) {
      btn.innerHTML = '<img src="' + bubbleIcon + '" style="width:32px;height:32px;object-fit:contain;" alt="" />';
    } else {
      btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    }

    if (showBadge) {
      var badge = document.createElement('span');
      badge.style.cssText = 'position:absolute;top:-4px;right:-4px;width:20px;height:20px;background:#ef4444;border-radius:50%;border:2px solid white;font-size:11px;font-weight:bold;color:white;display:flex;align-items:center;justify-content:center;pointer-events:none;';
      badge.textContent = '1';
      btn.appendChild(badge);
    }

    btn.onmouseenter = function () {
      btn.style.transform = position === 'bottom-center' ? 'translateX(-50%) scale(1.1)' : 'scale(1.1)';
    };
    btn.onmouseleave = function () {
      btn.style.transform = position === 'bottom-center' ? 'translateX(-50%) scale(1)' : 'scale(1)';
    };

    return btn;
  }

  // ─── Crea l'iframe della chat (bubble mode, si auto-apre) ────────────────────
  function createChatIframe(config) {
    var position = (config && config.bubblePosition) || 'bottom-right';

    var posStyle = 'bottom:0;right:0;';
    if (position === 'bottom-left') posStyle = 'bottom:0;left:0;';
    else if (position === 'bottom-center') posStyle = 'bottom:0;left:50%;transform:translateX(-50%);';

    var iframe = document.createElement('iframe');
    iframe.id = 'domusreport-iframe-' + widgetId;
    iframe.src = WIDGET_HOST + '/widget/' + widgetId;
    iframe.style.cssText = [
      'position:fixed',
      posStyle,
      'width:400px',
      'max-width:100vw',
      'height:600px',
      'max-height:100vh',
      'border:none',
      'z-index:2147483647',
      'display:none',
      'border-radius:12px 12px 0 0',
      'box-shadow:0 8px 32px rgba(0,0,0,0.2)',
    ].join(';');
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads');
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.setAttribute('title', 'DomusReport Chat');

    // Quando l'iframe è caricato, invia il comando di apertura automatica
    iframe.onload = function () {
      setTimeout(function () {
        try {
          iframe.contentWindow.postMessage({ type: 'DOMUS_WIDGET_OPEN_COMMAND' }, WIDGET_HOST);
        } catch (e) {}
      }, 100);
    };

    return iframe;
  }

  // ─── Inizializza il widget ────────────────────────────────────────────────────
  function init(config) {
    if (config && !config.isActive) return;

    var btn = createBubble(config);
    var iframe = createChatIframe(config);
    var iframeLoaded = false;

    // Apri la chat al click del bubble
    btn.onclick = function () {
      btn.style.display = 'none';
      iframe.style.display = 'block';

      // Se già caricato, invia subito il comando di apertura
      if (iframeLoaded) {
        setTimeout(function () {
          try {
            iframe.contentWindow.postMessage({ type: 'DOMUS_WIDGET_OPEN_COMMAND' }, WIDGET_HOST);
          } catch (e) {}
        }, 50);
      }

      var ev = new CustomEvent('domusreport:open', { detail: { widgetId: widgetId } });
      window.dispatchEvent(ev);
    };

    // Segna che l'iframe è stato caricato
    iframe.addEventListener('load', function () {
      iframeLoaded = true;
    });

    // Ascolta messaggi dall'iframe
    window.addEventListener('message', function (event) {
      if (event.origin !== WIDGET_HOST) return;
      var data = event.data;
      if (!data) return;

      // Chat chiusa dall'utente (pulsante X nell'header)
      if (data.type === 'DOMUS_WIDGET_CLOSE') {
        iframe.style.display = 'none';
        btn.style.display = '';

        var ev = new CustomEvent('domusreport:close', { detail: { widgetId: widgetId } });
        window.dispatchEvent(ev);
      }

      // Lead inviato
      if (data.type === 'DOMUS_LEAD_SUBMITTED') {
        var ev2 = new CustomEvent('domusreport:lead', { detail: { leadId: data.leadId, widgetId: widgetId } });
        window.dispatchEvent(ev2);
        if (typeof gtag === 'function') gtag('event', 'generate_lead', { event_category: 'DomusReport' });
        if (typeof fbq === 'function') fbq('track', 'Lead');
      }
    });

    // Inietta nel DOM
    function inject() {
      if (document.body) {
        document.body.appendChild(btn);
        document.body.appendChild(iframe);
        console.log('[DomusReport] Widget caricato.');
      } else {
        setTimeout(inject, 50);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inject);
    } else {
      inject();
    }

    // API pubblica
    window.DomusReportWidget = window.DomusReportWidget || {};
    window.DomusReportWidget[widgetId] = {
      open: function () { if (iframe.style.display === 'none') btn.onclick(); },
      close: function () {
        iframe.style.display = 'none';
        btn.style.display = '';
      },
      destroy: function () {
        btn.remove();
        iframe.remove();
        delete window.DomusReportWidget[widgetId];
      }
    };
  }

  loadConfig(function (config) {
    init(config);
  });

})();
