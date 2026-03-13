"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Users, Eye, EyeOff } from "lucide-react"

export default function AffiliateLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = React.useState({ email: "", password: "" })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [loading, setLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) newErrors.email = "L'email e obbligatoria"
    if (!formData.password) newErrors.password = "La password e obbligatoria"

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setLoading(true)

    try {
      const response = await fetch("/api/affiliate/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || "Email o password errati" })
        setLoading(false)
        return
      }

      if (data.token) {
        localStorage.setItem("affiliate-token", data.token)
      }

      router.push("/affiliate/dashboard")
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
          <p className="text-sm text-foreground-muted">Accedi al tuo pannello affiliato</p>
        </div>

        <Card className="border-border bg-surface">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Accedi</CardTitle>
            <CardDescription>Inserisci le tue credenziali affiliato</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors.general && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3">
                  <p className="text-sm text-destructive">{errors.general}</p>
                </div>
              )}

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
                    placeholder="La tua password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className={errors.password ? "border-destructive pr-10" : "pr-10"}
                    autoComplete="current-password"
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

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Accedi
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-foreground-muted">
              Non hai un account?{" "}
              <Link href="/affiliate/register" className="text-primary font-medium hover:underline">
                Registrati gratis
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
