# 📊 Migrazione Database Neon - FASE 8: Data Enrichment Avanzato

## Panoramica

La Fase 8 introduce un sistema avanzato di data enrichment per le valutazioni immobiliari:
- **Dati OMI dettagliati** per zona
- **Storico prezzi** con trend temporali
- **Insights automatici** sulla zona

## Nuove Tabelle

### 1. OMIValue
Valori dettagliati dell'Osservatorio Mercato Immobiliare per zona specifica.

**Campi principali:**
- `citta`, `zona`, `cap` - Localizzazione specifica
- `tipoImmobile`, `categoria` - Tipologia immobile
- `valoreMinMq`, `valoreMaxMq`, `valoreMedioMq` - Range prezzi per m²
- `semestre`, `anno` - Periodo di riferimento
- `fonte` - Fonte dei dati (OMI, CSV, API)

### 2. PriceHistory
Storico prezzi zona nel tempo per analisi trend.

**Campi principali:**
- `citta`, `zona`, `tipoImmobile` - Identificazione
- `valoreMedioMq` - Prezzo medio nel periodo
- `semestre`, `anno` - Periodo
- `variazionePrecedente` - % variazione rispetto al periodo precedente
- `numeroTransazioni` - N. transazioni (se disponibile)

### 3. ZoneInsight
Insights automatici calcolati sui trend di zona.

**Campi principali:**
- `citta`, `zona` - Identificazione
- `trend` - "crescita", "stabile", "decrescita"
- `variazioneAnnuale` - % variazione annuale
- `variazioneUltimoSemestre` - % variazione ultimo semestre
- `prezzoMedioAttuale` - Prezzo medio corrente
- `descrizione` - Descrizione testuale del trend
- `icona` - Emoji/icon rappresentativo

## Procedura Migrazione

### Step 1: Backup Database
```bash
# Esporta backup da Neon dashboard
# Settings > Backup > Create manual backup
```

### Step 2: Applica Migrazione SQL
```bash
# Esegui il file SQL di migrazione
psql $DATABASE_URL < prisma/migrations/20250105_fase_8_data_enrichment/migration.sql
```

### Step 3: Aggiorna Prisma Client
```bash
npx prisma generate
```

### Step 4: Carica Dati OMI Iniziali
```bash
# Dopo il deploy, chiama l'API di inizializzazione
curl -X POST https://tuodominio.com/api/admin/load-omi-data

# In locale:
curl -X POST http://localhost:3000/api/admin/load-omi-data
```

## File CSV Dati OMI

Il file `data/omi-values.csv` contiene:
- **80+ record** con dati reali OMI
- Principali città italiane (Milano, Roma, Torino, Firenze, Bologna, ecc.)
- Zone specifiche per città (Centro, Porta Romana, Parioli, ecc.)
- Storico **ultimi 3 anni** (2022-2024)
- Tipologie: residenziale, commerciale, uffici

## Nuove API

### 1. GET /api/price-history
Ottiene storico prezzi e trend per una zona.

**Parametri:**
- `citta` (required) - Nome città
- `zona` (required) - Nome zona
- `tipoImmobile` (optional) - Default: "residenziale"
- `numSemestri` (optional) - Default: 6

**Response:**
```json
{
  "success": true,
  "citta": "Milano",
  "zona": "Centro Storico",
  "tipoImmobile": "residenziale",
  "history": [
    {
      "semestre": "2022-S2",
      "valoreMedioMq": 4900,
      "variazione": 2.1
    },
    ...
  ],
  "trend": {
    "trend": "crescita",
    "variazioneAnnuale": 5.3,
    "prezzoMedioAttuale": 5500,
    "descrizione": "Zona in crescita (+5.3% annuo)",
    "icona": "📈"
  }
}
```

### 2. POST /api/admin/load-omi-data
Carica dati OMI dal CSV nel database.

**NOTA:** In produzione proteggere con autenticazione admin.

## Nuovi Componenti UI

