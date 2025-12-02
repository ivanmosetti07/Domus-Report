import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: Get agency name from session/auth
  const agencyName = "Immobiliare Roma Centro"

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar agencyName={agencyName} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
