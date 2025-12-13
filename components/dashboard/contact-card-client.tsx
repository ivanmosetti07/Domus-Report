"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, Copy } from "lucide-react"

interface ContactCardClientProps {
  nome: string
  cognome: string
  email: string
  telefono: string | null
}

export function ContactCardClient({
  nome,
  cognome,
  email,
  telefono,
}: ContactCardClientProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-primary" />
          Informazioni Contatto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
            Nome Completo
          </label>
          <p className="text-lg font-semibold text-foreground mt-1">
            {nome} {cognome}
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
            Email
          </label>
          <div className="flex items-center gap-2 mt-1">
            <a
              href={`mailto:${email}`}
              className="text-sm text-primary hover:underline"
            >
              {email}
            </a>
            <button
              onClick={() => handleCopy(email, "email")}
              className="text-foreground-muted hover:text-foreground"
            >
              {copiedField === "email" ? (
                <span className="text-xs text-success">✓</span>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {telefono && (
          <div>
            <label className="text-xs font-medium text-foreground-muted uppercase tracking-wide">
              Telefono
            </label>
            <div className="flex items-center gap-2 mt-1">
              <a
                href={`tel:${telefono}`}
                className="text-sm text-primary hover:underline"
              >
                {telefono}
              </a>
              <button
                onClick={() => handleCopy(telefono, "phone")}
                className="text-foreground-muted hover:text-foreground"
              >
                {copiedField === "phone" ? (
                  <span className="text-xs text-success">✓</span>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={`tel:${telefono}`}
                className="text-foreground-muted hover:text-foreground"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <a href={`mailto:${email}`}>
            <Button className="w-full">
              <Mail className="w-4 h-4 mr-2" />
              Invia Email
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
