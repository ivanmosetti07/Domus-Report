import { prisma } from "./prisma"
import { createLogger } from "./logger"

const logger = createLogger("lead-audit")

export interface LeadSubmissionAttemptInput {
  widgetId?: string | null
  agencyId?: string | null
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  status: "success" | "failed"
  errorCode?: string | null
  errorMessage?: string | null
  savedLeadId?: string | null
  httpStatus?: number | null
  ipAddress?: string | null
  bodySnapshot?: Record<string, unknown> | null
}

/**
 * Registra un tentativo di submission lead (sia successo che fallimento).
 * Non deve mai bloccare il flusso principale: ogni errore viene solo loggato.
 *
 * `bodySnapshot` viene sanificato dai campi sensibili (password, token, ecc.)
 * e limitato a ~4KB per evitare di saturare lo storage.
 */
export async function recordLeadSubmission(
  input: LeadSubmissionAttemptInput
): Promise<void> {
  try {
    const snapshot = input.bodySnapshot ? sanitizeBody(input.bodySnapshot) : null

    await prisma.leadSubmissionAttempt.create({
      data: {
        widgetId: input.widgetId ?? undefined,
        agencyId: input.agencyId ?? undefined,
        email: input.email ?? undefined,
        firstName: input.firstName ?? undefined,
        lastName: input.lastName ?? undefined,
        status: input.status,
        errorCode: input.errorCode ?? undefined,
        errorMessage: input.errorMessage ? input.errorMessage.slice(0, 500) : undefined,
        savedLeadId: input.savedLeadId ?? undefined,
        httpStatus: input.httpStatus ?? undefined,
        ipAddress: input.ipAddress ?? undefined,
        bodySnapshot: snapshot ? (snapshot as any) : undefined,
      },
    })
  } catch (err) {
    logger.error("Failed to record lead submission attempt", {
      error: err instanceof Error ? err.message : String(err),
    })
  }
}

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "apiKey",
  "authorization",
  "cookie",
])

function sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(body)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) continue
    // messaggi conversazione possono essere molto grandi → tronca
    if (key === "messages" && Array.isArray(value)) {
      clean[key] = { count: value.length, omitted: true }
      continue
    }
    clean[key] = value
  }
  const serialized = JSON.stringify(clean)
  if (serialized.length > 4000) {
    return { _truncated: true, _size: serialized.length, keys: Object.keys(clean) }
  }
  return clean
}
