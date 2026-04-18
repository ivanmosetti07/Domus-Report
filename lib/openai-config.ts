/**
 * Configurazione centralizzata dei modelli OpenAI usati in tutto il progetto.
 *
 * Modello scelto: gpt-5-mini — miglior rapporto qualità/prezzo della serie
 * GPT-5 al knowledge cutoff (gennaio 2026). Veloce, costo contenuto, qualità
 * sufficiente per:
 *   - analisi testuale valutazione immobiliare (lib/openai.ts)
 *   - ricerca comparables via web_search_preview (lib/comparables/openai.ts)
 *   - conversazione chat widget (app/api/chat/route.ts)
 *
 * Override via env:
 *   - OPENAI_MODEL: modello principale (default: gpt-5-mini)
 *   - OPENAI_COMPARABLES_MODEL: modello specifico per ricerca comparables
 *     (default: stesso di OPENAI_MODEL). Utile se si vuole usare gpt-5 pieno
 *     solo per comparables che beneficiano di reasoning più forte.
 */

export const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini"

export const COMPARABLES_MODEL =
  process.env.OPENAI_COMPARABLES_MODEL || DEFAULT_OPENAI_MODEL
