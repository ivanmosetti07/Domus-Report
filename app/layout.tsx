import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = "https://domusreport.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "DomusReport - Chatbot AI per Valutazioni Immobiliari | Lead Generation Agenzie",
    template: "%s | DomusReport",
  },
  description: "Il primo chatbot AI conversazionale per agenti immobiliari. Valutazioni OMI in tempo reale, qualificazione automatica lead, CRM integrato. Conversazione intelligente che sostituisce i form. 1.200+ lead generati, precisione 98%. Prova gratis 7 giorni.",
  keywords: [
    "chatbot immobiliare",
    "valutazione immobiliare AI",
    "chatbot AI agenti immobiliari",
    "valutazione casa online",
    "lead generation immobiliare",
    "OMI valutazione",
    "chatbot conversazionale immobiliare",
    "widget valutazione casa",
    "AI immobiliare",
    "CRM immobiliare",
    "qualificazione lead automatica",
    "valutazione real-time immobili",
    "agente immobiliare AI",
    "software agenzie immobiliari",
    "stima valore casa",
    "valutazione appartamento online",
    "prezzo immobile OMI",
  ],
  authors: [{ name: "DomusReport", url: baseUrl }],
  creator: "DomusReport",
  publisher: "Mainstream Agency",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "DomusReport - Il Primo Chatbot AI Conversazionale per Agenti Immobiliari",
    description: "Conversazione AI + Valutazione Real-Time. Il chatbot che qualifica lead con stime OMI precise mentre parla con i clienti. 1.200+ lead generati, 98% precisione.",
    type: "website",
    locale: "it_IT",
    url: baseUrl,
    siteName: "DomusReport",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "DomusReport - Chatbot AI per Agenti Immobiliari",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DomusReport - Chatbot AI Conversazionale per Immobiliare",
    description: "Valutazioni OMI real-time + Qualificazione automatica lead. Il primo chatbot AI per agenti immobiliari.",
    images: [`${baseUrl}/og-image.png`],
    creator: "@domusreport",
  },
  alternates: {
    canonical: baseUrl,
    languages: {
      "it-IT": baseUrl,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png",
  },
  manifest: "/manifest.json",
  category: "technology",
  classification: "Real Estate Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <GoogleAnalytics />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
