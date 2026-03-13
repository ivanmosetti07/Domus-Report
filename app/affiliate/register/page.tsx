"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Users, Eye, EyeOff } from "lucide-react"

export default function AffiliateRegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    nome: "",
    cognome: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nome.trim()) newErrors.nome = "Il nome e obbligatorio"
    if (!formData.cognome.trim()) newErrors.cognome = "Il cognome e obbligatorio"
    if (!formData.email.trim()) newErrors.email = "L'email e obbligatoria"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email non valida"
    if (!formData.password) newErrors.password = "La password e obbligatoria"
    else if (formData.password.length < 8) newErrors.password = "Minimo 8 caratteri"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Le password non corrispondono"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    try {
      const regResponse = await fetch("/api/affiliate/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          cognome: formData.cognome,
          email: formData.email,
          password: formData.password,
        }),
      })

      const regData = await regResponse.json()

      if (!regResponse.ok) {
        setErrors({ general: regData.error || "Errore durante la registrazione" })
        setLoading(false)
        return
      }

      // Auto-login
      const loginResponse = await fetch("/api/affiliate/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        if (loginData.token) {
          localStorage.setItem("affiliate-token", loginData.token)
        }
        router.push("/affiliate/dashboard")
      } else {
        router.push("/affiliate/login?message=Registrazione completata. Effettua il login.")
      }
    } catch {
      setErrors({ general: "Errore di connessione. Riprova." })
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Users className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold">Programma Affiliati</h1>
          <p className="text-sm text-foreground-muted">Registrati e inizia a guadagnare il 10% ricorrente</p>
        </div>

        <Card className="border-border bg-surface">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crea il tuo account</CardTitle>
            <CardDescription>Registrazione gratuita in 1 minuto</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{errors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Mario"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className={errors.nome ? "border-destructive" : ""}
                  />
                  {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cognome">Cognome</Label>
                  <Input
                    id="cognome"
                    placeholder="Rossi"
                    value={formData.cognome}
                    onChange={(e) => setFormData(prev => ({ ...prev, cognome: e.target.value }))}
                    className={errors.cognome ? "border-destructive" : ""}
                  />
                  {errors.cognome && <p className="text-sm text-destructive">{errors.cognome}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@esempio.it"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? "border-destructive" : ""}
                  autoComplete="email"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimo 8 caratteri"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Conferma Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Ripeti la password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Registrati Gratis
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-foreground-muted">
              Hai gia un account?{" "}
              <Link href="/affiliate/login" className="text-primary font-medium hover:underline">
                Accedi qui
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-foreground-muted">
          <Link href="/affiliate" className="inline-flex items-center gap-1 hover:text-foreground">
            &larr; Torna alla pagina affiliati
          </Link>
        </div>
      </div>
    </div>
  )
}
