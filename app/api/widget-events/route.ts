import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Event types allowed (string union)
const eventTypes = [
  "OPEN",
  "CLOSE",
  "MESSAGE",
  "VALUATION_VIEW",
  "CONTACT_FORM_START",
  "CONTACT_FORM_SUBMIT",
] as const

// Validation schema
const eventSchema = z.object({
  widgetId: z.string().min(1, "widgetId is required"),
  eventType: z.enum(eventTypes),
  leadId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Batch events schema
const batchEventsSchema = z.object({
  events: z.array(eventSchema).min(1).max(100), // Max 100 eventi per batch
})

// Rate limiting in-memory store (in produzione usare Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Rate limit: 1000 eventi/giorno per widgetId
const RATE_LIMIT_MAX = 1000
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000 // 24 ore in ms

function checkRateLimit(widgetId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitStore.get(widgetId)

  if (!record || now > record.resetAt) {
    // Nuovo window o reset
    rateLimitStore.set(widgetId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count }
}

/**
 * POST /api/widget-events
 * Traccia singolo evento o batch di eventi widget
 *
 * Body (singolo):
 * {
 *   widgetId: string,
 *   eventType: "OPEN" | "CLOSE" | "MESSAGE" | "VALUATION_VIEW" | "CONTACT_FORM_START" | "CONTACT_FORM_SUBMIT",
 *   leadId?: string,
 *   metadata?: { [key: string]: any }
 * }
 *
 * Body (batch):
 * {
 *   events: [{ widgetId, eventType, leadId?, metadata? }, ...]
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Verifica se è batch o singolo evento
    const isBatch = Array.isArray(body.events)

    if (isBatch) {
      // Valida batch
      const validation = batchEventsSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Dati batch non validi",
            details: validation.error.issues,
          },
          { status: 400 }
        )
      }

      const { events } = validation.data

      // Verifica che tutti i widgetId esistano e rate limit
      const widgetIds = [...new Set(events.map((e) => e.widgetId))]

      for (const widgetId of widgetIds) {
        // Verifica esistenza widget
        const agency = await prisma.agency.findUnique({
          where: { widgetId },
          select: { id: true },
        })

        if (!agency) {
          return NextResponse.json(
            {
              success: false,
              error: `Widget non trovato: ${widgetId}`,
            },
            { status: 404 }
          )
        }

        // Check rate limit
        const eventsForWidget = events.filter((e) => e.widgetId === widgetId).length
        const rateLimit = checkRateLimit(widgetId)

        if (!rateLimit.allowed || rateLimit.remaining < eventsForWidget) {
          return NextResponse.json(
            {
              success: false,
              error: "Rate limit superato. Max 1000 eventi/giorno per widget",
              remaining: rateLimit.remaining,
            },
            { status: 429 }
          )
        }
      }

      // Salva tutti gli eventi in batch
      await prisma.widgetEvent.createMany({
        data: events.map((event) => ({
          widgetId: event.widgetId,
          leadId: event.leadId ?? undefined,
          eventType: event.eventType,
          metadata: event.metadata ?? undefined,
          createdAt: new Date(),
        })),
      })

      return NextResponse.json({
        success: true,
        message: `${events.length} eventi salvati con successo`,
        count: events.length,
      })
    } else {
      // Valida singolo evento
      const validation = eventSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Dati evento non validi",
            details: validation.error.issues,
          },
          { status: 400 }
        )
      }

      const { widgetId, eventType, leadId, metadata } = validation.data

      // Verifica che il widgetId esista
      const agency = await prisma.agency.findUnique({
        where: { widgetId },
        select: { id: true },
      })

      if (!agency) {
        return NextResponse.json(
          {
            success: false,
            error: "Widget non trovato",
          },
          { status: 404 }
        )
      }

      // Check rate limit
      const rateLimit = checkRateLimit(widgetId)
      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: "Rate limit superato. Max 1000 eventi/giorno",
            remaining: 0,
          },
          { status: 429 }
        )
      }

      // Salva evento nel database
      await prisma.widgetEvent.create({
        data: {
          widgetId,
          leadId: leadId ?? undefined,
          eventType,
          metadata: metadata ?? undefined,
          createdAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: "Evento salvato con successo",
        remaining: rateLimit.remaining,
      })
    }
  } catch (error) {
    console.error("Error saving widget event:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Errore interno del server",
      },
      { status: 500 }
    )
  }
}
