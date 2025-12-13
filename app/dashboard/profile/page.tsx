"use client"

import * as React from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Upload, X, User } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function ProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = React.useState(false)
  const [uploadingLogo, setUploadingLogo] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Profile Data
  const [profileData, setProfileData] = React.useState({
    nome: "",
    email: "",
    citta: "",
    telefono: "",
    indirizzo: "",
    sitoWeb: "",
    partitaIva: "",
    logoUrl: null as string | null,
    dataCreazione: "",
    piano: "basic" as "free" | "basic" | "premium"
  })

  // Brand Colors
  const [brandColors, setBrandColors] = React.useState({
    primary: "#2563eb",
    secondary: "#64748b",
    accent: "#f59e0b"
  })

  // Preferences
  const [preferences, setPreferences] = React.useState({
    timeZone: "Europe/Rome",
    language: "it",
    dateFormat: "DD/MM/YYYY"
  })

  // Password Data
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  // Fetch profile data on mount
  React.useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('[Profile] No token found')
          return
        }

        console.log('[Profile] Loading profile data...')

        // Carica profilo
        const profileResponse = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        console.log('[Profile] Profile response status:', profileResponse.status)

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          console.log('[Profile] Profile data received:', profileData)

          if (profileData.profile) {
            const newProfileData = {
              nome: profileData.profile.nome,
              email: profileData.profile.email,
              citta: profileData.profile.citta,
              telefono: profileData.profile.telefono || "",
              indirizzo: profileData.profile.indirizzo || "",
              sitoWeb: profileData.profile.sitoWeb || "",
              partitaIva: profileData.profile.partitaIva || "",
              logoUrl: profileData.profile.logoUrl,
              dataCreazione: new Date(profileData.profile.dataCreazione).toLocaleDateString('it-IT'),
              piano: profileData.profile.piano
            }
            console.log('[Profile] Setting profile data:', newProfileData)
            setProfileData(newProfileData)
          }
        } else {
          console.error('[Profile] Profile response not ok:', await profileResponse.text())
        }

        // Carica impostazioni (brandColors e preferences)
        const settingsResponse = await fetch('/api/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          if (settingsData.settings) {
            // Carica brandColors se presenti
            if (settingsData.settings.brandColors) {
              setBrandColors(settingsData.settings.brandColors)
            }

            // Carica preferences
            setPreferences({
              timeZone: settingsData.settings.timeZone || "Europe/Rome",
              language: settingsData.settings.language || "it",
              dateFormat: settingsData.settings.dateFormat || "DD/MM/YYYY"
            })
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }
    loadProfile()
  }, [])

  // Logo Upload Handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo file non supportato",
        description: "Usa PNG, JPG, SVG o WebP",
        variant: "destructive"
      })
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "Il logo deve essere massimo 2MB",
        variant: "destructive"
      })
      return
    }

    setUploadingLogo(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'agency')

      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore upload')
      }

      setProfileData(prev => ({ ...prev, logoUrl: data.url }))
      toast({
        title: "Logo caricato",
        description: "Il tuo logo è stato aggiornato con successo"
      })
    } catch (error) {
      toast({
        title: "Errore upload",
        description: error instanceof Error ? error.message : "Riprova più tardi",
        variant: "destructive"
      })
    } finally {
      setUploadingLogo(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Remove Logo Handler
  const handleRemoveLogo = async () => {
    if (!profileData.logoUrl) return

    setUploadingLogo(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/upload/logo?logoUrl=${encodeURIComponent(profileData.logoUrl)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore eliminazione')
      }

      setProfileData(prev => ({ ...prev, logoUrl: null }))
      toast({
        title: "Logo rimosso",
        description: "Il logo è stato eliminato"
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Riprova più tardi",
        variant: "destructive"
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  // Profile Submit Handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: profileData.nome,
          citta: profileData.citta,
          telefono: profileData.telefono,
          indirizzo: profileData.indirizzo,
          sitoWeb: profileData.sitoWeb,
          partitaIva: profileData.partitaIva
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore aggiornamento')
      }

      console.log('[Profile] Save response:', data)

      // Aggiorna lo stato con i dati restituiti dall'API
      if (data.profile) {
        const updatedData = {
          ...profileData,
          nome: data.profile.nome,
          citta: data.profile.citta,
          telefono: data.profile.telefono || "",
          indirizzo: data.profile.indirizzo || "",
          sitoWeb: data.profile.sitoWeb || "",
          partitaIva: data.profile.partitaIva || ""
        }
        console.log('[Profile] Updating state with:', updatedData)
        setProfileData(updatedData)
      }

      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo"
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Riprova più tardi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Brand Colors Submit Handler
  const handleBrandColorsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ brandColors })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore aggiornamento')
      }

      // Aggiorna lo stato con i dati restituiti dall'API
      if (data.settings?.brandColors) {
        setBrandColors(data.settings.brandColors)
      }

      toast({
        title: "Colori salvati",
        description: "I colori del brand sono stati aggiornati"
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Riprova più tardi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Preferences Submit Handler
  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore aggiornamento')
      }

      // Aggiorna lo stato con i dati restituiti dall'API
      if (data.settings) {
        setPreferences({
          timeZone: data.settings.timeZone || preferences.timeZone,
          language: data.settings.language || preferences.language,
          dateFormat: data.settings.dateFormat || preferences.dateFormat
        })
      }

      toast({
        title: "Preferenze salvate",
        description: "Le tue preferenze sono state aggiornate"
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Riprova più tardi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Password Submit Handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate password length
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password troppo corta",
        description: "La password deve avere almeno 8 caratteri",
        variant: "destructive"
      })
      return
    }

    // Validate password complexity
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword)
    const hasNumber = /[0-9]/.test(passwordData.newPassword)

    if (!hasUpperCase || !hasNumber) {
      toast({
        title: "Password non sicura",
        description: "La password deve contenere almeno una maiuscola e un numero",
        variant: "destructive"
      })
      return
    }

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password non corrispondono",
        description: "Le due password inserite non coincidono",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore cambio password')
      }

      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      toast({
        title: "Password aggiornata",
        description: "La tua password è stata cambiata con successo"
      })
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Riprova più tardi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Delete Account Handler
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile e comporterà la perdita di tutti i dati, inclusi i lead raccolti e le valutazioni generate."
    )

    if (!confirmed) return

    const doubleCheck = window.prompt(
      'Digita "ELIMINA" per confermare la cancellazione definitiva del tuo account:'
    )

    if (doubleCheck !== "ELIMINA") {
      toast({
        title: "Operazione annullata",
        description: "L'account non è stato eliminato"
      })
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Errore eliminazione account')
      }

      // Clear local storage and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    } catch (error) {
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Riprova più tardi",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  // Get initials for logo fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div>
      <PageHeader
        title="Profilo Agenzia"
        subtitle="Gestisci le informazioni del tuo account e personalizza il tuo brand"
      />

      <div className="max-w-3xl space-y-6">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Logo Agenzia</CardTitle>
            <CardDescription>
              Carica il logo della tua agenzia (max 2MB, formati: PNG, JPG, SVG, WebP)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              {/* Logo Preview */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-surface-2 flex items-center justify-center overflow-hidden border-2 border-border">
                  {profileData.logoUrl ? (
                    <Image
                      src={profileData.logoUrl}
                      alt="Logo agenzia"
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  ) : (
                    <div className="text-2xl font-semibold text-foreground-muted">
                      {getInitials(profileData.nome)}
                    </div>
                  )}
                </div>
                {profileData.logoUrl && (
                  <button
                    onClick={handleRemoveLogo}
                    disabled={uploadingLogo}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                    title="Rimuovi logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="w-full sm:w-auto"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingLogo ? "Caricamento..." : profileData.logoUrl ? "Cambia Logo" : "Carica Logo"}
                </Button>
                <p className="text-xs text-foreground-muted">
                  Il logo verrà visualizzato nel widget e nelle comunicazioni con i clienti
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Agenzia *</Label>
                  <Input
                    id="nome"
                    value={profileData.nome}
                    onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                    className="bg-surface-2 cursor-not-allowed"
                  />
                  <p className="text-xs text-foreground-muted">
                    L'email non può essere modificata
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="citta">Città *</Label>
                  <Input
                    id="citta"
                    value={profileData.citta}
                    onChange={(e) => setProfileData(prev => ({ ...prev, citta: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={profileData.telefono}
                    onChange={(e) => setProfileData(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="+39 06 1234567"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="indirizzo">Indirizzo</Label>
                  <Input
                    id="indirizzo"
                    value={profileData.indirizzo}
                    onChange={(e) => setProfileData(prev => ({ ...prev, indirizzo: e.target.value }))}
                    placeholder="Via Roma 123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sitoWeb">Sito Web</Label>
                  <Input
                    id="sitoWeb"
                    type="url"
                    value={profileData.sitoWeb}
                    onChange={(e) => setProfileData(prev => ({ ...prev, sitoWeb: e.target.value }))}
                    placeholder="https://tuosito.it"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partitaIva">Partita IVA</Label>
                  <Input
                    id="partitaIva"
                    value={profileData.partitaIva}
                    onChange={(e) => setProfileData(prev => ({ ...prev, partitaIva: e.target.value }))}
                    placeholder="IT12345678901"
                  />
                </div>
              </div>

              <Button type="submit" loading={loading}>
                Salva Modifiche
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Brand Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Colori Brand</CardTitle>
            <CardDescription>
              Personalizza i colori del tuo brand per il widget e la dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBrandColorsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Colore Primario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={brandColors.primary}
                      onChange={(e) => setBrandColors(prev => ({ ...prev, primary: e.target.value }))}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={brandColors.primary}
                      onChange={(e) => setBrandColors(prev => ({ ...prev, primary: e.target.value }))}
                      className="flex-1"
                      placeholder="#2563eb"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Colore Secondario</Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={brandColors.secondary}
                      onChange={(e) => setBrandColors(prev => ({ ...prev, secondary: e.target.value }))}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={brandColors.secondary}
                      onChange={(e) => setBrandColors(prev => ({ ...prev, secondary: e.target.value }))}
                      className="flex-1"
                      placeholder="#64748b"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accentColor">Colore Accento</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accentColor"
                      type="color"
                      value={brandColors.accent}
                      onChange={(e) => setBrandColors(prev => ({ ...prev, accent: e.target.value }))}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={brandColors.accent}
                      onChange={(e) => setBrandColors(prev => ({ ...prev, accent: e.target.value }))}
                      className="flex-1"
                      placeholder="#f59e0b"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 border rounded-lg bg-surface-2">
                <p className="text-sm font-medium text-foreground mb-3">Anteprima:</p>
                <div className="flex gap-3">
                  <div
                    className="w-16 h-16 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: brandColors.primary }}
                  >
                    P
                  </div>
                  <div
                    className="w-16 h-16 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: brandColors.secondary }}
                  >
                    S
                  </div>
                  <div
                    className="w-16 h-16 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: brandColors.accent }}
                  >
                    A
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" loading={loading}>
                  Salva Colori
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBrandColors({ primary: "#2563eb", secondary: "#64748b", accent: "#f59e0b" })}
                >
                  Ripristina Default
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferenze</CardTitle>
            <CardDescription>
              Configura le tue preferenze di sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePreferencesSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeZone">Timezone</Label>
                  <Select
                    value={preferences.timeZone}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, timeZone: value }))}
                  >
                    <SelectTrigger id="timeZone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Rome">Europa/Roma (GMT+1)</SelectItem>
                      <SelectItem value="Europe/London">Europa/Londra (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New York (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Lingua</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Formato Data</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) => setPreferences(prev => ({ ...prev, dateFormat: value }))}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" loading={loading}>
                Salva Preferenze
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Cambia Password</CardTitle>
            <CardDescription>
              Aggiorna la tua password per mantenere l'account sicuro. La password deve avere almeno 8 caratteri, una maiuscola e un numero.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Password Attuale *</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nuova Password *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Minimo 8 caratteri, 1 maiuscola, 1 numero"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma Nuova Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>

              <Button type="submit" loading={loading}>
                Aggiorna Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Account</CardTitle>
            <CardDescription>
              Dettagli del tuo account e piano attivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground-muted">Data Registrazione</p>
                <p className="font-medium text-foreground">{profileData.dataCreazione}</p>
              </div>
              <div>
                <p className="text-sm text-foreground-muted">Piano Attuale</p>
                <p className="font-medium text-foreground capitalize">{profileData.piano}</p>
              </div>
            </div>
            <Link href="/dashboard/subscription">
              <Button variant="outline" className="w-full sm:w-auto">
                Gestisci Abbonamento
              </Button>
            </Link>
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
                Eliminare il tuo account rimuoverà permanentemente tutti i dati, inclusi i lead raccolti,
                le valutazioni generate, le configurazioni del widget e lo storico delle conversazioni.
                Questa azione non può essere annullata.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={loading}
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
