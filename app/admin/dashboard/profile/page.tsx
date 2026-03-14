"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UserCog, Key, Users, Plus, Trash2, CheckCircle, Shield } from "lucide-react"

interface AdminProfile {
  id: string
  nome: string
  cognome: string
  email: string
  ruolo: string
  dataCreazione: string
}

interface AdminMember {
  id: string
  nome: string
  cognome: string
  email: string
  ruolo: string
  attivo: boolean
  dataCreazione: string
}

export default function AdminProfilePage() {
  const [profile, setProfile] = React.useState<AdminProfile | null>(null)
  const [members, setMembers] = React.useState<AdminMember[]>([])
  const [loading, setLoading] = React.useState(true)
  const [saveLoading, setSaveLoading] = React.useState(false)
  const [pwdLoading, setPwdLoading] = React.useState(false)
  const [memberLoading, setMemberLoading] = React.useState(false)
  const [success, setSuccess] = React.useState("")
  const [error, setError] = React.useState("")

  const [profileForm, setProfileForm] = React.useState({ nome: "", cognome: "" })
  const [pwdForm, setPwdForm] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [showAddMember, setShowAddMember] = React.useState(false)
  const [memberForm, setMemberForm] = React.useState({ nome: "", cognome: "", email: "", password: "" })

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setError(msg)
      setTimeout(() => setError(""), 5000)
    } else {
      setSuccess(msg)
      setTimeout(() => setSuccess(""), 5000)
    }
  }

  React.useEffect(() => {
    Promise.all([
      fetch("/api/admin/profile").then((r) => r.json()),
      fetch("/api/admin/members").then((r) => r.json()).catch(() => ({ members: [] })),
    ])
      .then(([profileData, membersData]) => {
        setProfile(profileData.admin)
        setProfileForm({ nome: profileData.admin.nome, cognome: profileData.admin.cognome })
        setMembers(membersData.members || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (data.success) {
        setProfile((p) => (p ? { ...p, ...data.admin } : p))
        showMessage("Profilo aggiornato con successo")
      } else {
        showMessage(data.error || "Errore", true)
      }
    } catch {
      showMessage("Errore di connessione", true)
    } finally {
      setSaveLoading(false)
    }
  }

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      showMessage("Le password non coincidono", true)
      return
    }
    if (pwdForm.newPassword.length < 8) {
      showMessage("La password deve essere di almeno 8 caratteri", true)
      return
    }
    setPwdLoading(true)
    try {
      const res = await fetch("/api/admin/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwdForm.currentPassword,
          newPassword: pwdForm.newPassword,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        showMessage("Password aggiornata con successo")
      } else {
        showMessage(data.error || "Errore", true)
      }
    } catch {
      showMessage("Errore di connessione", true)
    } finally {
      setPwdLoading(false)
    }
  }

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setMemberLoading(true)
    try {
      const res = await fetch("/api/admin/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberForm),
      })
      const data = await res.json()
      if (data.success) {
        setMembers((m) => [...m, data.member])
        setMemberForm({ nome: "", cognome: "", email: "", password: "" })
        setShowAddMember(false)
        showMessage("Admin aggiunto con successo")
      } else {
        showMessage(data.error || "Errore", true)
      }
    } catch {
      showMessage("Errore di connessione", true)
    } finally {
      setMemberLoading(false)
    }
  }

  const removeMember = async (id: string) => {
    if (!confirm("Sei sicuro di voler rimuovere questo admin?")) return
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        setMembers((m) => m.filter((a) => a.id !== id))
        showMessage("Admin rimosso")
      } else {
        showMessage(data.error || "Errore", true)
      }
    } catch {
      showMessage("Errore di connessione", true)
    }
  }

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader title="Profilo & Team" />
        <div className="h-64 bg-surface-2 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Profilo & Team"
        subtitle="Gestisci il tuo profilo e i membri del team admin"
      />

      {success && (
        <div className="rounded-xl border border-success/40 bg-success/10 p-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-success" />
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Informazioni Personali */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCog className="h-5 w-5 text-primary" />
              Informazioni Personali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={profileForm.nome}
                  onChange={(e) => setProfileForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Cognome</Label>
                <Input
                  value={profileForm.cognome}
                  onChange={(e) => setProfileForm((f) => ({ ...f, cognome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email || ""} disabled className="opacity-60" />
                <p className="text-xs text-foreground-muted">L'email non può essere modificata</p>
              </div>
              <div className="space-y-2">
                <Label>Ruolo</Label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium capitalize">{profile?.ruolo}</span>
                </div>
              </div>
              <Button type="submit" loading={saveLoading}>
                Salva Modifiche
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Cambia Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-5 w-5 text-primary" />
              Cambia Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Password Attuale</Label>
                <Input
                  type="password"
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label>Nuova Password</Label>
                <Input
                  type="password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm((f) => ({ ...f, newPassword: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label>Conferma Nuova Password</Label>
                <Input
                  type="password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" loading={pwdLoading}>
                Aggiorna Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Team Admin (solo superadmin) */}
      {profile?.ruolo === "superadmin" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-primary" />
              Team Admin ({members.length})
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddMember(true)}>
              <Plus className="h-4 w-4 mr-2" /> Aggiungi
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Nome</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Email</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Ruolo</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground-muted">Data</th>
                    <th className="text-right p-4 text-sm font-medium text-foreground-muted">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id} className="border-b border-border">
                      <td className="p-4 text-sm font-medium">{m.nome} {m.cognome}</td>
                      <td className="p-4 text-sm text-foreground-muted">{m.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          m.ruolo === "superadmin" ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"
                        }`}>
                          {m.ruolo}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-foreground-muted">
                        {new Date(m.dataCreazione).toLocaleDateString("it-IT")}
                      </td>
                      <td className="p-4 text-right">
                        {m.id !== profile?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(m.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Aggiungi Admin
              </h3>
              <form onSubmit={addMember} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input
                      value={memberForm.nome}
                      onChange={(e) => setMemberForm((f) => ({ ...f, nome: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cognome</Label>
                    <Input
                      value={memberForm.cognome}
                      onChange={(e) => setMemberForm((f) => ({ ...f, cognome: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm((f) => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={memberForm.password}
                    onChange={(e) => setMemberForm((f) => ({ ...f, password: e.target.value }))}
                    required
                    minLength={8}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" type="button" onClick={() => setShowAddMember(false)}>
                    Annulla
                  </Button>
                  <Button type="submit" loading={memberLoading}>
                    Aggiungi
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
