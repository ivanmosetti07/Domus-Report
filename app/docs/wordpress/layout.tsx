import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Installazione Widget su WordPress",
  description: "Guida completa per installare il chatbot DomusReport su WordPress. Plugin, editor tema, Elementor, Divi e Gutenberg. Setup in 2 minuti.",
  alternates: {
    canonical: "https://domusreport.com/docs/wordpress",
  },
}

export default function WordPressDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
