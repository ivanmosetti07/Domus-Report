/**
 * Configurazione centralizzata dei modelli OpenAI usati in tutto il progetto.
 *
 * Default: gpt-5-mini — serie GPT-5, variante "mini" ottimizzata per
 * velocità e costo contenuto. Qualità sufficiente per:
 *   - chat conversazionale (app/api/chat/route.ts)
 *   - analisi testuale valutazione (lib/openai.ts)
 *   - ricerca comparables via web_search_preview (lib/comparables/openai.ts)
 *
 * Motivo della scelta: gpt-5 flagship è un reasoning model molto lento
 * (>20s per turno), inadatto alla UX di una chat widget. gpt-5-mini ha
 * qualità molto vicina con latenza 3-5x inferiore.
 *
 * reasoning_effort "minimal" ulteriormente riduce il tempo: il modello
 * salta il ragionamento interno prolungato per task di estrazione dati
 * strutturati (come la nostra chat di qualificazione immobile).
 */

export const DEFAULT_OPENAI_MODEL = "gpt-5-mini"

export const COMPARABLES_MODEL = "gpt-5-mini"

/**
 * Livello di ragionamento interno per modelli GPT-5.
 *
 * - CHAT: "minimal" — risposta veloce (<5s tipico), la chat deve solo
 *   estrarre dati strutturati dal messaggio utente.
 *
 * - VALUATION: "low" — compromesso pragmatico. "medium"/"high" causavano
 *   timeout frequenti (server cap 60-90s, più web search comparables in
 *   parallelo). "low" garantisce AI analysis in 5-10s, quindi il totale
 *   /api/valuation resta sotto i 30s con alta affidabilità.
 */
export const REASONING_EFFORT_CHAT = "minimal" as const
export const REASONING_EFFORT_VALUATION = "low" as const
