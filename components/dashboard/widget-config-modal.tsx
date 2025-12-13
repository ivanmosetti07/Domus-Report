"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MessageSquare, Layout, Palette, Settings2, Code, AlertTriangle, Lock, Upload, X, Loader2 } from "lucide-react"
import {
  themes,
  availableFonts,
  bubblePositions,
  bubbleAnimations,
  buttonStyles,
  inlineHeightPresets,
} from "@/lib/widget-themes"
import { canUseCustomBranding, canUseCustomCss } from "@/lib/plan-limits"
import { ChatWidget } from "@/components/widget/chat-widget"

interface WidgetConfig {
  id?: string
  widgetId?: string
  name: string
  mode: 'bubble' | 'inline'
  isActive?: boolean
  isDefault?: boolean
  themeName: string
  primaryColor: string
  secondaryColor?: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  borderRadius: string
  buttonStyle: string
  bubblePosition: string
  bubbleIcon?: string
  showBadge: boolean
  bubbleAnimation: string
  inlineHeight: string
  showHeader: boolean
  showBorder: boolean
  customCss?: string
  logoUrl?: string
}

interface WidgetConfigModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  widget: Partial<WidgetConfig> | null
  plan: string
  onSave: (data: Partial<WidgetConfig>) => Promise<void>
}

const defaultConfig: Omit<WidgetConfig, 'id' | 'widgetId'> = {
  name: '',
  mode: 'bubble',
  themeName: 'default',
  primaryColor: '#2563eb',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  borderRadius: '8px',
  buttonStyle: 'rounded',
  bubblePosition: 'bottom-right',
  showBadge: true,
  bubbleAnimation: 'pulse',
  inlineHeight: '600px',
  showHeader: true,
  showBorder: true,
}

