import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DomusReport - Chatbot AI per Valutazioni Immobiliari | Lead Generation Automatica",
  description: "Il primo chatbot AI che genera valutazioni immobiliari accurate con dati OMI ufficiali. Trasforma i visitatori del tuo sito in lead qualificati. Setup in 2 minuti, CRM integrato, analytics real-time. Prova gratis 30 giorni.",
  keywords: "valutazione immobiliare, chatbot immobiliare, lead generation immobiliare, OMI, CRM immobiliare, widget valutazione casa, AI immobiliare",
  authors: [{ name: "DomusReport" }],
  openGraph: {
    title: "DomusReport - Trasforma Visitatori in Lead Qualificati",
    description: "Chatbot AI per valutazioni immobiliari con dati OMI. 100+ agenzie, 5000+ lead generati.",
    type: "website",
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
