# 🔄 CI/CD Setup Guide - Domus Report

## 📋 Panoramica

Questa guida descrive come configurare una pipeline CI/CD completa per Domus Report usando **GitHub Actions** e **Vercel**.

## 🏗️ Architettura Deployment

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   GitHub    │──────>│GitHub Actions│──────>│   Vercel    │
│ Repository  │       │   (CI/CD)    │       │ (Production)│
└─────────────┘       └──────────────┘       └─────────────┘
      │                      │                       │
      │                      │                       │
      v                      v                       v
   commit              tests+build             auto-deploy
```

## ✅ Configurazione Attuale

### Vercel (Già Configurato)

✅ **Auto-deployment** da GitHub:
- Main branch → Production
- PR → Preview deployments
- Environment variables gestite

✅ **Cron jobs** configurati in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/aggregate-analytics",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/check-trials",
      "schedule": "0 3 * * *"
    }
  ]
}
```

## 🚀 GitHub Actions - Setup Completo

### 1. Crea Workflow File

Crea `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  # ========================================
  # JOB 1: Linting & Type Check
  # ========================================
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint
        continue-on-error: true  # Non bloccare per warning

      - name: Type check
        run: npx tsc --noEmit

  # ========================================
  # JOB 2: Build Test
  # ========================================
  build:
    name: Build Test
    runs-on: ubuntu-latest
    needs: lint

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate
        env:
          DATABASE_URL: postgresql://fake:fake@fake.com/fake

      - name: Build application
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true
          DATABASE_URL: postgresql://fake:fake@fake.com/fake
          NEXTAUTH_SECRET: fake-secret-for-build-test
          NEXT_PUBLIC_APP_URL: https://fake.com

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: .next/
          retention-days: 7

  # ========================================
  # JOB 3: Security Audit
  # ========================================
  security:
    name: Security Audit
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Run npm audit
        run: npm audit --audit-level=high
        continue-on-error: true

      - name: Check for outdated packages
        run: npm outdated
        continue-on-error: true

  # ========================================
  # JOB 4: Database Migrations Check
  # ========================================
  migrations:
    name: Check Migrations
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Check Prisma schema
        run: npx prisma validate
        env:
          DATABASE_URL: postgresql://fake:fake@fake.com/fake

      - name: Check migration status
        run: npx prisma migrate status
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        continue-on-error: true

  # ========================================
  # JOB 5: Notify Success (only on main)
  # ========================================
  notify:
    name: Notify Deployment
    runs-on: ubuntu-latest
    needs: [lint, build, security, migrations]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'

    steps:
      - name: Deployment started
        run: echo "🚀 Deployment to Vercel in progress..."

      # Opzionale: Notifica Slack/Discord
      # - name: Slack notification
      #   uses: 8398a7/action-slack@v3
      #   with:
      #     status: ${{ job.status }}
      #     text: 'Deployment to production completed!'
      #   env:
      #     SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. Configurazione Secrets su GitHub

Vai su **GitHub** → **Settings** → **Secrets and variables** → **Actions**

Aggiungi:
- `DATABASE_URL`: Connection string Neon (per migration check)
- `SLACK_WEBHOOK` (opzionale): Per notifiche

### 3. Branch Protection Rules

**Settings** → **Branches** → **Add branch protection rule**

Per branch `main`:
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require linear history
- ✅ Include administrators

**Status checks richiesti**:
- `Lint & Type Check`
- `Build Test`
- `Security Audit`

## 🔒 Security Best Practices

### Dependabot (GitHub)

Crea `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # npm dependencies
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    reviewers:
      - "ivanmosetti"  # Sostituisci con il tuo username
    commit-message:
      prefix: "deps"
      include: "scope"
    labels:
      - "dependencies"
      - "automated"

  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
    labels:
      - "github-actions"
      - "automated"
```

### CodeQL Analysis (Opzionale)

Crea `.github/workflows/codeql.yml`:

```yaml
name: "CodeQL Security Scan"

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 5 * * 1'  # Lunedì alle 5:00

jobs:
  analyze:
    name: Analyze Code
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript, typescript

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
```

## 📊 Monitoring & Rollback

### Vercel Deployment Monitoring

**Automatico**:
- Ogni deployment crea un URL unico
- Preview deployments per ogni PR
- Production deployment per push su main

**Rollback**:
```bash
# Via Vercel CLI
vercel rollback

# Via dashboard
Deployments → ... → Promote to Production
```

### Health Checks

Crea un endpoint di health check:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        api: 'up'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Database connection failed'
    }, { status: 503 })
  }
}
```

**Configura monitoring esterno** (es: UptimeRobot, Pingdom):
- Endpoint: `https://domusreport.com/api/health`
- Interval: 5 minuti
- Alert via email/Slack se down

## 🧪 Test Strategy (Opzionale - Da Implementare)

### Unit Tests con Vitest

```bash
npm install --save-dev vitest @vitejs/plugin-react
```

`vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

### E2E Tests con Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

`playwright.config.ts`:
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

## 📝 Release Process

### Semantic Versioning

1. **Feature branch**: `feat/new-dashboard`
2. **PR review**: Automated checks + code review
3. **Merge to main**: Automatic deployment to production
4. **Git tag**: Create release tag

```bash
# Crea release tag
git tag -a v1.2.0 -m "Release v1.2.0: Added Sentry, improved performance"
git push origin v1.2.0
```

### Changelog

Mantieni `CHANGELOG.md` aggiornato:

```markdown
# Changelog

## [1.2.0] - 2025-12-05

### Added
- Sentry error tracking integration
- Structured logging system
- Bundle optimization documentation

### Fixed
- Dynamic server usage warnings
- Widget file duplication
- Console.log in production code

### Removed
- Unused mock data files
- Deprecated stripe client-side code
```

## 🎯 Workflow Consigliato

```
1. Develop locally
2. Create feature branch
3. Commit changes
4. Push to GitHub
   ↓
5. GitHub Actions runs:
   - Lint check ✓
   - Type check ✓
   - Build test ✓
   - Security audit ✓
   ↓
6. Create PR
   ↓
7. Vercel creates preview deployment
8. Code review
   ↓
9. Merge to main
   ↓
10. Vercel deploys to production
11. Monitor via Sentry + Vercel Analytics
```

## 🔧 Troubleshooting

### Build Fails on CI but Works Locally

```bash
# Simula CI environment localmente
rm -rf .next node_modules
npm ci
npm run build
```

### Type Errors su GitHub Actions

```bash
# Assicurati che tsconfig.json sia committato
git add tsconfig.json
git commit -m "chore: add TypeScript config"
```

### Environment Variables Missing

- Verifica che tutte le env vars siano su Vercel Dashboard
- Usa `SKIP_ENV_VALIDATION=true` solo per build test

## 📚 Risorse

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments)
- [Prisma Migrations](https://www.prisma.io/docs/orm/prisma-migrate)
- [Next.js CI/CD](https://nextjs.org/docs/deployment)

---

**Documentazione aggiornata**: Dicembre 2025
**Owner**: Ivan Mosetti
