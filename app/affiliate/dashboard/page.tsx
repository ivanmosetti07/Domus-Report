"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users,
    UserCheck,
    CreditCard,
    Copy,
    Check,
    LogOut,
    ExternalLink
} from "lucide-react"

interface Agency {
    id: string
    nome: string
    email: string
    piano: string
    dataCreazione: string
    attiva: boolean
    subscription: {
        planType: string
        status: string
        createdAt: string
    } | null
}

interface AffiliateData {
    id: string
    nome: string
    cognome: string
    email: string
    referralCode: string
}

interface Stats {
    totalReferrals: number
    activeReferrals: number
    paidReferrals: number
}

export default function AffiliateDashboardPage() {
    const router = useRouter()
    const [affiliate, setAffiliate] = React.useState<AffiliateData | null>(null)
    const [stats, setStats] = React.useState<Stats | null>(null)
    const [agencies, setAgencies] = React.useState<Agency[]>([])
    const [loading, setLoading] = React.useState(true)
    const [copied, setCopied] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const referralUrl = affiliate
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${affiliate.referralCode}`
        : ''

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await fetch("/api/affiliate/me")

            if (!response.ok) {
                if (response.status === 401) {
                    router.push("/affiliate/login")
                    return
                }
                throw new Error("Errore nel caricamento dei dati")
            }

            const data = await response.json()
            setAffiliate(data.affiliate)
            setStats(data.stats)
            setAgencies(data.agencies)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Errore sconosciuto")
        } finally {
            setLoading(false)
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(referralUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    const handleLogout = async () => {
        try {
            await fetch("/api/affiliate/logout", { method: "POST" })
            localStorage.removeItem("affiliate-token")
            router.push("/affiliate/login")
        } catch (err) {
            console.error("Logout error:", err)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    const getPlanBadgeClass = (plan: string) => {
        switch (plan?.toLowerCase()) {
            case "pro":
                return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "business":
                return "bg-purple-500/10 text-purple-500 border-purple-500/20"
            case "enterprise":
                return "bg-amber-500/10 text-amber-500 border-amber-500/20"
            default:
                return "bg-gray-500/10 text-gray-500 border-gray-500/20"
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-destructive text-center">{error}</p>
                        <Button onClick={() => router.push("/affiliate/login")} className="w-full mt-4">
                            Torna al login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-surface">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="font-semibold">Dashboard Affiliato</h1>
                            <p className="text-sm text-foreground-muted">
                                Ciao, {affiliate?.nome} {affiliate?.cognome}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Esci
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats?.totalReferrals ?? 0}</p>
                                    <p className="text-sm text-foreground-muted">Referral Totali</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <UserCheck className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats?.activeReferrals ?? 0}</p>
                                    <p className="text-sm text-foreground-muted">Referral Attivi</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                    <CreditCard className="h-6 w-6 text-purple-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats?.paidReferrals ?? 0}</p>
                                    <p className="text-sm text-foreground-muted">Referral a Pagamento</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Referral Link Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Il tuo Link di Referral</CardTitle>
                        <CardDescription>
                            Condividi questo link per invitare nuove agenzie. Riceverai una commissione per ogni agenzia che si registra tramite il tuo link.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                                {referralUrl}
                            </div>
                            <Button onClick={handleCopyLink} variant="outline">
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground-muted">
                            <span className="font-medium">Codice referral:</span>
                            <code className="px-2 py-1 bg-muted rounded">{affiliate?.referralCode}</code>
                        </div>
                    </CardContent>
                </Card>

                {/* Agencies Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Agenzie Invitate</CardTitle>
                        <CardDescription>
                            Lista delle agenzie che si sono registrate tramite il tuo link di referral
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {agencies.length === 0 ? (
                            <div className="text-center py-12 text-foreground-muted">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nessuna agenzia invitata ancora</p>
                                <p className="text-sm mt-2">Condividi il tuo link per iniziare!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 font-medium text-foreground-muted">Agenzia</th>
                                            <th className="text-left py-3 px-4 font-medium text-foreground-muted">Email</th>
                                            <th className="text-left py-3 px-4 font-medium text-foreground-muted">Piano</th>
                                            <th className="text-left py-3 px-4 font-medium text-foreground-muted">Data Registrazione</th>
                                            <th className="text-left py-3 px-4 font-medium text-foreground-muted">Stato</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agencies.map((agency) => (
                                            <tr key={agency.id} className="border-b border-border/50 hover:bg-muted/50">
                                                <td className="py-3 px-4 font-medium">{agency.nome}</td>
                                                <td className="py-3 px-4 text-foreground-muted">{agency.email}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPlanBadgeClass(agency.subscription?.planType || agency.piano)}`}>
                                                        {agency.subscription?.planType || agency.piano || "Free"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-foreground-muted">{formatDate(agency.dataCreazione)}</td>
                                                <td className="py-3 px-4">
                                                    {agency.attiva ? (
                                                        <span className="inline-flex items-center gap-1 text-green-500 text-sm">
                                                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                            Attiva
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-gray-500 text-sm">
                                                            <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                                                            Inattiva
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
