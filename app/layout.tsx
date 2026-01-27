import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DomusReport - Chatbot AI Conversazionale per Valutazioni Immobiliari Real-Time | Lead Generation Agenti Immobiliari",
  description: "Il primo chatbot AI conversazionale per agenti immobiliari. Valutazioni OMI in tempo reale, qualificazione automatica lead, CRM integrato. Conversazione intelligente che sostituisce i form. 1.200+ lead generati, precisione 98%. Prova gratis 7 giorni.",
  keywords: "chatbot immobiliare, valutazione immobiliare AI, chatbot AI agenti immobiliari, valutazione casa online, lead generation immobiliare, OMI valutazione, chatbot conversazionale immobiliare, widget valutazione casa, AI immobiliare, CRM immobiliare, qualificazione lead automatica, valutazione real-time immobili, agente immobiliare AI, software agenzie immobiliari",
  authors: [{ name: "DomusReport" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "DomusReport - Il Primo Chatbot AI Conversazionale per Agenti Immobiliari",
    description: "Conversazione AI + Valutazione Real-Time. Il chatbot che qualifica lead con stime OMI precise mentre parla con i clienti. 1.200+ lead generati, 98% precisione.",
    type: "website",
    locale: "it_IT",
    siteName: "DomusReport",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DomusReport - Chatbot AI per Agenti Immobiliari",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DomusReport - Chatbot AI Conversazionale per Immobiliare",
    description: "Valutazioni OMI real-time + Qualificazione automatica lead. Il primo chatbot AI per agenti immobiliari.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://domusreport.com",
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
        <Analytics />
      </body>
    </html>
  );
}
