"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Shield, Smartphone, Monitor, Chrome, AlertTriangle, Clock, MapPin } from "lucide-react"

interface Session {
  id: string
  ipAddress: string | null
  userAgent: string | null
  loginAt: string
  expiresAt: string
  lastActivityAt: string
  isCurrent: boolean
}

export default function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Non sei autenticato",
        })
        return
      }

      const response = await fetch("/api/auth/sessions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Errore nel caricamento delle sessioni")
      }

      const data = await response.json()
      setSessions(data.sessions)
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile caricare le sessioni attive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const revokeSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/auth/sessions?sessionId=${sessionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Errore nella revoca della sessione")
      }

      toast({
        title: "Successo",
        description: "Sessione revocata con successo",
      })

      // Reload sessions
      fetchSessions()
    } catch (error) {
      console.error("Error revoking session:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile revocare la sessione",
      })
    }
  }

  const revokeAllSessions = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/auth/sessions?all=true", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Errore nella revoca delle sessioni")
      }

      toast({
        title: "Successo",
        description: "Tutte le altre sessioni sono state revocate",
      })

      // Reload sessions
      fetchSessions()
    } catch (error) {
      console.error("Error revoking all sessions:", error)
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Impossibile revocare tutte le sessioni",
      })
    }
  }

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return <Monitor className="h-5 w-5" />

    const ua = userAgent.toLowerCase()
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return <Smartphone className="h-5 w-5" />
    }
    return <Monitor className="h-5 w-5" />
  }

  const getBrowserName = (userAgent: string | null) => {
    if (!userAgent) return "Sconosciuto"

    const ua = userAgent.toLowerCase()
    if (ua.includes("chrome")) return "Chrome"
    if (ua.includes("safari")) return "Safari"
    if (ua.includes("firefox")) return "Firefox"
    if (ua.includes("edge")) return "Edge"
    return "Browser sconosciuto"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Adesso"
    if (minutes < 60) return `${minutes} minuti fa`
    if (hours < 24) return `${hours} ore fa`
    return `${days} giorni fa`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Caricamento...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto" style={{
      padding: 'var(--space-lg)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-lg)'
    }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center" style={{ gap: 'var(--space-2)' }}>
            <Shield className="h-8 w-8" />
            Sicurezza e Sessioni
          </h1>
          <p className="text-muted-foreground" style={{ marginTop: 'var(--space-2)' }}>
            Gestisci le sessioni attive del tuo account
          </p>
        </div>
        {sessions.length > 1 && (
          <Button variant="destructive" onClick={revokeAllSessions}>
            <AlertTriangle className="h-4 w-4" style={{ marginRight: 'var(--space-2)' }} />
            Revoca tutte le altre sessioni
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessioni Attive ({sessions.length})</CardTitle>
          <CardDescription>
            Tutte le sessioni attualmente autenticate al tuo account. Puoi revocare sessioni
            sospette in qualsiasi momento.
          </CardDescription>
        </CardHeader>
        <CardContent style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessuna sessione attiva
            </div>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className={session.isCurrent ? "border-primary" : ""}>
                <CardContent style={{ paddingTop: 'var(--space-lg)' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex" style={{ gap: 'var(--space-md)' }}>
                      <div style={{ marginTop: 'var(--space-1)' }}>{getDeviceIcon(session.userAgent)}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                          <h3 className="font-semibold">
                            {getBrowserName(session.userAgent)}
                          </h3>
                          {session.isCurrent && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                              Sessione corrente
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                            <MapPin className="h-4 w-4" />
                            <span>IP: {session.ipAddress || "Sconosciuto"}</span>
                          </div>
                          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                            <Clock className="h-4 w-4" />
                            <span>Login: {formatDate(session.loginAt)}</span>
                          </div>
                          <div className="flex items-center" style={{ gap: 'var(--space-2)' }}>
                            <Clock className="h-4 w-4" />
                            <span>
                              Ultima attività: {getRelativeTime(session.lastActivityAt)}
                            </span>
                          </div>
                          <div className="text-xs">
                            Scadenza: {formatDate(session.expiresAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeSession(session.id)}
                      >
                        Revoca
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informazioni di Sicurezza</CardTitle>
        </CardHeader>
        <CardContent className="text-sm" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="flex" style={{ gap: 'var(--space-2)' }}>
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div>
              <strong>Sessioni sospette?</strong> Se vedi sessioni che non riconosci, revocale
              immediatamente e cambia la password.
            </div>
          </div>
          <div className="flex" style={{ gap: 'var(--space-2)' }}>
            <Shield className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <strong>Protezione automatica:</strong> Le sessioni scadono automaticamente dopo
              7 giorni di inattività.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
