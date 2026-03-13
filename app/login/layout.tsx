import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Accedi",
  description: "Accedi alla dashboard DomusReport per gestire lead, valutazioni immobiliari e il tuo chatbot AI.",
  alternates: {
    canonical: "https://domusreport.com/login",
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
