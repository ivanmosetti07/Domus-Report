"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Building2, Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    agencyName: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    termsAccepted: false
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [passwordStrength, setPasswordStrength] = React.useState<'weak' | 'medium' | 'strong' | null>(null)

  const calculatePasswordStrength = (password: string) => {
    if (password.length < 8) return 'weak'
    if (password.length >= 8 && password.length < 12) return 'medium'
    if (password.length >= 12) return 'strong'
    return null
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value
    setFormData(prev => ({ ...prev, password }))
    setPasswordStrength(calculatePasswordStrength(password))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.agencyName.trim()) {
      newErrors.agencyName = "Il nome dell'agenzia è obbligatorio"
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email è obbligatoria"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Inserisci un'email valida"
    }

    if (!formData.password) {
      newErrors.password = "La password è obbligatoria"
    } else if (formData.password.length < 8) {
      newErrors.password = "La password deve essere di almeno 8 caratteri"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Conferma la password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Le password non corrispondono"
    }

    if (!formData.city.trim()) {
      newErrors.city = "La città è obbligatoria"
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "Devi accettare i termini e condizioni"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.agencyName,
          email: formData.email,
          password: formData.password,
          citta: formData.city,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || "Errore durante la registrazione" })
        setLoading(false)
        return
      }

      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        if (loginData.token) {
          localStorage.setItem('token', loginData.token)
        }
        router.push("/onboarding/plan")
      } else {
        router.push("/login?message=Registrazione completata. Effettua il login.")
      }
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ general: "Errore di connessione. Riprova." })
      setLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return 'bg-border'
    if (passwordStrength === 'weak') return 'bg-destructive'
    if (passwordStrength === 'medium') return 'bg-warning'
    return 'bg-success'
  }

  const passwordStrengthWidth = passwordStrength === 'weak'
    ? '33%'
    : passwordStrength === 'medium'
    ? '66%'
    : passwordStrength === 'strong'
    ? '100%'
    : '0%'

  return (
    <div className="auth-shell">
      <div className="auth-card space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">DomusReport</h1>
          <p className="text-sm text-foreground-muted">Inizia a generare lead qualificati dalla tua dashboard</p>
        </div>

        <Card className="border-border bg-surface">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crea il tuo account</CardTitle>
            <CardDescription>Setup guidato in meno di due minuti</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{errors.general}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="agencyName">Nome Agenzia</Label>
                <Input
                  id="agencyName"
                  placeholder="es. Immobiliare Roma Centro"
                  value={formData.agencyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, agencyName: e.target.value }))}
                  className={errors.agencyName ? "border-destructive" : ""}
                />
                {errors.agencyName && <p className="text-sm text-destructive">{errors.agencyName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@tuaagenzia.it"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crea una password sicura"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="h-2 rounded-full bg-border/40">
                  <div className={`h-full rounded-full transition-all ${getPasswordStrengthColor()}`} style={{ width: passwordStrengthWidth }}></div>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ripeti la password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  placeholder="es. Roma"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className={errors.city ? "border-destructive" : ""}
                />
                {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                  className="mt-1 rounded border-border bg-transparent text-primary focus:ring-primary"
                />
                <Label htmlFor="termsAccepted" className="text-sm font-normal cursor-pointer text-foreground-muted">
                  Accetto i <Link href="/terms" className="text-primary hover:underline">Termini e condizioni</Link> e la <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </Label>
              </div>
              {errors.termsAccepted && <p className="text-sm text-destructive">{errors.termsAccepted}</p>}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Crea account gratuito
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-foreground-muted">
              Hai già un account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Accedi qui
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-foreground-muted">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-foreground">
            ← Torna alla home
          </Link>
        </div>
      </div>
    </div>
  )
}
