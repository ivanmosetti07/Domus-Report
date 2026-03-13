import { AffiliateSidebar } from "@/components/affiliate/sidebar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AffiliateDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AffiliateSidebar />
      <main className="lg:pl-64">
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  )
}
