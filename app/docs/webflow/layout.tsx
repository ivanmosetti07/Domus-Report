import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Installazione Widget su Webflow",
  description: "Come aggiungere il chatbot DomusReport a Webflow. Custom Code, Embed Element, widget bubble e inline. Compatibile con tutti i piani.",
  alternates: {
    canonical: "https://domusreport.com/docs/webflow",
  },
}

export default function WebflowDocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
