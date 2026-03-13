import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Installazione Widget su HTML",
  description: "Guida per integrare il widget chatbot DomusReport in un sito HTML statico. Widget bubble e inline, codice pronto, istruzioni FTP.",
  alternates: {
    canonical: "https://domusreport.com/docs/html",
  },
}

export default function HtmlDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
