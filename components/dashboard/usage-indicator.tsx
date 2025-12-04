'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, Users, Crown } from 'lucide-react'

interface UsageData {
  widgets: { current: number; limit: number; percentage: number }
  leads: { current: number; limit: number; percentage: number }
  planType: string
  hasAnalytics: boolean
  hasWhiteLabel: boolean
}

export function UsageIndicator() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/subscription/usage', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Errore fetch usage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !usage) return null

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPlanBadge = (planType: string) => {
    switch (planType) {
      case 'premium':
        return <Badge className="bg-purple-500"><Crown className="h-3 w-3 mr-1" />Premium</Badge>
      case 'basic':
        return <Badge className="bg-blue-500">Basic</Badge>
      default:
        return <Badge variant="secondary">Free</Badge>
    }
  }

  return (
    <Link href="/dashboard/subscription" className="block">
      <div className="px-4 py-3 border-t border-gray-200 space-y-3 hover:bg-gray-50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Piano</span>
          {getPlanBadge(usage.planType)}
        </div>

        {/* Widget usage */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-gray-600">
              <MessageSquare className="h-3 w-3" />
              Widget
            </span>
            <span className="text-gray-500">
              {usage.widgets.current}/{usage.widgets.limit}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getProgressColor(usage.widgets.percentage)} transition-all`}
              style={{ width: `${Math.min(100, usage.widgets.percentage)}%` }}
            />
          </div>
        </div>

        {/* Lead usage */}
        {usage.leads.limit > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-gray-600">
                <Users className="h-3 w-3" />
                Lead/mese
              </span>
              <span className="text-gray-500">
                {usage.leads.current}/{usage.leads.limit === -1 ? '∞' : usage.leads.limit}
              </span>
            </div>
            {usage.leads.limit !== -1 && (
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(usage.leads.percentage)} transition-all`}
                  style={{ width: `${Math.min(100, usage.leads.percentage)}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
