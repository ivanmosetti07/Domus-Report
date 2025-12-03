import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function WebflowDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Webflow - Installazione Widget</h1>
        <p>Guida completa disponibile in TESTING_GUIDE.md</p>
        <Link href="/docs" className="text-primary hover:underline">← Torna alla documentazione</Link>
      </div>
      <Footer />
    </div>
  )
}
