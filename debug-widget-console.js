/**
 * Script di Debug Widget DomusReport
 *
 * ISTRUZIONI:
 * 1. Apri la pagina con il widget: https://www.mainstreamagency.it/online/test/
 * 2. Apri Console (F12 → Console)
 * 3. Copia e incolla TUTTO questo script nella console
 * 4. Premi INVIO
 * 5. Leggi i risultati e invia a Claude per analisi
 */

console.log('🔍 === INIZIO DEBUG WIDGET DOMUSREPORT ===');

// 1. Verifica presenza widget
console.log('\n📦 1. VERIFICA PRESENZA WIDGET');
const container = document.querySelector('#domusreport-widget-root');
console.log('Container #domusreport-widget-root trovato:', !!container);

if (!container) {
  console.error('❌ Container del widget NON trovato! Lo script potrebbe non essere caricato.');
  console.log('Verifica che ci sia questo script nella pagina:');
  console.log('<script src="https://domusreport.com/widget-embed.js?widgetId=XXX"></script>');
} else {
  console.log('✅ Container trovato');
}

// 2. Cerca il bottone bubble
console.log('\n🔘 2. CERCA BOTTONE BUBBLE');
let button = null;

// Prova diversi metodi per trovare il bottone
const methods = [
  { name: 'nextElementSibling', fn: () => container?.nextElementSibling },
  { name: 'querySelector DIV fixed', fn: () => document.querySelector('div[style*="position: fixed"][style*="bottom: 24px"]') },
  { name: 'all body children', fn: () => Array.from(document.body.children).find(el => {
    const style = window.getComputedStyle(el);
    return style.position === 'fixed' && el !== container && style.bottom === '24px';
  })},
  { name: 'by z-index 999998', fn: () => Array.from(document.querySelectorAll('*')).find(el => {
    const style = window.getComputedStyle(el);
    return style.zIndex === '999998';
  })},
  { name: 'by z-index 2147483647 (nuovo)', fn: () => Array.from(document.querySelectorAll('*')).find(el => {
    const style = window.getComputedStyle(el);
    return style.zIndex === '2147483647';
  })}
];

for (const method of methods) {
  const found = method.fn();
  console.log(`Metodo "${method.name}":`, found ? '✅ Trovato' : '❌ Non trovato', found);
  if (found && !button) button = found;
}

if (!button) {
  console.error('❌ BOTTONE NON TROVATO!');
  console.log('Il bottone potrebbe non essere stato creato. Controlla i log del widget.');
} else {
  console.log('✅ Bottone trovato:', button);

  // 3. Analizza posizione e stili bottone
  console.log('\n📐 3. ANALISI POSIZIONE E STILI BOTTONE');
  const rect = button.getBoundingClientRect();
  const styles = window.getComputedStyle(button);

  console.log('Posizione:', {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    right: rect.right,
    width: rect.width,
    height: rect.height
  });

  console.log('Stili critici:', {
    position: styles.position,
    zIndex: styles.zIndex,
    display: styles.display,
    visibility: styles.visibility,
    opacity: styles.opacity,
    pointerEvents: styles.pointerEvents,
    cursor: styles.cursor
  });

  // 4. Verifica se è coperto
  console.log('\n🎯 4. VERIFICA SE IL BOTTONE È COPERTO');
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const elementAtPoint = document.elementFromPoint(centerX, centerY);

  console.log('Centro bottone:', { x: centerX, y: centerY });
  console.log('Elemento al centro:', elementAtPoint);
  console.log('È il bottone?', elementAtPoint === button);
  console.log('È dentro il bottone?', button.contains(elementAtPoint));

  if (elementAtPoint !== button && !button.contains(elementAtPoint)) {
    console.error('❌ IL BOTTONE È COPERTO!');
    console.error('Elemento bloccante:', elementAtPoint);

    const blockingStyles = window.getComputedStyle(elementAtPoint);
    console.log('Stili elemento bloccante:', {
      tag: elementAtPoint.tagName,
      id: elementAtPoint.id,
      className: elementAtPoint.className,
      position: blockingStyles.position,
      zIndex: blockingStyles.zIndex,
      display: blockingStyles.display,
      pointerEvents: blockingStyles.pointerEvents,
      width: blockingStyles.width,
      height: blockingStyles.height
    });

    // Suggerimenti fix
    console.log('\n💡 SUGGERIMENTI FIX:');
    if (parseInt(blockingStyles.zIndex) >= parseInt(styles.zIndex)) {
      console.log('- Aumenta z-index del bottone oltre:', blockingStyles.zIndex);
    }
    if (blockingStyles.pointerEvents !== 'none') {
      console.log('- Imposta pointer-events: none sull\'elemento bloccante');
    }
  } else {
    console.log('✅ Il bottone NON è coperto');
  }
}

// 5. Lista TUTTI gli elementi fixed/absolute
console.log('\n📋 5. TUTTI GLI ELEMENTI FIXED/ABSOLUTE SULLA PAGINA');
const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
  const style = window.getComputedStyle(el);
  return style.position === 'fixed' || style.position === 'absolute';
});

console.log(`Trovati ${fixedElements.length} elementi:`);
fixedElements.forEach((el, index) => {
  const style = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  console.log(`${index + 1}. ${el.tagName}#${el.id || 'no-id'}.${el.className.substring(0, 30) || 'no-class'}`, {
    position: style.position,
    zIndex: style.zIndex,
    display: style.display,
    dimensions: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
    location: `top:${Math.round(rect.top)} left:${Math.round(rect.left)}`
  });
});

// 6. Test click simulation
console.log('\n🖱️ 6. TEST CLICK SIMULATION');
if (button) {
  console.log('Provo a simulare un click sul bottone...');

  // Aggiungi listener temporaneo
  const clickHandler = (e) => {
    console.log('✅ CLICK RICEVUTO!', e);
    console.log('Target:', e.target);
    console.log('CurrentTarget:', e.currentTarget);
  };

  button.addEventListener('click', clickHandler);

  // Simula click
  button.click();

  console.log('Se vedi "CLICK RICEVUTO" sopra, il bottone è funzionante!');
  console.log('Se NON lo vedi, il click è bloccato.');

  // Rimuovi listener
  setTimeout(() => button.removeEventListener('click', clickHandler), 100);
}

console.log('\n🔍 === FINE DEBUG ===');
console.log('Copia TUTTI questi log e inviali a Claude per l\'analisi!');
