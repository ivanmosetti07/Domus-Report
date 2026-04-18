/**
 * Configurazione centralizzata dei modelli OpenAI usati in tutto il progetto.
 *
 * Modello scelto: gpt-5 — flagship della serie GPT-5, più aggiornato al
 * knowledge cutoff (gennaio 2026). Usato per:
 *   - conversazione chat widget (app/api/chat/route.ts)
 *   - analisi testuale valutazione (lib/openai.ts)
 *   - ricerca comparables via web_search_preview (lib/comparables/openai.ts)
 */

export const DEFAULT_OPENAI_MODEL = "gpt-5"

export const COMPARABLES_MODEL = "gpt-5"
