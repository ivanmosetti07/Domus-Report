"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Check } from "lucide-react"

interface AffiliateProfile {
  id: string
  nome: string
  cognome: string
  email: string
  telefono: string | null
  dataCreazione: string
}

export default function AffiliateProfilePage() {
  const [profile, setProfile] = React.useState<AffiliateProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [saved, setSaved] = React.useState(false)
  const [error, setError] = React.useState("")
  const [formData, setFormData] = React.useState({
    nome: "",
    cognome: "",
    telefono: "",
  })

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("affiliate-token")
        const res = await fetch("/api/affiliate/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setProfile(data.affiliate)
          setFormData({
            nome: data.affiliate.nome,
            cognome: data.affiliate.cognome,
            telefono: data.affiliate.telefono || "",
          })
        }
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSaved(false)
    try {
      const token = localStorage.getItem("affiliate-token")
      const res = await fetch("/api/affiliate/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Errore nel salvataggio")
      } else {
        setProfile(data.affiliate)
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError("Errore di connessione")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="page-stack">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Profilo</h1>
        <p className="text-foreground-muted mt-1">Gestisci i tuoi dati personali</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informazioni personali
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email || ""} disabled />
              <p className="text-xs text-foreground-muted">L&apos;email non puo essere modificata</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cognome">Cognome</Label>
                <Input
                  id="cognome"
                  value={formData.cognome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cognome: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono (opzionale)</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
                placeholder="+39 333 123 4567"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button onClick={handleSave} loading={saving}>
              {saved ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Salvato!
                </>
              ) : (
                "Salva modifiche"
              )}
            </Button>

            {profile?.dataCreazione && (
              <p className="text-xs text-foreground-muted mt-4">
                Membro dal {new Date(profile.dataCreazione).toLocaleDateString("it-IT")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
