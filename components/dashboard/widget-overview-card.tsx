import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, Settings, BarChart3, Eye, MessageSquare, Circle } from "lucide-react"

interface WidgetOverviewCardProps {
  widgets: Array<{
    id: string
    name: string
    widgetId: string
    mode: string
    isActive: boolean
    impressions: number
    leadsGenerated: number
  }>
}

export function WidgetOverviewCard({ widgets }: WidgetOverviewCardProps) {
  if (widgets.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
              <Code className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nessun widget configurato
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Crea il tuo primo widget per iniziare a raccogliere lead
              </p>
              <Link href="/dashboard/widgets">
                <Button>
                  <Code className="w-4 h-4 mr-2" />
                  Crea Widget
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Widget Configurati
        </h2>
        <Link href="/dashboard/widgets">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Gestisci Widget
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((widget) => (
          <Card key={widget.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">
                    {widget.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    ID: {widget.widgetId.substring(0, 8)}...
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={widget.mode === 'bubble' ? 'default' : 'secondary'} className="text-xs">
                    {widget.mode === 'bubble' ? 'Bubble' : 'Inline'}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Circle
                      className={`w-2 h-2 fill-current ${widget.isActive ? 'text-green-500' : 'text-gray-400'}`}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Impressioni</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {widget.impressions.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Lead</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {widget.leadsGenerated}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <Link href={`/dashboard/widgets?id=${widget.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Code className="w-3 h-3 mr-1" />
                    Codice
                  </Button>
                </Link>
                <Link href={`/dashboard/analytics?widget=${widget.widgetId}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <BarChart3 className="w-3 h-3 mr-1" />
                    Stats
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add new widget CTA */}
      <div className="mt-4">
        <Link href="/dashboard/widgets?new=true">
          <Button variant="outline" className="w-full border-dashed border-2">
            <Code className="w-4 h-4 mr-2" />
            Crea Nuovo Widget
          </Button>
        </Link>
      </div>
    </div>
  )
}
