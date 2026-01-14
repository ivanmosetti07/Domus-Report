import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "DomusReport Widget",
  description: "Widget chatbot per valutazioni immobiliari",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

/**
 * Layout dedicato per il widget embedded
 * Rimuove lo sfondo bianco del body per permettere trasparenza
 */
export default function WidgetLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          html, body {
            margin: 0;
            padding: 0;
            background: transparent !important;
            background-color: transparent !important;
            overflow: hidden;
            /* Previeni zoom su double-tap */
            touch-action: manipulation;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            /* Previeni zoom su tap */
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
          }
        `
      }} />
      {children}
    </>
  );
}
