/**
 * DomusReport Widget Embed Script
 * Version: 1.0.0
 *
 * Usage:
 * <script src="https://domusreport.mainstream.agency/widget.js" data-widget-id="YOUR_WIDGET_ID"></script>
 *
 * Or with CDN:
 * <script src="https://cdn.domusreport.mainstream.agency/widget.js" data-widget-id="YOUR_WIDGET_ID"></script>
 */

(function() {
  'use strict';

  // Configuration
  const WIDGET_HOST = 'https://domusreport.mainstream.agency';

  // Get widget ID from script tag
  const currentScript = document.currentScript || document.querySelector('script[data-widget-id]');
  const widgetId = currentScript ? currentScript.getAttribute('data-widget-id') : null;

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
  iframe.src = WIDGET_HOST + '/widget/' + widgetId;
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

  // Append iframe to container
  container.appendChild(iframe);

  // Add container to body when DOM is ready
  function injectWidget() {
    if (document.body) {
      document.body.appendChild(container);
      console.log('[DomusReport] Widget injected successfully');
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

    const data = event.data;

    // Handle widget loaded event
    if (data.type === 'DOMUS_WIDGET_LOADED') {
      console.log('[DomusReport] Widget loaded:', data.widgetId);

      // Send configuration to iframe if needed
      iframe.contentWindow.postMessage({
        type: 'DOMUS_WIDGET_CONFIG',
        config: {
          widgetId: widgetId,
          parentUrl: window.location.href
        }
      }, WIDGET_HOST);
    }

    // Handle widget close event
    if (data.type === 'DOMUS_WIDGET_CLOSE') {
      console.log('[DomusReport] Widget closed');
    }

    // Handle widget open event
    if (data.type === 'DOMUS_WIDGET_OPEN') {
      console.log('[DomusReport] Widget opened');
    }

    // Handle lead submitted event
    if (data.type === 'DOMUS_LEAD_SUBMITTED') {
      console.log('[DomusReport] Lead submitted:', data.leadId);

      // Fire custom event for tracking
      const customEvent = new CustomEvent('domusreport:lead', {
        detail: {
          leadId: data.leadId,
          widgetId: widgetId
        }
      });
      window.dispatchEvent(customEvent);
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
      console.log('[DomusReport] Widget destroyed');
    }
  };

  console.log('[DomusReport] Widget API available at window.DomusReportWidget["' + widgetId + '"]');
})();
