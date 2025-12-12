# Bug Fix #5 - Gestione Sessioni Database - Piano di Test

## Modifiche Implementate

### 1. File Modificati

- **[app/api/auth/login/route.ts](app/api/auth/login/route.ts:81-108)**: Aggiunta creazione sessione in database
- **[lib/auth.ts](lib/auth.ts:25-67)**: Aggiunta verifica sessione da database
- **[app/api/auth/logout/route.ts](app/api/auth/logout/route.ts)**: Aggiunta revoca sessione in database
- **[components/dashboard/sidebar.tsx](components/dashboard/sidebar.tsx:43-61)**: Aggiunto invio token nell'header Authorization

### 2. File Creati

- **[app/api/auth/sessions/route.ts](app/api/auth/sessions/route.ts)**: API per gestione sessioni
  - GET: Ottiene lista sessioni attive
  - DELETE: Revoca sessione singola o tutte le altre
- **[app/dashboard/security/page.tsx](app/dashboard/security/page.tsx)**: Pagina dashboard per gestire sessioni

## Piano di Test

### Test 1: Login - Creazione Sessione

**Obiettivo**: Verificare che il login crei un record in `agency_sessions`

**Passi**:
1. Avviare database PostgreSQL
2. Eseguire `npx prisma studio`
3. Navigare alla tabella `agency_sessions` - verificare che sia vuota
4. Effettuare login tramite UI (`http://localhost:3000/login`)
5. Tornare a Prisma Studio e aggiornare la vista
6. **Risultato atteso**:
   - Nuovo record in `agency_sessions`
   - `tokenHash` popolato
   - `ipAddress` e `userAgent` popolati
   - `loginAt` = timestamp corrente
   - `expiresAt` = 7 giorni dopo `loginAt`
   - `revokedAt` = NULL

### Test 2: Richieste Autenticate - Aggiornamento lastActivityAt

**Obiettivo**: Verificare che `lastActivityAt` si aggiorni durante l'uso

**Passi**:
1. Effettuare login
2. Annotare `lastActivityAt` in Prisma Studio
3. Attendere 6 minuti (threshold è 5 minuti)
4. Navigare a una pagina del dashboard (es. `/dashboard/leads`)
5. Aggiornare Prisma Studio
6. **Risultato atteso**: `lastActivityAt` aggiornato al timestamp corrente

**Nota**: Se passeranno meno di 5 minuti, `lastActivityAt` NON si aggiornerà (ottimizzazione performance)

### Test 3: Logout - Revoca Sessione

**Obiettivo**: Verificare che il logout revochi la sessione nel database

**Passi**:
1. Effettuare login
2. Copiare il token JWT dal localStorage del browser (F12 → Application → Local Storage → token)
3. Cliccare "Logout" dalla sidebar
4. Verificare in Prisma Studio che `revokedAt` sia popolato con timestamp
5. Provare a fare una richiesta API usando il token copiato:
   ```bash
   curl -H "Authorization: Bearer TOKEN_COPIATO" http://localhost:3000/api/auth/sessions
   ```
6. **Risultato atteso**:
   - `revokedAt` popolato in database
   - Richiesta API fallisce con errore 401 "Token non valido"

### Test 4: Sessioni Multiple

**Obiettivo**: Verificare che si possano avere sessioni multiple contemporaneamente

**Passi**:
1. Effettuare login da Chrome
2. Effettuare login da Firefox (o modalità incognito)
3. Verificare in Prisma Studio
4. **Risultato atteso**: 2 record distinti in `agency_sessions`
5. Navigare in `/dashboard/security` da uno dei browser
6. **Risultato atteso**:
   - Visualizzare 2 sessioni
   - Una marcata come "Sessione corrente"

### Test 5: Revoca Sessione Singola

**Obiettivo**: Revocare una sessione specifica senza invalidare le altre

**Passi**:
1. Creare 2 sessioni (2 browser diversi)
2. Da Browser A: navigare a `/dashboard/security`
3. Cliccare "Revoca" sulla sessione del Browser B
4. Verificare in Prisma Studio che la sessione B abbia `revokedAt` popolato
5. Dal Browser B: provare a navigare nel dashboard
6. **Risultato atteso**:
   - Browser B viene reindirizzato a `/login`
   - Browser A continua a funzionare normalmente

### Test 6: Revoca Tutte le Sessioni

**Obiettivo**: Revocare tutte le sessioni tranne quella corrente

**Passi**:
1. Creare 3 sessioni (3 browser/dispositivi)
2. Da Browser A: navigare a `/dashboard/security`
3. Cliccare "Revoca tutte le altre sessioni"
4. Verificare in Prisma Studio
5. **Risultato atteso**:
   - Sessione Browser A: `revokedAt` = NULL (ancora attiva)
   - Sessioni Browser B e C: `revokedAt` popolato
   - Browser B e C vengono disconnessi al prossimo refresh

### Test 7: Scadenza Automatica

**Obiettivo**: Verificare che sessioni scadute non siano più valide

**Passi**:
1. Effettuare login
2. Modificare manualmente `expiresAt` in Prisma Studio a una data passata:
   ```sql
   UPDATE agency_sessions SET expires_at = NOW() - INTERVAL '1 day' WHERE id = 'SESSION_ID';
   ```
