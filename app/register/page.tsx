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

    // TODO: API call to /api/auth/register
    // Simulazione registrazione
    setTimeout(() => {
      console.log("Registrazione:", formData)
      setLoading(false)
      router.push("/dashboard")
    }, 1500)
  }

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return 'bg-gray-200'
    if (passwordStrength === 'weak') return 'bg-red-500'
    if (passwordStrength === 'medium') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DomusReport</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Crea il tuo account</CardTitle>
            <CardDescription>Inizia a generare lead in 2 minuti</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="agencyName">Nome Agenzia</Label>
                <Input
                  id="agencyName"
                  placeholder="es. Immobiliare Roma Centro"
                  value={formData.agencyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, agencyName: e.target.value }))}
                  className={errors.agencyName ? "border-red-500" : ""}
                />
                {errors.agencyName && (
                  <p className="text-sm text-red-500">{errors.agencyName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@tuaagenzia.it"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimo 8 caratteri"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <div className={`h-1 flex-1 rounded ${getPasswordStrengthColor()}`} />
                      <div className={`h-1 flex-1 rounded ${passwordStrength !== 'weak' ? getPasswordStrengthColor() : 'bg-gray-200'}`} />
                      <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? getPasswordStrengthColor() : 'bg-gray-200'}`} />
                    </div>
                    <p className="text-xs text-gray-600">
                      {passwordStrength === 'weak' && 'Debole'}
                      {passwordStrength === 'medium' && 'Media'}
                      {passwordStrength === 'strong' && 'Forte'}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
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
                    className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  placeholder="es. Milano"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                  className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                  Accetto i{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    termini e condizioni
                  </Link>
                </Label>
              </div>
              {errors.termsAccepted && (
                <p className="text-sm text-red-500">{errors.termsAccepted}</p>
              )}

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Crea Account Gratis
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-600">
              Hai già un account?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Accedi
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-gray-500 mt-4">
          Creando un account accetti i nostri{" "}
          <Link href="/terms" className="underline">
            Termini di Servizio
          </Link>{" "}
          e{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
