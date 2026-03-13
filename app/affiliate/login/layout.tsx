import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accedi Affiliati",
  description: "Accedi al programma affiliati DomusReport per monitorare referral, commissioni e payout.",
  alternates: {
    canonical: "https://domusreport.com/affiliate/login",
  },
}

export default function AffiliateLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
