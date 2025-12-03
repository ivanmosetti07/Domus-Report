# Setup Database PostgreSQL Neon Production

## 1. Crea Database su Neon

1. Vai su [neon.tech](https://neon.tech)
2. Crea un nuovo progetto chiamato **domus-report-production**
3. Seleziona regione: **Frankfurt (eu-central-1)** (vicina a Vercel fra1)
4. Copia la connection string che ti viene fornita

La connection string avrà questo formato:
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

## 2. Salva la Connection String

**IMPORTANTE:** Salva questa stringa in un posto sicuro (1Password, LastPass, etc.)

Avrai bisogno di configurarla in:
- Vercel Environment Variables (prossimo step)
- File `.env.local` per test locali su production DB (opzionale)

## 3. Verifica Connection String

La stringa deve contenere:
- `?sslmode=require` alla fine (Neon richiede SSL)
- No caratteri speciali non escaped nella password
- Host che finisce con `.neon.tech` o `.neon.io`

## 4. Configurazione Pooling (Raccomandato)

Neon fornisce due connection strings:
1. **Direct connection** - Per migrations
2. **Pooled connection** - Per applicazione (performance migliori)

Per Vercel, usa la **pooled connection** che termina con `:5432/[database]?sslmode=require&pgbouncer=true`

## 5. Next Steps

Dopo aver ottenuto la connection string:
1. Vai alla sezione "Environment Variables" su Vercel
2. Configura `DATABASE_URL` con la pooled connection string
3. Esegui le migrations con il comando nel prossimo file

---

✅ Una volta completato questo step, passa a configurare Vercel!
