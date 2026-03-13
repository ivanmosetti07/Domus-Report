import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Registrati Gratis",
  description: "Crea il tuo account DomusReport gratuito in 2 minuti. Chatbot AI per valutazioni immobiliari, CRM integrato, 5 valutazioni/mese gratis. Nessuna carta di credito.",
  alternates: {
    canonical: "https://domusreport.com/register",
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
