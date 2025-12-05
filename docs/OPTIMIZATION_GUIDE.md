# 🚀 Guida alle Ottimizzazioni - Domus Report

## 📊 Analisi Bundle Size

### Dipendenze Principali (da package.json)

**Front-end pesanti**:
- `@stripe/stripe-js` (77KB) - Solo lato server, rimuovere client-side ✅ FATTO
- `react` + `react-dom` (~130KB) - Essenziale
- `next` (~400KB) - Essenziale
- `@prisma/client` (~5MB) - Solo server-side, già ottimizzato

**Librerie UI**:
- `lucide-react` (icons) - Usa solo import specifici
- `recharts` (grafici) - Caricamento lazy consigliato
- `@radix-ui/*` - Modularizzato, già ottimizzato

**AI/APIs**:
- `openai` - Solo server-side ✅
- `@google/maps` - Solo server-side ✅

### Ottimizzazioni Applicate

✅ **Rimozione codice non utilizzato** (Fase 1):
- Eliminati: `mock-data.ts`, `design-tokens.ts`, `stripe-client.ts`
- Archivio widget obsoleto

✅ **Logging strutturato** (Fase 3):
- Implementato logger custom zero-dependency
- Rimozione log di sviluppo in produzione

✅ **Dynamic rendering** (Fase 2):
- Pagine dashboard ora correttamente dinamiche
- Nessuna pre-generazione inutile

## 🎯 Ottimizzazioni Consigliate

### 1. Code Splitting & Lazy Loading

**Componenti pesanti da caricare lazy**:

```typescript
// components/dashboard/reports/charts.tsx
import dynamic from 'next/dynamic'

// Carica Recharts solo quando necessario
const ReportChart = dynamic(() => import('./ReportChart'), {
  loading: () => <div>Caricamento grafico...</div>,
  ssr: false // Grafici non servono in SSR
})
```

**Modal e Dialog**:
```typescript
// Carica modale solo all'apertura
const ExportModal = dynamic(() => import('@/components/ExportModal'))
```

### 2. Image Optimization

```typescript
// Usa sempre il componente Next Image
import Image from 'next/image'

<Image
  src={agency.logo}
  alt={agency.nome}
  width={120}
  height={40}
  quality={85} // Riduci da 100 a 75-85
  priority={false} // Solo per above-the-fold
/>
```

**Formato immagini**:
- Preferisci WebP/AVIF via Vercel Image Optimization
- Logo agenzie: max 200KB, già ottimizzato con Vercel Blob

### 3. Font Optimization

```typescript
// app/layout.tsx - Usa next/font
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Migliora FCP
  preload: true,
})
```

### 4. API Routes Optimization

**Caching con Vercel Edge Config** (opzionale):
```typescript
// Per dati statici (es: OMI data)
import { get } from '@vercel/edge-config'

export const revalidate = 3600 // 1 ora

export async function GET() {
  const omiData = await get('omi-cache')
  // ...
}
```

**Database Query Optimization**:
```typescript
// Usa select per ridurre dati trasferiti
const leads = await prisma.lead.findMany({
  select: {
    id: true,
    nome: true,
    email: true,
    // NON includere campi pesanti se non servono
  }
})
```

### 5. Middleware Optimization

```typescript
// middleware.ts - Già ottimizzato
export const config = {
  matcher: [
    '/dashboard/:path*', // Solo route protette
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

### 6. Widget.js Optimization

Il widget è già ottimizzato:
- ✅ Minificato e compresso
- ✅ CORS abilitato
- ✅ CDN-ready (servito da Vercel Edge)

**Ulteriori ottimizzazioni**:
```javascript
// Caricamento asincrono
<script async src="https://domusreport.com/widget.js"></script>

// Preconnect al dominio
<link rel="preconnect" href="https://domusreport.com">
```

## 📦 Bundle Analysis

### Come Analizzare

1. **Installa analyzer**:
```bash
npm install --save-dev @next/bundle-analyzer
```

2. **Configura next.config.js**:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(withSentryConfig(nextConfig, ...))
```

3. **Esegui analisi**:
```bash
ANALYZE=true npm run build
```

4. **Apri report** in `.next/analyze/`

### Metriche Target

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Total Blocking Time (TBT)**: < 200ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Monitoraggio Produzione

- **Vercel Analytics**: Attivo di default
- **Sentry Performance**: Configurato (Fase 4)
- **Web Vitals**: Tracciati automaticamente

## 🔍 Database Optimization

### Prisma Performance

**Index esistenti** (verifica in `schema.prisma`):
```prisma
model Lead {
  @@index([agenziaId, dataRichiesta(sort: Desc)])
  @@index([email])
}

model Property {
  @@index([leadId])
}
```

**Query ottimizzate**:
```typescript
// Usa connection pooling (già configurato con Neon)
DATABASE_URL="postgres://...?pgbouncer=true&connection_limit=10"

// Usa transazioni solo quando necessario
await prisma.$transaction([...])

// Batch queries
const [leads, total] = await prisma.$transaction([
  prisma.lead.findMany(...),
  prisma.lead.count(...),
])
```

### Caching Strategy

**Dati statici** (OMI, configurazione):
- Cache in-memory con TTL 1 ora
- Revalidazione on-demand

**Dati dinamici** (lead, property):
- Nessuna cache, sempre fresh da DB
- Ottimizzazione via select fields

## ⚡ Performance Checklist

### Build Time
- ✅ Rimozione codice morto
- ✅ Tree shaking automatico (Next.js)
- ✅ Minificazione JS/CSS
- ⚠️ Source maps solo in produzione (Sentry)

### Runtime
- ✅ Server Components di default
- ✅ Client Components solo dove necessario (`"use client"`)
- ✅ Dynamic imports per codice pesante
- ✅ Image optimization automatica
- ✅ Font optimization

### Database
- ✅ Connection pooling (Neon + PgBouncer)
- ✅ Index su query frequenti
- ✅ Select field specifici
- ⚠️ Caching per dati statici (da implementare)

### Monitoring
- ✅ Structured logging (Winston)
- ✅ Error tracking (Sentry)
- ✅ Web Vitals (Vercel)
- ⚠️ Custom dashboards (da configurare su Sentry)

## 🎯 Prossimi Step (Opzionale)

1. **Redis Cache** per dati OMI e configurazioni:
   ```bash
   npm install @upstash/redis
   ```

2. **ISR per pagine statiche** (docs, landing):
   ```typescript
   export const revalidate = 3600 // 1 ora
   ```

3. **Edge Functions** per geolocalizzazione:
   ```typescript
   export const runtime = 'edge'
   ```

4. **CDN per assets statici**:
   - Già gestito da Vercel Edge Network

## 📊 Metriche Attuali (Stimate)

**Bundle Size**:
- First Load JS: ~150KB (ottimo)
- Widget.js: ~15KB (ottimo)

**Performance**:
- LCP: ~1.2s (Vercel Edge)
- FCP: ~0.8s
- TTI: ~2.5s

**Database**:
- Avg query time: ~50ms (Neon EU)
- Connection pool: 10 connessioni

---

**Documentazione aggiornata**: Dicembre 2025
**Prossima review**: Dopo 1.000 utenti attivi o 6 mesi
