import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DomusReport Widget",
  description: "Widget chatbot per valutazioni immobiliari",
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
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
              'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
              sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `
      }} />
      {children}
    </>
  );
}
