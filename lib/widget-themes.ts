// Widget Theme System
// Gestisce temi predefiniti e generazione CSS per i widget

export interface WidgetTheme {
  name: string
  label: string
  primaryColor: string
  secondaryColor?: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  borderRadius: string
  buttonStyle: 'flat' | 'rounded' | 'pill'
  bubblePosition: 'bottom-right' | 'bottom-left' | 'bottom-center'
  bubbleAnimation: 'pulse' | 'bounce' | 'none'
  sendButtonColor?: string
  sendButtonIconColor?: string
}

export const themes: Record<string, WidgetTheme> = {
  default: {
    name: 'default',
    label: 'Default',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    borderRadius: '8px',
    buttonStyle: 'rounded',
    bubblePosition: 'bottom-right',
    bubbleAnimation: 'pulse',
    sendButtonColor: '#2563eb',
    sendButtonIconColor: '#ffffff',
  },
  minimal: {
    name: 'minimal',
    label: 'Minimal',
    primaryColor: '#000000',
    secondaryColor: '#333333',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '4px',
    buttonStyle: 'flat',
    bubblePosition: 'bottom-right',
    bubbleAnimation: 'none',
    sendButtonColor: '#000000',
    sendButtonIconColor: '#ffffff',
  },
  modern: {
    name: 'modern',
    label: 'Modern',
    primaryColor: '#7c3aed',
    secondaryColor: '#5b21b6',
    backgroundColor: '#faf5ff',
    textColor: '#1e1b4b',
    fontFamily: 'Poppins, system-ui, sans-serif',
    borderRadius: '16px',
    buttonStyle: 'pill',
    bubblePosition: 'bottom-right',
    bubbleAnimation: 'bounce',
    sendButtonColor: '#7c3aed',
    sendButtonIconColor: '#ffffff',
  },
  elegant: {
    name: 'elegant',
    label: 'Elegante',
    primaryColor: '#0f766e',
    secondaryColor: '#115e59',
    backgroundColor: '#f0fdfa',
    textColor: '#134e4a',
    fontFamily: 'Georgia, serif',
    borderRadius: '12px',
    buttonStyle: 'rounded',
    bubblePosition: 'bottom-right',
    bubbleAnimation: 'pulse',
    sendButtonColor: '#0f766e',
    sendButtonIconColor: '#ffffff',
  },
  dark: {
    name: 'dark',
    label: 'Dark',
    primaryColor: '#3b82f6',
    secondaryColor: '#2563eb',
    backgroundColor: '#1f2937',
    textColor: '#f9fafb',
    fontFamily: 'system-ui, sans-serif',
    borderRadius: '8px',
    buttonStyle: 'rounded',
    bubblePosition: 'bottom-right',
    bubbleAnimation: 'pulse',
    sendButtonColor: '#3b82f6',
    sendButtonIconColor: '#ffffff',
  },
}

export interface CustomThemeColors {
  primaryColor?: string
  secondaryColor?: string
  backgroundColor?: string
  textColor?: string
}

/**
 * Genera le CSS variables per un tema
 */
export function getThemeCSSVariables(
  themeName: string,
  customColors?: CustomThemeColors
): Record<string, string> {
  const baseTheme = themes[themeName] || themes.default

  return {
    '--widget-primary': customColors?.primaryColor || baseTheme.primaryColor,
    '--widget-secondary': customColors?.secondaryColor || baseTheme.secondaryColor || baseTheme.primaryColor,
    '--widget-bg': customColors?.backgroundColor || baseTheme.backgroundColor,
    '--widget-text': customColors?.textColor || baseTheme.textColor,
    '--widget-font': baseTheme.fontFamily,
    '--widget-radius': baseTheme.borderRadius,
  }
}

/**
 * Genera una stringa CSS completa per il widget
 */
export function getThemeCSS(
  themeName: string,
  customColors?: CustomThemeColors,
  customCss?: string
): string {
  const variables = getThemeCSSVariables(themeName, customColors)
  const variablesCSS = Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n  ')

  let css = `
:root {
  ${variablesCSS}
}

.widget-container {
  background-color: var(--widget-bg);
  color: var(--widget-text);
  font-family: var(--widget-font);
}

.widget-header {
  background: linear-gradient(135deg, var(--widget-primary), var(--widget-secondary));
}

.widget-button {
  background-color: var(--widget-primary);
  border-radius: var(--widget-radius);
}

.widget-button:hover {
  background-color: var(--widget-secondary);
}

.widget-input {
  border-radius: var(--widget-radius);
  border-color: var(--widget-primary);
}

.widget-bubble {
  background: linear-gradient(135deg, var(--widget-primary), var(--widget-secondary));
}

.widget-message-bot {
  background-color: color-mix(in srgb, var(--widget-bg) 95%, var(--widget-text));
}

.widget-message-user {
  background-color: var(--widget-primary);
  color: white;
}
`

  // Aggiungi CSS custom (sanitizzato)
  if (customCss) {
    css += `\n/* Custom CSS */\n${sanitizeCSS(customCss)}`
  }

  return css
}

/**
 * Sanitizza CSS custom per prevenire XSS
 */
export function sanitizeCSS(css: string): string {
  if (!css) return ''

  // Rimuovi tag script e javascript
  let sanitized = css
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/eval\s*\(/gi, '')
    .replace(/url\s*\(\s*['"]?\s*data:/gi, 'url(data:')
    .replace(/@import/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/-moz-binding/gi, '')

  // Limita a 10000 caratteri
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000)
  }

  return sanitized
}

/**
 * Valida un colore HEX
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
}

/**
 * Font families disponibili
 */
export const availableFonts = [
  { value: 'system-ui, -apple-system, sans-serif', label: 'System Default' },
  { value: 'Inter, system-ui, sans-serif', label: 'Inter' },
  { value: 'Poppins, system-ui, sans-serif', label: 'Poppins' },
  { value: 'Roboto, system-ui, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, system-ui, sans-serif', label: 'Open Sans' },
  { value: 'Lato, system-ui, sans-serif', label: 'Lato' },
  { value: 'Georgia, serif', label: 'Georgia (Serif)' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
]

/**
 * Posizioni bubble disponibili
 */
export const bubblePositions = [
  { value: 'bottom-right', label: 'In basso a destra' },
  { value: 'bottom-left', label: 'In basso a sinistra' },
  { value: 'bottom-center', label: 'In basso al centro' },
]

/**
 * Animazioni bubble disponibili
 */
export const bubbleAnimations = [
  { value: 'pulse', label: 'Pulse' },
  { value: 'bounce', label: 'Bounce' },
  { value: 'none', label: 'Nessuna' },
]

/**
 * Stili bottone disponibili
 */
export const buttonStyles = [
  { value: 'flat', label: 'Piatto' },
  { value: 'rounded', label: 'Arrotondato' },
  { value: 'pill', label: 'Pillola' },
]

/**
 * Altezze inline preset
 */
export const inlineHeightPresets = [
  { value: '400px', label: 'Compatto (400px)' },
  { value: '600px', label: 'Standard (600px)' },
  { value: '800px', label: 'Grande (800px)' },
  { value: '100vh', label: 'Schermo intero' },
]
