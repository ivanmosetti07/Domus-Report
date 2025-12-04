/**
 * DomusReport Widget Embed Script
 * Version: 2.0.0
 *
 * Usage:
 * <script src="https://domusreport.mainstream.agency/widget.js" data-widget-id="YOUR_WIDGET_ID"></script>
 *
 * Configuration options (via data attributes):
 * - data-widget-id: (required) Your unique widget ID
 * - data-position: Override bubble position (bottom-right, bottom-left, bottom-center)
 * - data-auto-open: Auto open widget after delay (milliseconds)
 */

(function() {
  'use strict';

  // Configuration
  const WIDGET_HOST = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://domusreport.mainstream.agency';

  // Get widget ID and options from script tag
  const currentScript = document.currentScript || document.querySelector('script[data-widget-id]');
  const widgetId = currentScript ? currentScript.getAttribute('data-widget-id') : null;
  const positionOverride = currentScript ? currentScript.getAttribute('data-position') : null;
  const autoOpenDelay = currentScript ? parseInt(currentScript.getAttribute('data-auto-open'), 10) : null;

  if (!widgetId) {
    console.error('[DomusReport] Error: data-widget-id attribute is required');
    return;
  }

  console.log('[DomusReport] Initializing widget:', widgetId);

  // Create container for the widget
  const container = document.createElement('div');
  container.id = 'domusreport-widget-' + widgetId;
  container.style.cssText = 'position: fixed; bottom: 0; right: 0; z-index: 9999; pointer-events: none;';

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'domusreport-iframe-' + widgetId;
  iframe.src = WIDGET_HOST + '/widget/' + widgetId + (positionOverride ? '?position=' + positionOverride : '');
  iframe.style.cssText = [
    'position: fixed',
    'bottom: 0',
    'right: 0',
    'width: 100vw',
    'height: 100vh',
    'border: none',
    'z-index: 9999',
    'pointer-events: auto',
    'background: transparent'
  ].join(';');

  // Sandbox attributes for security
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox');
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('title', 'DomusReport Chat Widget');
  iframe.setAttribute('loading', 'lazy');

  // Append iframe to container
  container.appendChild(iframe);

  // Add container to body when DOM is ready
  function injectWidget() {
    if (document.body) {
      document.body.appendChild(container);
      console.log('[DomusReport] Widget injected successfully');

      // Auto open if configured
      if (autoOpenDelay && autoOpenDelay > 0) {
        setTimeout(function() {
          iframe.contentWindow.postMessage({
            type: 'DOMUS_WIDGET_OPEN_COMMAND'
          }, WIDGET_HOST);
        }, autoOpenDelay);
      }
    } else {
      // If body is not ready, wait
      setTimeout(injectWidget, 50);
    }
  }

  // Start injection when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidget);
  } else {
    injectWidget();
  }

  // Listen for messages from iframe
  window.addEventListener('message', function(event) {
    // Security: verify origin
    if (event.origin !== WIDGET_HOST) {
      return;
    }

    var data = event.data;

    // Handle widget loaded event
    if (data.type === 'DOMUS_WIDGET_LOADED') {
      console.log('[DomusReport] Widget loaded:', data.widgetId);

      // Send configuration to iframe if needed
      iframe.contentWindow.postMessage({
        type: 'DOMUS_WIDGET_CONFIG',
        config: {
          widgetId: widgetId,
          parentUrl: window.location.href,
          referrer: document.referrer
        }
      }, WIDGET_HOST);

      // Fire custom event
      var loadEvent = new CustomEvent('domusreport:loaded', {
        detail: { widgetId: widgetId }
      });
      window.dispatchEvent(loadEvent);
    }

    // Handle widget close event
    if (data.type === 'DOMUS_WIDGET_CLOSE') {
      console.log('[DomusReport] Widget closed');

      var closeEvent = new CustomEvent('domusreport:close', {
        detail: { widgetId: widgetId }
      });
      window.dispatchEvent(closeEvent);
    }

    // Handle widget open event
    if (data.type === 'DOMUS_WIDGET_OPEN') {
      console.log('[DomusReport] Widget opened');

      var openEvent = new CustomEvent('domusreport:open', {
        detail: { widgetId: widgetId }
      });
      window.dispatchEvent(openEvent);
    }

    // Handle lead submitted event
    if (data.type === 'DOMUS_LEAD_SUBMITTED') {
      console.log('[DomusReport] Lead submitted:', data.leadId);

      // Fire custom event for tracking
      var leadEvent = new CustomEvent('domusreport:lead', {
        detail: {
          leadId: data.leadId,
          widgetId: widgetId
        }
      });
      window.dispatchEvent(leadEvent);

      // Google Analytics 4 event (if available)
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', {
          'event_category': 'DomusReport',
          'event_label': 'Lead Submitted',
          'value': 1
        });
      }

      // Facebook Pixel event (if available)
      if (typeof fbq === 'function') {
        fbq('track', 'Lead', {
          content_name: 'DomusReport Valuation'
        });
      }
    }

    // Handle valuation view event
    if (data.type === 'DOMUS_VALUATION_VIEWED') {
      console.log('[DomusReport] Valuation viewed');

      var valuationEvent = new CustomEvent('domusreport:valuation', {
        detail: {
          widgetId: widgetId,
          estimatedPrice: data.estimatedPrice
        }
      });
      window.dispatchEvent(valuationEvent);
    }
  });

  // Expose widget API on window object
  window.DomusReportWidget = window.DomusReportWidget || {};
  window.DomusReportWidget[widgetId] = {
    open: function() {
      iframe.contentWindow.postMessage({
        type: 'DOMUS_WIDGET_OPEN_COMMAND'
      }, WIDGET_HOST);
    },
    close: function() {
      iframe.contentWindow.postMessage({
        type: 'DOMUS_WIDGET_CLOSE_COMMAND'
      }, WIDGET_HOST);
    },
    destroy: function() {
      container.remove();
      delete window.DomusReportWidget[widgetId];
      console.log('[DomusReport] Widget destroyed');
    },
    getWidgetId: function() {
      return widgetId;
    },
    isLoaded: function() {
      return true;
    }
  };

  console.log('[DomusReport] Widget API available at window.DomusReportWidget["' + widgetId + '"]');
})();
