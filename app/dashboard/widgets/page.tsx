"use client"

import * as React from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Plus,
  Settings,
  Copy,
  Trash2,
  MessageSquare,
  Layout,
  Eye,
  BarChart3,
  Crown,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { getPlanLimits } from "@/lib/plan-limits"
import { WidgetConfigModal } from "@/components/dashboard/widget-config-modal"
import { EmbedCodeModal } from "@/components/dashboard/embed-code-modal"
import { useToast } from "@/hooks/use-toast"

interface WidgetConfig {
  id: string
  widgetId: string
  name: string
  mode: 'bubble' | 'inline'
  isActive: boolean
  isDefault: boolean
  themeName: string
  primaryColor: string
  impressions: number
  leadsGenerated: number
  createdAt: string
}

export default function WidgetsPage() {
  const [widgets, setWidgets] = React.useState<WidgetConfig[]>([])
  const [plan, setPlan] = React.useState<string>('free')
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Modal states
  const [configModalOpen, setConfigModalOpen] = React.useState(false)
  const [embedModalOpen, setEmbedModalOpen] = React.useState(false)
  const [selectedWidget, setSelectedWidget] = React.useState<WidgetConfig | null>(null)

  const { toast } = useToast()
  const limits = getPlanLimits(plan)

  // Fetch widgets
  const fetchWidgets = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/widget-config', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Errore nel caricamento dei widget')
      }

      const data = await response.json()
      setWidgets(data.widgetConfigs || [])
      setPlan(data.plan || 'free')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchWidgets()
  }, [fetchWidgets])

  // Toggle widget active state
  const handleToggleActive = async (widget: WidgetConfig) => {
    try {
      const response = await fetch('/api/widget-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: widget.id,
          isActive: !widget.isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Errore')
      }

      toast({
        title: widget.isActive ? 'Widget disattivato' : 'Widget attivato',
        description: `Il widget "${widget.name}" è stato ${widget.isActive ? 'disattivato' : 'attivato'}.`,
      })

      fetchWidgets()
    } catch (err) {
      toast({
        title: 'Errore',
        description: err instanceof Error ? err.message : 'Errore sconosciuto',
        variant: 'destructive',
      })
    }
  }

  // Delete widget
  const handleDelete = async (widget: WidgetConfig) => {
    if (!confirm(`Sei sicuro di voler eliminare il widget "${widget.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/widget-config?id=${widget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Errore')
      }

      toast({
        title: 'Widget eliminato',
        description: `Il widget "${widget.name}" è stato eliminato.`,
      })

      fetchWidgets()
    } catch (err) {
      toast({
        title: 'Errore',
        description: err instanceof Error ? err.message : 'Errore sconosciuto',
        variant: 'destructive',
      })
    }
  }

  // Set as default
  const handleSetDefault = async (widget: WidgetConfig) => {
    try {
      const response = await fetch('/api/widget-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: widget.id,
          isDefault: true,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Errore')
      }

      toast({
        title: 'Widget predefinito aggiornato',
        description: `"${widget.name}" è ora il widget predefinito.`,
      })

      fetchWidgets()
    } catch (err) {
      toast({
        title: 'Errore',
        description: err instanceof Error ? err.message : 'Errore sconosciuto',
        variant: 'destructive',
      })
    }
  }

  // Open create modal
  const handleCreate = () => {
    setSelectedWidget(null)
    setConfigModalOpen(true)
  }

  // Open edit modal
  const handleEdit = (widget: WidgetConfig) => {
    setSelectedWidget(widget)
    setConfigModalOpen(true)
  }

  // Open embed code modal
  const handleShowEmbed = (widget: WidgetConfig) => {
    setSelectedWidget(widget)
    setEmbedModalOpen(true)
  }

  // Handle modal save
  const handleSaveWidget = async (data: Partial<WidgetConfig>) => {
    try {
      const isEdit = !!selectedWidget
      const response = await fetch('/api/widget-config', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(isEdit ? { id: selectedWidget.id, ...data } : data),
      })

      if (!response.ok) {
        const responseData = await response.json()
        throw new Error(responseData.error || 'Errore')
      }

      toast({
        title: isEdit ? 'Widget aggiornato' : 'Widget creato',
        description: isEdit
          ? `Il widget "${data.name}" è stato aggiornato.`
          : `Il widget "${data.name}" è stato creato.`,
      })

      setConfigModalOpen(false)
      fetchWidgets()
    } catch (err) {
      toast({
        title: 'Errore',
        description: err instanceof Error ? err.message : 'Errore sconosciuto',
        variant: 'destructive',
      })
    }
  }

  const canCreateMore = widgets.filter(w => w.isActive).length < limits.maxWidgets

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="I tuoi Widget"
          subtitle="Gestisci i chatbot per il tuo sito web"
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="I tuoi Widget"
          subtitle="Gestisci i chatbot per il tuo sito web"
        />
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-4 p-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <div>
              <h3 className="font-semibold text-foreground">Errore nel caricamento</h3>
              <p className="text-sm text-foreground-muted">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={fetchWidgets}>
                Riprova
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="I tuoi Widget"
        subtitle="Gestisci i chatbot per il tuo sito web"
      />

      {/* Plan info */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant={plan === 'premium' ? 'default' : 'secondary'} className="text-sm">
            {plan === 'free' && 'Piano Free'}
            {plan === 'basic' && 'Piano Basic'}
            {plan === 'premium' && (
              <>
                <Crown className="w-3 h-3 mr-1" />
                Piano Premium
              </>
            )}
          </Badge>
          <span className="text-sm text-foreground-muted">
            {widgets.filter(w => w.isActive).length} / {limits.maxWidgets} widget
          </span>
        </div>

        <Button onClick={handleCreate} disabled={!canCreateMore}>
          <Plus className="w-4 h-4 mr-2" />
          Nuovo Widget
        </Button>
      </div>

      {/* Limit warning */}
      {!canCreateMore && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-4 p-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">
                Hai raggiunto il limite di widget per il tuo piano.
              </p>
              <p className="text-xs text-orange-700">
                Passa a un piano superiore per creare più widget.
              </p>
            </div>
            <Button variant="outline" size="sm" className="bg-white">
              Upgrade
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Widgets grid */}
      {widgets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-12 h-12 text-foreground-muted mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nessun widget configurato
            </h3>
            <p className="text-sm text-foreground-muted mb-4 text-center max-w-md">
              Crea il tuo primo widget per iniziare a raccogliere lead dal tuo sito web.
            </p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Crea il primo widget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <Card
              key={widget.id}
              className={`relative ${!widget.isActive ? 'opacity-60' : ''}`}
            >
              {/* Default badge */}
              {widget.isDefault && (
                <Badge
                  className="absolute -top-2 -right-2 bg-primary text-white"
                >
                  Predefinito
                </Badge>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: widget.primaryColor + '20' }}
                    >
                      {widget.mode === 'bubble' ? (
                        <MessageSquare
                          className="w-5 h-5"
                          style={{ color: widget.primaryColor }}
                        />
                      ) : (
                        <Layout
                          className="w-5 h-5"
                          style={{ color: widget.primaryColor }}
                        />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{widget.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {widget.mode === 'bubble' ? 'Bubble' : 'Inline'} • {widget.themeName}
                      </CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={widget.isActive}
                    onCheckedChange={() => handleToggleActive(widget)}
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-foreground-muted">
                    <Eye className="w-4 h-4" />
                    <span>{widget.impressions.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-foreground-muted">
                    <BarChart3 className="w-4 h-4" />
                    <span>{widget.leadsGenerated} lead</span>
                  </div>
                </div>

                {/* Color preview */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-card shadow"
                    style={{ backgroundColor: widget.primaryColor }}
                    title={widget.primaryColor}
                  />
                  <span className="text-xs text-foreground-muted font-mono">
                    {widget.primaryColor}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleShowEmbed(widget)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Codice
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(widget)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Modifica
                  </Button>
                  {!widget.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(widget)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>

                {/* Set as default */}
                {!widget.isDefault && widget.isActive && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => handleSetDefault(widget)}
                  >
                    Imposta come predefinito
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Widget Config Modal */}
      <WidgetConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        widget={selectedWidget}
        plan={plan}
        onSave={handleSaveWidget}
      />

      {/* Embed Code Modal */}
      <EmbedCodeModal
        open={embedModalOpen}
        onOpenChange={setEmbedModalOpen}
        widget={selectedWidget}
      />
    </div>
  )
}
