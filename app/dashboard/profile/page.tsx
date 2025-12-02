"use client"

import * as React from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function ProfilePage() {
  const [profileData, setProfileData] = React.useState({
    agencyName: "Immobiliare Roma Centro",
    email: "info@immobiliareroma.it",
    city: "Roma"
  })

  const [passwordData, setPasswordData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [loading, setLoading] = React.useState(false)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // TODO: API call to update profile
    setTimeout(() => {
      console.log("Profile updated:", profileData)
      setLoading(false)
      alert("Profilo aggiornato con successo!")
    }, 1000)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Le password non corrispondono")
      return
    }

    setLoading(true)

    // TODO: API call to update password
    setTimeout(() => {
      console.log("Password updated")
      setLoading(false)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      alert("Password aggiornata con successo!")
    }, 1000)
  }

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile."
    )

    if (confirmed) {
      // TODO: API call to delete account
      console.log("Account deleted")
      alert("Account eliminato")
    }
  }

  return (
    <div>
      <PageHeader
        title="Profilo Agenzia"
        subtitle="Gestisci le informazioni del tuo account"
      />

      <div className="max-w-2xl space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Agenzia</CardTitle>
            <CardDescription>
              Aggiorna i dati della tua agenzia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agencyName">Nome Agenzia</Label>
                <Input
                  id="agencyName"
                  value={profileData.agencyName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, agencyName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">
                  L'email non può essere modificata
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  value={profileData.city}
                  onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>

              <Button type="submit" loading={loading}>
                Salva Modifiche
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Cambia Password</CardTitle>
            <CardDescription>
              Aggiorna la tua password per mantenere l'account sicuro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Attuale</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nuova Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Minimo 8 caratteri"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma Nuova Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>

              <Button type="submit" loading={loading}>
                Aggiorna Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona Pericolosa
            </CardTitle>
            <CardDescription className="text-red-700">
              Azioni irreversibili sul tuo account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-red-800">
                Eliminare il tuo account rimuoverà permanentemente tutti i dati, inclusi i lead raccolti
                e le valutazioni generate. Questa azione non può essere annullata.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
              >
                Elimina Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