3. Fare refresh della pagina dashboard
4. **Risultato atteso**: Reindirizzamento a `/login`

### Test 8: Token Rubato - Sicurezza

**Obiettivo**: Verificare che un token rubato possa essere invalidato

**Scenario**: Simula furto token JWT

**Passi**:
1. Effettuare login
2. Copiare token da localStorage
3. Chiudere browser (simulando che l'attaccante abbia rubato il token)
4. In un nuovo browser/incognito, inserire manualmente il token in localStorage:
   ```javascript
   localStorage.setItem('token', 'TOKEN_RUBATO')
   ```
5. Navigare a `/dashboard` - dovrebbe funzionare (token valido)
6. Da un terzo browser, effettuare login legittimo
7. Navigare a `/dashboard/security`
8. Revocare la sessione sospetta (quella con token rubato)
9. Tornare al browser con token rubato e fare refresh
10. **Risultato atteso**:
    - Browser con token rubato viene reindirizzato a `/login`
    - Impossibile usare il token anche se tecnicamente ancora valido (firma JWT OK)

### Test 9: UI Dashboard Sicurezza

**Obiettivo**: Verificare che la UI mostri correttamente le informazioni

**Passi**:
1. Creare 2-3 sessioni con device diversi (desktop, mobile, browser diversi)
2. Navigare a `/dashboard/security`
3. **Verificare**:
   - Conteggio sessioni corretto
   - Icone device appropriate (Smartphone vs Monitor)
   - Nome browser corretto (Chrome, Safari, Firefox, etc.)
   - IP address visualizzato
   - Timestamp formattati correttamente in italiano
   - "Ultima attività" mostra tempo relativo ("5 minuti fa", "2 ore fa")
   - Sessione corrente evidenziata con badge blu
   - Bottone "Revoca" non presente sulla sessione corrente

### Test 10: Performance - Aggiornamento lastActivityAt

**Obiettivo**: Verificare che `lastActivityAt` non si aggiorni ad ogni richiesta (ottimizzazione)

**Passi**:
1. Effettuare login
2. Notare timestamp `lastActivityAt` in Prisma Studio
3. Fare 10 richieste rapide (navigare tra pagine del dashboard)
4. Verificare in Prisma Studio
5. **Risultato atteso**:
   - `lastActivityAt` NON cambia se sono passati meno di 5 minuti
   - Questo riduce scritture DB da 10 a 1

## Comandi Utili

### Avviare Database e Prisma Studio
```bash
# Assicurarsi che PostgreSQL sia in esecuzione
# Aprire Prisma Studio
npx prisma studio
```

### Query SQL Utili

```sql
-- Visualizzare tutte le sessioni
SELECT id, agency_id, ip_address, user_agent, login_at, expires_at, last_activity_at, revoked_at
FROM agency_sessions;

-- Contare sessioni attive per agenzia
SELECT agency_id, COUNT(*) as active_sessions
FROM agency_sessions
WHERE revoked_at IS NULL AND expires_at > NOW()
GROUP BY agency_id;

-- Sessioni revocate
SELECT * FROM agency_sessions WHERE revoked_at IS NOT NULL;

-- Sessioni scadute
SELECT * FROM agency_sessions WHERE expires_at < NOW();

-- Pulire tutte le sessioni (per reset test)
DELETE FROM agency_sessions;
```

## Checklist Finale

- [ ] Test 1: Login crea sessione
- [ ] Test 2: lastActivityAt si aggiorna (dopo 5 min)
- [ ] Test 3: Logout revoca sessione
- [ ] Test 4: Sessioni multiple funzionano
- [ ] Test 5: Revoca sessione singola
- [ ] Test 6: Revoca tutte le altre sessioni
- [ ] Test 7: Scadenza automatica
- [ ] Test 8: Token rubato invalidato dopo revoca
- [ ] Test 9: UI Dashboard Sicurezza corretta
- [ ] Test 10: Performance ottimizzata

## Note di Sicurezza

### Cosa è stato risolto:
✅ Token JWT ora controllati contro database
✅ Possibilità di revocare sessioni attive
✅ Logout invalida immediatamente il token
✅ Visualizzazione sessioni attive
✅ Protezione contro token rubati

### Cosa rimane da considerare (future):
- Cache Redis per sessioni (se volume alto)
- Rate limiting su API sessioni
- Notifiche email per nuovi login da device sconosciuti
- 2FA (two-factor authentication)
- Logging accessi per audit

## Possibili Problemi e Soluzioni

### Problema: "Can't reach database server"
**Soluzione**: Avviare PostgreSQL

### Problema: Token ancora valido dopo logout
**Soluzione**: Verificare che `verifyAuth` controlli effettivamente il database (riga 35-44 in lib/auth.ts)

### Problema: lastActivityAt non si aggiorna mai
**Soluzione**: Attendere almeno 6 minuti tra le richieste (threshold è 5 minuti)

### Problema: Sessione non appare in Prisma Studio dopo login
**Soluzione**:
1. Verificare console browser per errori
2. Verificare che `prisma.agencySession.create` sia stato chiamato in login route
3. Aggiornare manualmente la vista in Prisma Studio
