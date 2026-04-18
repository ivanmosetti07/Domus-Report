import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"
import { calculateValuationLocal, type ValuationInput } from "@/lib/valuation"
import {
  searchComparables,
  crossCheckWithOMI,
  applyComparablesRefinement,
  isComparablesEnabled,
} from "@/lib/comparables"
import { PropertyType, PropertyCondition, OccupancyStatus } from "@/types"

function toPropertyType(s: string | null | undefined): PropertyType {
  return (s && Object.values(PropertyType).includes(s as PropertyType)
    ? s
    : PropertyType.APARTMENT) as PropertyType
}

function toPropertyCondition(s: string | null | undefined): PropertyCondition {
  return (s && Object.values(PropertyCondition).includes(s as PropertyCondition)
    ? s
    : PropertyCondition.GOOD) as PropertyCondition
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAdmin(request)
  if (authResult instanceof NextResponse) return authResult

  const { id: leadId } = await params

  const { searchParams } = new URL(request.url)
  const skipComparables = searchParams.get("skipComparables") === "true"

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { property: { include: { valuation: true } } },
  })

  if (!lead || !lead.property || !lead.property.valuation) {
    return NextResponse.json(
      { error: "Lead/property/valuation non trovati" },
      { status: 404 }
    )
  }

  const p = lead.property
  const v = p.valuation!

  const input: ValuationInput = {
    address: p.indirizzo,
    city: p.citta,
    neighborhood: p.quartiere ?? undefined,
    postalCode: p.cap ?? undefined,
    latitude: p.latitudine ?? undefined,
    longitude: p.longitudine ?? undefined,
    propertyType: toPropertyType(p.tipo),
    surfaceSqm: p.superficieMq,
    floor: p.piano ?? undefined,
    hasElevator: p.ascensore ?? undefined,
    condition: toPropertyCondition(p.stato),
    energyClass: p.classeEnergetica ?? undefined,
    buildYear: p.annoCostruzione ?? undefined,
    hasParking: p.postoAuto ?? undefined,
    outdoorSpace: p.spaziEsterni ?? undefined,
    heatingType: p.riscaldamento ?? undefined,
    rooms: p.locali ?? undefined,
    bathrooms: p.bagni ?? undefined,
    occupancyStatus: (p.statoOccupazione ?? undefined) as OccupancyStatus | string | undefined,
  }

  let valuation = calculateValuationLocal(input)

  if (valuation.omiZoneMatch === "not_found" || valuation.estimatedPrice <= 0) {
    return NextResponse.json(
      {
        error: "Motore non ha prodotto prezzi validi",
        omiZoneMatch: valuation.omiZoneMatch,
      },
      { status: 422 }
    )
  }

  // Comparables reali (se abilitati)
  let comparablesResult = null
  let crossCheck = null
  const wantComparables = !skipComparables && isComparablesEnabled()

  if (wantComparables) {
    try {
      const result = await searchComparables({
        city: p.citta,
        neighborhood: p.quartiere ?? undefined,
        postalCode: p.cap ?? undefined,
        propertyType: input.propertyType,
        surfaceSqm: p.superficieMq,
        condition: input.condition,
        rooms: p.locali ?? undefined,
      })
      if (result && result.sampleSize >= 2) {
        comparablesResult = result
        crossCheck = crossCheckWithOMI(valuation.pricePerSqm, result)
        valuation = applyComparablesRefinement(
          valuation,
          result,
          crossCheck,
          p.superficieMq
        )
      }
    } catch (err) {
      console.warn("[recalculate] comparables error:", err)
    }
  }

  const previousSnapshot = {
    prezzoMinimo: v.prezzoMinimo,
    prezzoMassimo: v.prezzoMassimo,
    prezzoStimato: v.prezzoStimato,
    valoreOmiBase: v.valoreOmiBase,
    pricePerSqm: v.pricePerSqm,
    confidence: v.confidence,
  }

  const updated = await prisma.valuation.update({
    where: { id: v.id },
    data: {
      prezzoMinimo: valuation.minPrice,
      prezzoMassimo: valuation.maxPrice,
      prezzoStimato: valuation.estimatedPrice,
      valoreOmiBase: valuation.baseOMIValue,
      coefficientePiano: valuation.floorCoefficient,
      coefficienteStato: valuation.conditionCoefficient,
      spiegazione: valuation.explanation,
      confidence: valuation.confidence,
      confidenceScore: valuation.confidenceScore,
      warnings: valuation.warnings as any,
      omiZoneMatch: valuation.omiZoneMatch,
      dataCompleteness: valuation.dataCompleteness,
      pricePerSqm: valuation.pricePerSqm,
      comparablesData: comparablesResult
        ? ({
            provider: comparablesResult.provider,
            sampleSize: comparablesResult.sampleSize,
            medianPricePerSqm: comparablesResult.medianPricePerSqm,
            avgPricePerSqm: comparablesResult.avgPricePerSqm,
            minPricePerSqm: comparablesResult.minPricePerSqm,
            maxPricePerSqm: comparablesResult.maxPricePerSqm,
            items: comparablesResult.comparables,
            crossCheck,
          } as any)
        : undefined,
      dataCalcolo: new Date(),
    },
  })

  return NextResponse.json({
    success: true,
    leadId,
    previous: previousSnapshot,
    current: {
      prezzoMinimo: updated.prezzoMinimo,
      prezzoMassimo: updated.prezzoMassimo,
      prezzoStimato: updated.prezzoStimato,
      valoreOmiBase: updated.valoreOmiBase,
      pricePerSqm: updated.pricePerSqm,
      confidence: updated.confidence,
      omiZoneMatch: updated.omiZoneMatch,
    },
    comparables: comparablesResult
      ? {
          enabled: true,
          provider: comparablesResult.provider,
          sampleSize: comparablesResult.sampleSize,
          medianPricePerSqm: comparablesResult.medianPricePerSqm,
          crossCheck,
        }
      : { enabled: false, reason: wantComparables ? "no_results" : "disabled" },
  })
}
