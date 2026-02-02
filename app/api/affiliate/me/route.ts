import { NextResponse } from "next/server"
import { getAuthAffiliate } from "@/lib/auth-affiliate"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const affiliate = await getAuthAffiliate()

        if (!affiliate) {
            return NextResponse.json(
                { error: "Non autorizzato" },
                { status: 401 }
            )
        }

        // Get invited agencies with their subscription info
        const agencies = await prisma.agency.findMany({
            where: { affiliateId: affiliate.affiliateId },
            select: {
                id: true,
                nome: true,
                email: true,
                piano: true,
                dataCreazione: true,
                attiva: true,
                subscription: {
                    select: {
                        planType: true,
                        status: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { dataCreazione: "desc" },
        })

        // Calculate stats
        const totalReferrals = agencies.length
        const activeReferrals = agencies.filter(a => a.attiva).length
        const paidReferrals = agencies.filter(a =>
            a.subscription?.planType && a.subscription.planType !== "free"
        ).length

        return NextResponse.json({
            success: true,
            affiliate: {
                id: affiliate.affiliateId,
                nome: affiliate.nome,
                cognome: affiliate.cognome,
                email: affiliate.email,
                referralCode: affiliate.referralCode,
            },
            stats: {
                totalReferrals,
                activeReferrals,
                paidReferrals,
            },
            agencies,
        })
    } catch (error) {
        console.error("Affiliate me error:", error)

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Errore interno del server",
                success: false,
            },
            { status: 500 }
        )
    }
}