export function WidgetConfigModal({
  open,
  onOpenChange,
  widget,
  plan,
  onSave,
}: WidgetConfigModalProps) {
  const [config, setConfig] = React.useState<Partial<WidgetConfig>>(defaultConfig)
  const [isSaving, setIsSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('general')
  const [isUploadingLogo, setIsUploadingLogo] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const isEdit = !!widget?.id
  const canBrand = canUseCustomBranding(plan)
  const canCustomCss = canUseCustomCss(plan)

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File troppo grande. Massimo 2MB.')
      return
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo file non supportato. Usa PNG, JPG, SVG o WebP.')
      return
    }

    setIsUploadingLogo(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        alert('Sessione non valida. Effettua nuovamente il login.')
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'widget')
      if (widget?.widgetId) {
        formData.append('widgetId', widget.widgetId)
      }

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Errore upload')
      }

      const data = await response.json()
      setConfig((prev) => ({ ...prev, logoUrl: data.url }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Errore durante upload')
    } finally {
      setIsUploadingLogo(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveLogo = () => {
    setConfig((prev) => ({ ...prev, logoUrl: undefined }))
  }

  // Reset form when widget changes
  React.useEffect(() => {
    if (widget) {
      setConfig({ ...defaultConfig, ...widget })
    } else {
      setConfig(defaultConfig)
    }
    setActiveTab('general')
  }, [widget, open])

  // Apply theme preset
  const handleThemeChange = (themeName: string) => {
    const theme = themes[themeName]
    if (theme) {
      setConfig((prev) => ({
        ...prev,
        themeName,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        backgroundColor: theme.backgroundColor,
        textColor: theme.textColor,
        fontFamily: theme.fontFamily,
        borderRadius: theme.borderRadius,
        buttonStyle: theme.buttonStyle,
        bubblePosition: theme.bubblePosition,
        bubbleAnimation: theme.bubbleAnimation,
      }))
    }
  }

  const handleSave = async () => {
    if (!config.name?.trim()) {
      return
    }

    setIsSaving(true)
    try {
      await onSave(config)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifica Widget' : 'Crea Nuovo Widget'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica le impostazioni del widget'
              : 'Configura il tuo nuovo widget chatbot'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                <span className="hidden sm:inline">Generale</span>
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Stile</span>
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                <span className="hidden sm:inline">Layout</span>
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                <span className="hidden sm:inline">Avanzate</span>
              </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Widget *</Label>
                <Input
                  id="name"
                  placeholder="es. Widget Homepage"
                  value={config.name || ''}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                />
                <p className="text-xs text-foreground-muted">
                  Un nome per identificare questo widget nella dashboard
                </p>
              </div>

              <div className="space-y-2">
                <Label>Tipo Widget *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      config.mode === 'bubble'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border'
                    }`}
                    onClick={() => setConfig({ ...config, mode: 'bubble' })}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <span className="font-medium">Bubble</span>
                    </div>
                    <p className="text-sm text-foreground-muted">
                      Bottone flottante in basso a destra che apre la chat
                    </p>
                  </button>

                  <button
                    type="button"
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      config.mode === 'inline'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border'
                    }`}
                    onClick={() => setConfig({ ...config, mode: 'inline' })}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Layout className="w-5 h-5 text-primary" />
                      <span className="font-medium">Inline</span>
                    </div>
                    <p className="text-sm text-foreground-muted">
                      Widget integrato direttamente nella pagina
                    </p>
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* Theme Tab */}
            <TabsContent value="theme" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Tema Predefinito</Label>
                <Select
                  value={config.themeName}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tema" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(themes).map(([key, theme]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          {theme.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Logo Upload */}
              <div className={`space-y-2 ${!canBrand ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <Label>Logo Widget</Label>
                  {!canBrand && (
                    <span className="text-xs text-orange-600 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Piano Basic+
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {config.logoUrl ? (
                    <div className="relative">
                      <img
                        src={config.logoUrl}
                        alt="Logo"
                        className="w-16 h-16 object-contain rounded-lg border border-border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        disabled={!canBrand}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`w-16 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center ${canBrand ? 'cursor-pointer hover:border-primary' : 'cursor-not-allowed'}`}
                      onClick={() => canBrand && fileInputRef.current?.click()}
                    >
                      {isUploadingLogo ? (
                        <Loader2 className="w-6 h-6 text-foreground-muted animate-spin" />
                      ) : (
                        <Upload className="w-6 h-6 text-foreground-muted" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!canBrand || isUploadingLogo}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Caricamento...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Carica Logo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-foreground-muted mt-1">
                      PNG, JPG, SVG o WebP. Max 2MB.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={!canBrand}
                  />
                </div>
              </div>

              {/* Custom colors - locked for free plan */}
              <div className={`space-y-4 ${!canBrand ? 'opacity-50' : ''}`}>
                {!canBrand && (
                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded text-sm text-orange-800">
                    <Lock className="w-4 h-4" />
                    Upgrade al piano Basic per personalizzare i colori
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Colore Primario</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={config.primaryColor || '#2563eb'}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                        disabled={!canBrand}
                      />
                      <Input
                        value={config.primaryColor || '#2563eb'}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        placeholder="#2563eb"
                        className="font-mono"
                        disabled={!canBrand}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Colore Sfondo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={config.backgroundColor || '#ffffff'}
                        onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                        disabled={!canBrand}
                      />
                      <Input
                        value={config.backgroundColor || '#ffffff'}
                        onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                        className="font-mono"
                        disabled={!canBrand}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="textColor">Colore Testo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={config.textColor || '#1f2937'}
                        onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                        disabled={!canBrand}
                      />
                      <Input
                        value={config.textColor || '#1f2937'}
                        onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                        placeholder="#1f2937"
                        className="font-mono"
                        disabled={!canBrand}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Font</Label>
                    <Select
                      value={config.fontFamily}
                      onValueChange={(value) => setConfig({ ...config, fontFamily: value })}
                      disabled={!canBrand}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona font" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFonts.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Stile Bottone</Label>
                  <div className="flex gap-2">
                    {buttonStyles.map((style) => (
                      <button
                        key={style.value}
                        type="button"
                        disabled={!canBrand}
                        className={`px-4 py-2 text-sm border rounded-lg transition-colors ${
                          config.buttonStyle === style.value
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-border hover:border-border'
                        } ${!canBrand ? 'cursor-not-allowed' : ''}`}
                        onClick={() => setConfig({ ...config, buttonStyle: style.value })}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-4 mt-4">
              {config.mode === 'bubble' ? (
                <>
                  <div className="space-y-2">
                    <Label>Posizione Bubble</Label>
                    <Select
                      value={config.bubblePosition}
                      onValueChange={(value) => setConfig({ ...config, bubblePosition: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona posizione" />
                      </SelectTrigger>
                      <SelectContent>
                        {bubblePositions.map((pos) => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Animazione</Label>
                    <Select
                      value={config.bubbleAnimation}
                      onValueChange={(value) => setConfig({ ...config, bubbleAnimation: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona animazione" />
                      </SelectTrigger>
                      <SelectContent>
                        {bubbleAnimations.map((anim) => (
                          <SelectItem key={anim.value} value={anim.value}>
                            {anim.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div>
                      <Label htmlFor="showBadge">Mostra Badge Notifica</Label>
                      <p className="text-xs text-foreground-muted">
                        Badge rosso con numero sopra il bottone
                      </p>
                    </div>
                    <Switch
                      id="showBadge"
                      checked={config.showBadge}
                      onCheckedChange={(checked) => setConfig({ ...config, showBadge: checked })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Altezza Widget</Label>
                    <Select
                      value={config.inlineHeight}
                      onValueChange={(value) => setConfig({ ...config, inlineHeight: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona altezza" />
                      </SelectTrigger>
                      <SelectContent>
                        {inlineHeightPresets.map((preset) => (
                          <SelectItem key={preset.value} value={preset.value}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div>
                      <Label htmlFor="showHeader">Mostra Header</Label>
                      <p className="text-xs text-foreground-muted">
                        Header con logo e titolo in alto
                      </p>
                    </div>
                    <Switch
                      id="showHeader"
                      checked={config.showHeader}
                      onCheckedChange={(checked) => setConfig({ ...config, showHeader: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div>
                      <Label htmlFor="showBorder">Mostra Bordo</Label>
                      <p className="text-xs text-foreground-muted">
                        Bordo visibile intorno al widget
                      </p>
                    </div>
                    <Switch
                      id="showBorder"
                      checked={config.showBorder}
                      onCheckedChange={(checked) => setConfig({ ...config, showBorder: checked })}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className={`space-y-2 ${!canCustomCss ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="customCss">CSS Personalizzato</Label>
                  {!canCustomCss && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Lock className="w-3 h-3" />
                      Piano Premium
                    </div>
                  )}
                </div>

                <Textarea
                  id="customCss"
                  placeholder=".widget-container { ... }"
                  value={config.customCss || ''}
                  onChange={(e) => setConfig({ ...config, customCss: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                  disabled={!canCustomCss}
                />

                {canCustomCss && (
                  <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded text-sm text-yellow-800">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Il CSS personalizzato può influenzare il layout del widget.
                      Usa con cautela.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Live Preview */}
          <div className="mt-6 border-t pt-6">
            <Label className="mb-4 block">Anteprima</Label>
            <div
              className="relative bg-surface rounded-lg p-4 overflow-hidden"
              style={{ height: config.mode === 'inline' ? '300px' : '200px' }}
            >
              {config.mode === 'bubble' ? (
                <div className="absolute bottom-4 right-4">
                  <button
                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 ${
                      config.bubbleAnimation === 'pulse' ? 'animate-pulse' : ''
                    } ${config.bubbleAnimation === 'bounce' ? 'animate-bounce' : ''}`}
                    style={{
                      background: `linear-gradient(135deg, ${config.primaryColor}, ${config.primaryColor}dd)`,
                    }}
                  >
                    <MessageSquare className="w-6 h-6 text-white" />
                    {config.showBadge && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-white font-bold">1</span>
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <div
                  className="h-full rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: config.backgroundColor,
                    border: config.showBorder ? '1px solid hsl(var(--border))' : 'none',
                  }}
                >
                  {config.showHeader && (
                    <div
                      className="px-4 py-3 flex items-center gap-3"
                      style={{
                        background: `linear-gradient(135deg, ${config.primaryColor}, ${config.primaryColor}dd)`,
                      }}
                    >
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <MessageSquare
                          className="w-4 h-4"
                          style={{ color: config.primaryColor }}
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">Valuta la tua casa</h3>
                        <p className="text-xs text-white/70">Ti rispondo in pochi secondi</p>
                      </div>
                    </div>
                  )}
                  <div
                    className="p-4 text-sm"
                    style={{ color: config.textColor, fontFamily: config.fontFamily }}
                  >
                    Anteprima widget inline...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !config.name?.trim()}>
            {isSaving ? 'Salvataggio...' : isEdit ? 'Salva Modifiche' : 'Crea Widget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
