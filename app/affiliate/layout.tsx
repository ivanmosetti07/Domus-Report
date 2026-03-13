import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Programma Affiliati - Guadagna il 10% Ricorrente",
  description: "Diventa affiliato DomusReport e guadagna il 10% ricorrente su ogni pagamento delle agenzie che referisci. Registrazione gratuita, payout via Stripe Connect.",
  openGraph: {
    title: "Programma Affiliati DomusReport - Guadagna il 10% Ricorrente",
    description: "Referisci agenzie immobiliari e guadagna commissioni ricorrenti del 10%. Dashboard dedicata, tracking automatico, payout Stripe.",
    url: "https://domusreport.com/affiliate",
  },
  alternates: {
    canonical: "https://domusreport.com/affiliate",
  },
}

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
