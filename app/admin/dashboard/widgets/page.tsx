"use client"

import * as React from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Settings,
  Copy,
  Trash2,
  MessageSquare,
  Layout,
  Eye,
  BarChart3,
  Loader2,
  ExternalLink,
  Search,
  Building2,
  Check,
  TestTube,
} from "lucide-react"
import { WidgetConfigModal } from "@/components/dashboard/widget-config-modal"
import { EmbedCodeModal } from "@/components/dashboard/embed-code-modal"

const DOMUS_REPORT_DOMAIN = "domusreport.com"

function isDomusReportWidget(widget: WidgetData) {
  return widget.agency.email.toLowerCase().endsWith(`@${DOMUS_REPORT_DOMAIN}`)
}

interface WidgetData {
  id: string
  widgetId: string
  name: string
  mode: "bubble" | "inline"
  isActive: boolean
  isDefault: boolean
  themeName: string
  primaryColor: string
  impressions: number
  leadsGenerated: number
  createdAt: string
  agency: {
    id: string
    nome: string
    email: string
    piano: string
  }
}

interface AgencyOption {
  id: string
  nome: string
  email: string
}

export default function AdminWidgetsPage() {
  const [widgets, setWidgets] = React.useState<WidgetData[]>([])
  const [agencies, setAgencies] = React.useState<AgencyOption[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [filterAgency, setFilterAgency] = React.useState("all")

  // Modal states
  const [configModalOpen, setConfigModalOpen] = React.useState(false)
  const [embedModalOpen, setEmbedModalOpen] = React.useState(false)
  const [selectedWidget, setSelectedWidget] = React.useState<WidgetData | null>(null)
  const [createAgencyId, setCreateAgencyId] = React.useState("")
  const [showCreatePicker, setShowCreatePicker] = React.useState(false)
  const [success, setSuccess] = React.useState("")

  const showMsg = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(""), 4000)
  }

  const fetchWidgets = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/widgets")
      const data = await res.json()
      setWidgets(data.widgets || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAgencies = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/agencies?limit=500")
      const data = await res.json()
      setAgencies(
        (data.agencies || []).map((a: { id: string; nome: string; email: string }) => ({
          id: a.id,
          nome: a.nome,
          email: a.email,
        }))
      )
    } catch (err) {
      console.error(err)
    }
  }, [])

  React.useEffect(() => {
    fetchWidgets()
    fetchAgencies()
  }, [fetchWidgets, fetchAgencies])

  const handleToggleActive = async (widget: WidgetData) => {
    await fetch(`/api/admin/widgets/${widget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !widget.isActive }),
    })
    showMsg(widget.isActive ? "Widget disattivato" : "Widget attivato")
    fetchWidgets()
  }

  const handleDelete = async (widget: WidgetData) => {
    if (!confirm(`Eliminare il widget "${widget.name}"?`)) return
    await fetch(`/api/admin/widgets/${widget.id}`, { method: "DELETE" })
    showMsg("Widget eliminato")
    fetchWidgets()
  }

  const handleEdit = (widget: WidgetData) => {
    setSelectedWidget(widget)
    setConfigModalOpen(true)
  }

  const handleShowEmbed = (widget: WidgetData) => {
    setSelectedWidget(widget)
    setEmbedModalOpen(true)
  }

  const handleStartCreate = () => {
    setCreateAgencyId("")
    setShowCreatePicker(true)
  }

  const handleConfirmCreate = () => {
    if (!createAgencyId) return
    setShowCreatePicker(false)
    setSelectedWidget(null)
    setConfigModalOpen(true)
  }

  const handleSaveWidget = async (data: Record<string, unknown>) => {
    const isEdit = !!selectedWidget
    if (isEdit) {
      await fetch(`/api/admin/widgets/${selectedWidget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      showMsg("Widget aggiornato")
    } else {
      await fetch("/api/admin/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, agencyId: createAgencyId }),
      })
      showMsg("Widget creato")
    }
    setConfigModalOpen(false)
    fetchWidgets()
  }

  const domusWidgets = widgets.filter(isDomusReportWidget)
  const agencyWidgets = widgets.filter((w) => !isDomusReportWidget(w))

  const filterWidgets = (list: WidgetData[]) =>
    list.filter((w) => {
      const matchSearch =
        !search ||
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.widgetId.toLowerCase().includes(search.toLowerCase()) ||
        w.agency.nome.toLowerCase().includes(search.toLowerCase())
      const matchAgency = filterAgency === "all" || w.agency.id === filterAgency
      return matchSearch && matchAgency
    })

  const filteredDomus = filterWidgets(domusWidgets)
  const filteredAgency = filterWidgets(agencyWidgets)

  // Agenzie per il filtro: solo quelle pertinenti al tab attivo
  const [activeTab, setActiveTab] = React.useState("domus")
  const domusAgencies = agencies.filter((a) =>
    a.email.toLowerCase().endsWith(`@${DOMUS_REPORT_DOMAIN}`)
  )
  const externalAgencies = agencies.filter(
    (a) => !a.email.toLowerCase().endsWith(`@${DOMUS_REPORT_DOMAIN}`)
  )

  if (loading) {
    return (
      <div className="page-stack">
        <PageHeader title="Gestione Widget" subtitle="Tutti i widget delle agenzie" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  const renderWidgetGrid = (widgetList: WidgetData[], emptyMessage: string) => {
    if (widgetList.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-12 h-12 text-foreground-muted mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun widget trovato</h3>
            <p className="text-sm text-foreground-muted mb-4 text-center">
              {search || filterAgency !== "all"
                ? "Prova a modificare i filtri di ricerca"
                : emptyMessage}
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgetList.map((widget) => (
          <Card
            key={widget.id}
            className={`relative ${!widget.isActive ? "opacity-60" : ""}`}
          >
            {widget.isDefault && (
              <Badge className="absolute -top-2 -right-2 bg-primary text-white">
                Predefinito
              </Badge>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: widget.primaryColor + "20" }}
                  >
                    {widget.mode === "bubble" ? (
                      <MessageSquare className="w-5 h-5" style={{ color: widget.primaryColor }} />
                    ) : (
                      <Layout className="w-5 h-5" style={{ color: widget.primaryColor }} />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-base">{widget.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {widget.mode === "bubble" ? "Bubble" : "Inline"} • {widget.themeName}
                    </CardDescription>
                  </div>
                </div>
                <Switch
                  checked={widget.isActive}
                  onCheckedChange={() => handleToggleActive(widget)}
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Agency info */}
              <div className="flex items-center gap-2 text-xs text-foreground-muted bg-surface rounded-lg px-2 py-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate">{widget.agency.nome}</span>
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {widget.agency.piano}
                </Badge>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-foreground-muted">
                  <Eye className="w-4 h-4" />
                  <span>{widget.impressions?.toLocaleString() || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-foreground-muted">
                  <BarChart3 className="w-4 h-4" />
                  <span>{widget.leadsGenerated || 0} lead</span>
                </div>
              </div>

              {/* Color */}
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full border border-border"
                  style={{ backgroundColor: widget.primaryColor }}
                />
                <span className="text-xs text-foreground-muted font-mono">
                  {widget.primaryColor}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleShowEmbed(widget)}>
                  <Copy className="w-4 h-4 mr-1" />
                  Codice
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(widget)}>
                  <Settings className="w-4 h-4 mr-1" />
                  Modifica
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(widget)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>

              {/* Test link */}
              <a
                href={`/widget/${widget.widgetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Testa widget
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="page-stack">
      <PageHeader
        title="Gestione Widget"
        subtitle={`${widgets.length} widget totali`}
      />

      {success && (
        <div className="rounded-xl border border-success/40 bg-success/10 p-3 flex items-center gap-2">
          <Check className="h-4 w-4 text-success" />
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setSearch(""); setFilterAgency("all") }}>
        <TabsList>
          <TabsTrigger value="domus" className="gap-2">
            <TestTube className="w-4 h-4" />
            Domus Report
            <Badge variant="secondary" className="text-[10px] ml-1">{domusWidgets.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="agencies" className="gap-2">
            <Building2 className="w-4 h-4" />
            Agenzie Iscritte
            <Badge variant="secondary" className="text-[10px] ml-1">{agencyWidgets.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Tab Domus Report */}
        <TabsContent value="domus" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Cerca per nome o ID widget..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {domusAgencies.length > 1 && (
              <Select value={filterAgency} onValueChange={setFilterAgency}>
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Filtra per account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli account</SelectItem>
                  {domusAgencies.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button onClick={handleStartCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Widget
            </Button>
          </div>

          <p className="text-sm text-foreground-muted">
            Widget interni per test e demo. Condividili con chi vuole provare Domus Report.
          </p>

          {renderWidgetGrid(filteredDomus, "Crea il primo widget interno per test e demo")}
        </TabsContent>

        {/* Tab Agenzie Iscritte */}
        <TabsContent value="agencies" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <Input
                placeholder="Cerca per nome, ID o agenzia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAgency} onValueChange={setFilterAgency}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filtra per agenzia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le agenzie</SelectItem>
                {externalAgencies.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleStartCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Widget
            </Button>
          </div>

          {renderWidgetGrid(filteredAgency, "Nessun widget creato dalle agenzie")}
        </TabsContent>
      </Tabs>

      {/* Create agency picker modal */}
      {showCreatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Seleziona Agenzia
              </h3>
              <p className="text-sm text-foreground-muted">
                Per quale agenzia vuoi creare il widget?
              </p>
              <div className="space-y-2">
                <Label>Agenzia</Label>
                <Select value={createAgencyId} onValueChange={setCreateAgencyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona un'agenzia..." />
                  </SelectTrigger>
                  <SelectContent>
                    {(activeTab === "domus" ? domusAgencies : externalAgencies).length > 0
                      ? (activeTab === "domus" ? domusAgencies : externalAgencies).map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.nome} ({a.email})
                          </SelectItem>
                        ))
                      : agencies.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.nome} ({a.email})
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreatePicker(false)}>
                  Annulla
                </Button>
                <Button onClick={handleConfirmCreate} disabled={!createAgencyId}>
                  Continua
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Widget Config Modal */}
      <WidgetConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        widget={selectedWidget}
        plan="premium"
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
