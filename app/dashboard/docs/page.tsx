"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Code2, Globe, FileText, Zap, ArrowRight, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  const guides = [
    {
      title: "Integrazione HTML",
      description: "Guida completa per integrare il widget con HTML puro e JavaScript",
      icon: Code2,
      href: "/docs/html",
      features: ["Quick start", "Upload FTP", "Best practices", "Troubleshooting"],
      color: "from-primary to-primary-hover"
    },
    {
      title: "WordPress",
      description: "Installazione su WordPress con plugin, editor tema e page builder",
      icon: Globe,
      href: "/docs/wordpress",
      features: ["Plugin personalizzato", "Elementor, Divi, WPBakery", "Editor Gutenberg", "Widget areas"],
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Webflow",
      description: "Integrazione su Webflow con Custom Code ed Embed Element",
      icon: Zap,
      href: "/docs/webflow",
      features: ["Custom Code", "Embed Element", "CMS Collection", "Best practices"],
      color: "from-purple-500 to-purple-600"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-b from-surface to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary to-primary-hover rounded-2xl shadow-glow-primary">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Documentazione
              </h1>
              <p className="text-lg text-foreground-muted mt-2">
                Guide complete per integrare DomusReport sul tuo sito
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        <Card className="mb-12 border-border bg-card">
          <CardHeader className="bg-gradient-to-r from-surface via-surface-2 to-surface border-b border-border">
            <CardTitle className="text-2xl text-foreground">Benvenuto nella Documentazione</CardTitle>
            <CardDescription className="text-foreground-muted text-base">
              Scegli la guida più adatta alla tua piattaforma per iniziare a raccogliere lead in pochi minuti
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Installazione Rapida</p>
                  <p className="text-sm text-foreground-muted">Inizia in meno di 5 minuti</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Supporto Completo</p>
                  <p className="text-sm text-foreground-muted">Esempi e troubleshooting</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Sempre Aggiornato</p>
                  <p className="text-sm text-foreground-muted">Best practices moderne</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const Icon = guide.icon
            return (
              <Card
                key={guide.title}
                className="border-border bg-card hover:bg-surface transition-all duration-300 hover:shadow-soft-lg group"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${guide.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-foreground">{guide.title}</CardTitle>
                  <CardDescription className="text-foreground-muted">
                    {guide.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {guide.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground-muted">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={guide.href}>
                    <Button
                      className="w-full bg-primary hover:bg-primary-hover text-primary-foreground group/btn"
                    >
                      Vai alla guida
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Links */}
        <Card className="mt-12 border-border bg-card">
          <CardHeader className="bg-gradient-to-r from-surface via-surface-2 to-surface border-b border-border">
            <CardTitle className="text-xl text-foreground">Link Rapidi</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/dashboard/widgets">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border hover:border-primary hover:bg-surface"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Gestione Widget
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="w-full justify-start border-border hover:border-primary hover:bg-surface"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Torna alla Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-foreground-muted text-sm">
            Hai bisogno di aiuto? Contattaci per supporto personalizzato
          </p>
        </div>
      </div>
    </div>
  )
}
