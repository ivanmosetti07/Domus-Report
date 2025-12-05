import { Sidebar } from "@/components/dashboard/sidebar"
import { getAuthAgency } from "@/lib/auth"
import { redirect } from "next/navigation"

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get authenticated agency
  const agency = await getAuthAgency()

  // This should never happen because middleware protects this route
  // But we add it as a safety measure
  if (!agency) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar agencyName={agency.nome} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