### 1. PriceHistoryChart
Componente React per visualizzare grafico storico prezzi:
- Grafico lineare SVG responsivo
- Tabella dati dettagliata per semestre
- Indicatori variazione percentuale
- Info trend zona

**Utilizzo:**
```tsx
import { PriceHistoryChart } from "@/components/dashboard/price-history-chart"

<PriceHistoryChart
  citta="Milano"
  zona="Centro Storico"
  tipoImmobile="residenziale"
/>
```

### 2. OMIDetailsCard
Card con dettagli valori OMI per zona:
- Range prezzi (min, medio, max)
- Periodo di riferimento
- Link fonte OMI ufficiale

**Utilizzo:**
```tsx
import { OMIDetailsCard } from "@/components/dashboard/omi-details-card"

<OMIDetailsCard
  citta="Milano"
  zona="Centro Storico"
  valoreMedioMq={5500}
  valoreMinMq={4500}
  valoreMaxMq={6500}
  semestre={2}
  anno={2024}
  fonte="OMI"
/>
```

## Libreria OMI Avanzata

### lib/omi-advanced.ts

**Funzioni principali:**

1. **loadOMIDataFromCSV()** - Carica dati CSV nel DB
2. **getOMIValueByZone()** - Ottiene valore OMI per zona specifica
3. **getPriceHistory()** - Ottiene storico prezzi zona
4. **calculateZoneTrend()** - Calcola trend automatico
5. **getZonesByCity()** - Lista zone disponibili per città
6. **mapPropertyTypeToOMI()** - Mappa tipo immobile a tipo OMI

## Integrazione con Valutazione

Il sistema di valutazione è stato aggiornato per:
- Utilizzare dati OMI zona-specifici quando disponibili
- Fallback a media città se zona non trovata
- Supporto per CAP nella ricerca OMI
- Valori più precisi basati su dati reali

## Testing

### Test API Price History
```bash
# Ottiene storico Milano Centro
curl "http://localhost:3000/api/price-history?citta=Milano&zona=Centro%20Storico"

# Lista zone Milano
curl "http://localhost:3000/api/price-history?citta=Milano"
```

### Test Caricamento Dati
```bash
# Carica dati OMI
curl -X POST http://localhost:3000/api/admin/load-omi-data

# Verifica nel database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM omi_values;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM price_history;"
```

## Indici Database

Per ottimizzare le query, sono stati creati indici su:
- `(citta, zona)` - Ricerca per località
- `(cap)` - Ricerca per CAP
- `(anno, semestre)` - Ricerca temporale
- Unique constraints per evitare duplicati

## Note Importanti

1. **Primo Utilizzo**: Dopo il deploy, eseguire POST /api/admin/load-omi-data
2. **Aggiornamenti Dati**: Aggiornare CSV semestralmente con nuovi dati OMI
3. **Performance**: I dati sono indicizzati per query veloci
4. **Caching**: Sistema di cache già presente in valutazione
5. **Scalabilità**: Schema progettato per gestire migliaia di zone

## Estensioni Future

- [ ] Import automatico dati OMI ufficiali
- [ ] API third-party (Immobiliare.it, Idealista)
- [ ] Predizioni trend con ML
- [ ] Confronto competitivo tra zone
- [ ] Alert automatici su variazioni significative

## Rollback

In caso di problemi:

```sql
-- Rimuove le nuove tabelle
DROP TABLE IF EXISTS zone_insights;
DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS omi_values;

-- Rigenera Prisma client
npx prisma generate
```

## Supporto

Per problemi o domande sulla Fase 8:
1. Verifica che il CSV sia presente in `data/omi-values.csv`
2. Controlla i log del server per errori di caricamento
3. Verifica che le migrazioni siano state applicate correttamente
4. Controlla gli indici del database

---

**Data Migrazione**: 05 Gennaio 2025
**Versione**: Fase 8 - Data Enrichment Avanzato
**Status**: ✅ Ready for Production
