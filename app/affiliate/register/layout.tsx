import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Registrati come Affiliato",
  description: "Diventa affiliato DomusReport. Guadagna il 10% ricorrente referendo agenzie immobiliari. Registrazione gratuita.",
  alternates: {
    canonical: "https://domusreport.com/affiliate/register",
  },
}

export default function AffiliateRegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
