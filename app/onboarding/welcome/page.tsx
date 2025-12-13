import { redirect } from "next/navigation"
import { getAuthAgency } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { WelcomeChecklist } from "@/components/onboarding/welcome-checklist"

export default async function OnboardingWelcomePage() {
  // Verify authentication
  const auth = await getAuthAgency()
  if (!auth) {
    redirect('/login')
  }

  // Get agency and subscription data
  const agency = await prisma.agency.findUnique({
    where: { id: auth.agencyId },
    include: {
      subscription: true
    }
  })

  if (!agency) {
    redirect('/login')
  }

  // Check if onboarding is completed
  if (!agency.subscription) {
    // No subscription - redirect to plan selection
    redirect('/onboarding/plan')
  }

  // Calculate trial days remaining
  let trialDaysRemaining: number | undefined
  if (agency.subscription.status === 'trial' && agency.subscription.trialEndsAt) {
    const now = new Date()
    const trialEnd = new Date(agency.subscription.trialEndsAt)
    const diffTime = trialEnd.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    trialDaysRemaining = Math.max(0, diffDays)
  }

  // Get plan name
  const planName = agency.subscription.planType === 'free'
    ? 'Free'
    : agency.subscription.planType === 'basic'
    ? 'Basic'
    : 'Premium'

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-background py-12 px-4">
      <WelcomeChecklist
        agencyName={agency.nome}
        planName={planName}
        trialDaysRemaining={trialDaysRemaining}
        trialEndsAt={agency.subscription.trialEndsAt || undefined}
      />
    </div>
  )
}
