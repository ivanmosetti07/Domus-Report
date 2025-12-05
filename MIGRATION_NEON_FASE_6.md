# Guida: Applicazione Migrazione Fase 6 su Neon

## 📋 Panoramica
Questa migrazione aggiunge i campi necessari per le funzionalità della Fase 6 (Gestione Profilo Avanzata) al database PostgreSQL su Neon.

## 🎯 Campi Aggiunti

### Tabella `agencies`:
- `logo_url` - URL del logo agenzia (caricato su Vercel Blob)
- `telefono` - Numero di telefono agenzia
- `indirizzo` - Indirizzo fisico agenzia
- `sito_web` - URL sito web agenzia
- `partita_iva` - Partita IVA agenzia (formato: IT + 11 cifre)

### Tabella `agency_settings`:
- `brand_colors` - Colori brand personalizzati (JSON: {primary, secondary, accent})
- `date_format` - Formato data preferito (default: DD/MM/YYYY)

## 🚀 Procedura di Applicazione

### Opzione A: Manuale da Neon Dashboard (CONSIGLIATO)

#### Step 1: Accedi a Neon
1. Vai su [https://console.neon.tech](https://console.neon.tech)
2. Accedi con il tuo account
3. Seleziona il progetto **Domus Report**

#### Step 2: Verifica Prerequisiti
Prima di applicare la migrazione, verifica che le tabelle esistano:

```sql
-- Verifica esistenza tabella agencies
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'agencies';

-- Verifica esistenza tabella agency_settings
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'agency_settings';
```

**Se `agency_settings` non esiste:**
Devi prima eseguire il file `prisma/migrations/NEON_ADD_TABLES.sql` che crea tutte le tabelle mancanti.

#### Step 3: Apri SQL Editor
1. Nel dashboard Neon, clicca su **"SQL Editor"** nel menu laterale
2. Seleziona il database **domusreport**

#### Step 4: Esegui la Migrazione
Copia e incolla questo SQL nell'editor:

```sql
-- ============================================================================
-- MIGRAZIONE FASE 6: Gestione Profilo Avanzata
-- Data: 2024-12-05
-- Descrizione: Aggiunge campi profilo, logo e brand colors
-- ============================================================================

-- STEP 1: Aggiungi campi profilo avanzato alla tabella agencies
ALTER TABLE "agencies"
ADD COLUMN IF NOT EXISTS "logo_url" TEXT,
ADD COLUMN IF NOT EXISTS "telefono" TEXT,
ADD COLUMN IF NOT EXISTS "indirizzo" TEXT,
ADD COLUMN IF NOT EXISTS "sito_web" TEXT,
ADD COLUMN IF NOT EXISTS "partita_iva" TEXT;

-- STEP 2: Aggiungi campi brand colors e preferenze alla tabella agency_settings
ALTER TABLE "agency_settings"
ADD COLUMN IF NOT EXISTS "brand_colors" JSONB,
ADD COLUMN IF NOT EXISTS "date_format" TEXT NOT NULL DEFAULT 'DD/MM/YYYY';

-- ============================================================================
-- VERIFICA: Controlla che i campi siano stati aggiunti
-- ============================================================================

-- Verifica campi agencies
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'agencies'
AND column_name IN ('logo_url', 'telefono', 'indirizzo', 'sito_web', 'partita_iva')
ORDER BY column_name;

-- Verifica campi agency_settings
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'agency_settings'
AND column_name IN ('brand_colors', 'date_format')
ORDER BY column_name;
```

#### Step 5: Verifica Risultati
Dopo aver eseguito lo script, dovresti vedere:

**Output atteso per agencies:**
```
column_name   | data_type | is_nullable
--------------+-----------+-------------
indirizzo     | text      | YES
logo_url      | text      | YES
partita_iva   | text      | YES
sito_web      | text      | YES
telefono      | text      | YES
```

**Output atteso per agency_settings:**
```
column_name   | data_type | is_nullable | column_default
--------------+-----------+-------------+-------------------
brand_colors  | jsonb     | YES         | NULL
date_format   | text      | NO          | 'DD/MM/YYYY'
```

---

### Opzione B: Da CLI con DATABASE_URL di produzione

Se preferisci usare la CLI Prisma (richiede accesso al DATABASE_URL di produzione):

#### Step 1: Imposta DATABASE_URL temporaneo
```bash
# Copia il DATABASE_URL da Vercel Dashboard → Settings → Environment Variables
export DATABASE_URL="postgresql://username:password@ep-xxx.eu-central-1.aws.neon.tech/domusreport?sslmode=require"
```

#### Step 2: Applica la Migrazione
```bash
npx prisma migrate deploy
```

Questo comando applicherà tutte le migrazioni pending, inclusa quella appena creata.

#### Step 3: Verifica
```bash
npx prisma db execute --stdin < prisma/migrations/20241205_add_profile_advanced_fields/migration.sql
```

---

## ✅ Verifica Post-Migrazione

Dopo aver applicato la migrazione, verifica che tutto funzioni:

### 1. Test su Neon Dashboard
Esegui queste query per verificare i dati:

```sql
-- Mostra struttura tabella agencies
\d agencies

-- Mostra struttura tabella agency_settings
\d agency_settings

-- Test inserimento brand_colors (opzionale)
UPDATE agency_settings
SET brand_colors = '{"primary": "#2563eb", "secondary": "#64748b", "accent": "#f59e0b"}'::jsonb
WHERE agency_id = 'YOUR_AGENCY_ID';

-- Verifica brand_colors
SELECT agency_id, brand_colors, date_format
FROM agency_settings
LIMIT 5;
```

### 2. Test su Vercel (Production)
1. Vai su Vercel Dashboard → Domus Report
2. Controlla i **Logs** per eventuali errori Prisma
3. Non dovrebbero esserci errori tipo:
   - `Invalid 'prisma.agency.update()' invocation: Unknown field 'logoUrl'`
   - `Column 'logo_url' does not exist`

### 3. Test Funzionale nell'App
1. Accedi alla dashboard di produzione: [https://domusreport.mainstream.agency/dashboard/profile](https://domusreport.mainstream.agency/dashboard/profile)
2. Prova a:
   - ✅ Caricare un logo (dovrebbe salvare in `logo_url`)
   - ✅ Aggiornare telefono, indirizzo, sito web, P.IVA
   - ✅ Cambiare i colori brand
   - ✅ Modificare le preferenze (formato data)

---

## 🔒 Sicurezza e Backup

### Prima della Migrazione
Neon mantiene automaticamente snapshot, ma se vuoi essere sicuro:

```sql
-- Backup struttura tabelle
CREATE TABLE agencies_backup AS SELECT * FROM agencies;
CREATE TABLE agency_settings_backup AS SELECT * FROM agency_settings;
```

### Rollback (se necessario)
In caso di problemi, puoi rimuovere i campi:

```sql
-- ATTENZIONE: Questo eliminerà i dati nei nuovi campi!
ALTER TABLE "agencies"
DROP COLUMN IF EXISTS "logo_url",
DROP COLUMN IF EXISTS "telefono",
DROP COLUMN IF EXISTS "indirizzo",
DROP COLUMN IF EXISTS "sito_web",
DROP COLUMN IF EXISTS "partita_iva";

ALTER TABLE "agency_settings"
DROP COLUMN IF EXISTS "brand_colors",
DROP COLUMN IF EXISTS "date_format";
```

---

## 📊 Impatto della Migrazione

### Performance
- ⚡ **Impatto minimo**: Solo ADD COLUMN (non modifica righe esistenti)
- ⏱️ **Tempo stimato**: < 1 secondo (database piccolo)
- 🔒 **Downtime**: Zero (ALTER TABLE online)

### Compatibilità
- ✅ **Backward compatible**: I campi sono nullable o hanno default
- ✅ **Nessuna modifica a dati esistenti**
- ✅ **Le API esistenti continuano a funzionare**

### Dati Esistenti
- Le agenzie esistenti avranno `NULL` nei nuovi campi
- Le agency_settings esistenti avranno:
  - `brand_colors`: NULL
  - `date_format`: 'DD/MM/YYYY' (default)

---

## 🐛 Troubleshooting

### Errore: "column 'date_format' cannot be cast to type text"
**Causa**: Campo già esistente con tipo diverso

**Soluzione:**
```sql
-- Rimuovi il campo esistente e ricrealo
ALTER TABLE agency_settings DROP COLUMN IF EXISTS date_format;
ALTER TABLE agency_settings ADD COLUMN date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY';
```

### Errore: "table 'agency_settings' does not exist"
**Causa**: Il file NEON_ADD_TABLES.sql non è stato eseguito

**Soluzione:**
1. Esegui prima `prisma/migrations/NEON_ADD_TABLES.sql`
2. Poi riprova questa migrazione

### Errore: "permission denied for table agencies"
**Causa**: L'utente PostgreSQL non ha privilegi di ALTER TABLE

**Soluzione:**
1. Verifica di essere connesso con l'utente owner del database
2. Su Neon Dashboard, usa l'utente principale (non read-only)

---

## 📝 Checklist Finale

- [ ] ✅ Migrazione applicata su Neon (verificato con SELECT su columns)
- [ ] ✅ Nessun errore nei log Vercel dopo deploy
- [ ] ✅ Test upload logo funzionante
- [ ] ✅ Test salvataggio brand colors funzionante
- [ ] ✅ Test aggiornamento profilo con nuovi campi
- [ ] ✅ Test preferenze (formato data) funzionante
- [ ] ✅ Documentato in CHANGELOG (opzionale)

---

## 📞 Supporto

In caso di problemi:
1. Controlla i log Vercel: `vercel logs [deployment-url]`
2. Controlla i log Neon: Dashboard → Monitoring → Query Stats
3. Verifica la struttura tabelle con `\d table_name`

---

**Data creazione**: 2024-12-05
**Versione Prisma**: 5.22.0
**Database**: Neon PostgreSQL
**Status**: ✅ Ready to apply
