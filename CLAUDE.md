# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development plan

Two spec documents, both Portuguese — read both before implementing features:

- `DEVELOPMENT_PLAN.md` — full requirements and domain rationale.
- `PAGES.md` — page-by-page breakdown (8 pages) and the **current RF numbering**.

**They disagree on RF numbers.** `PAGES.md` renumbered them when RF-07 became the Priorização de Cobrança module: what `DEVELOPMENT_PLAN.md` calls RF-07/08/09/10/11 is RF-08/09/10/11/12 in `PAGES.md`. Code comments follow `PAGES.md`. When a plan section and a pages section conflict, `PAGES.md` is newer.

Summary of the domain:

Hackathon project (PMI-DF 2026) for **Krill Tech**, an agricultural input supplier that sells on credit tied to the harvest cycle. The system anticipates a client's ability to pay by scoring two forward-looking risk factors — before the harvest, not after a payment is missed:

- **Climate risk**: ONI (El Niño/La Niña) index history cross-referenced with regional crop productivity (CONAB) and observed weather (INMET) — "will the harvest exist?"
- **Commodity price risk**: CEPEA/ESALQ price trends for the client's crop, cross-referenced with harvest calendar (ZARC) — "will it be worth enough?"

These combine with standard legal/fiscal red flags (RJ, protesto, embargo ambiental) into a 0–1000 score and A–F rating (the specs say A–D; `types/firestore.ts` added F and is authoritative).

Two portals. **Portal Gestor** (internal) splits into two sections that must stay visually distinct: *Crédito* (decide who gets a limit — Clientes, Ficha, Portfólio) and *Recuperação* (act on what is already owed — Esteira de Priorização de Cobrança, ranked by risk × outstanding balance). Alertas feeds both. Three roles gate it: `credito`, `cobranca`, `diretoria` — Portfólio is Diretoria-only, and the role picked at login decides the landing route (`rotaInicial` in `app/utils/dominio.ts`). **Portal Contratante** (external, the client) is read-only: own score and pendencies, no channel to contest a red flag, by product decision.

Key constraints from the plan:
- Only non-negotiable NFR: API keys (LLM, CEPEA, etc.) must never be exposed client-side — proxy all external calls through Cloud Functions.
- Firestore security rules, full auth, and audit trail are deliberately out of MVP scope (hackathon speed tradeoff) — don't over-build these unless asked.
- SICAR, ZARC, PGFN, TST, and satellite/NDVI data are represented with synthetic data in the MVP, not real integrations.
- Client cannot contest a red flag — risk reading is Krill Tech's exclusive prerogative.
- Delivery priority order for the hackathon deadline is spelled out in plan Section 10 (Must → Should → Could) — check it before deciding what to build next.

## Commands

Package manager: pnpm (pnpm-lock.yaml present).

- `pnpm dev` — start dev server at http://localhost:3000
- `pnpm build` — production build
- `pnpm generate` — static generation
- `pnpm preview` — preview production build locally
- `pnpm lint` — ESLint via `@nuxt/eslint`
- `pnpm postinstall` runs `nuxt prepare` automatically after install

No test runner is configured yet.

## Architecture

Nuxt 4 app (Vue 3, TypeScript, Nuxt UI 4, Tailwind CSS 4). Project is at very early scaffold stage — most domain code has not been written yet.

- `app/` — Nuxt 4 source directory (`app.vue`, `assets/css/main.css`). Nuxt 4 moves the app root into `app/` by default; new pages/components/composables should go under `app/` (e.g. `app/pages`, `app/components`, `app/composables`), not the project root.
- `types/firestore.ts` — domain model for the app's Firestore data (not yet wired to any code). Defines the credit-risk/monitoring domain:
  - `Cliente`: a monitored company (CNPJ, razão social, CNAE, score/rating A–D, `redFlags`, optional `relatorioLLM`).
  - `RedFlag`: risk flags of type `rj | protesto | embargo_ambiental | inadimplencia_tecnica` with severidade `baixa|media|alta|critica`.
  - `HistoricoScore`: score/rating time series per cliente.
  - `Alerta`: notification derived from a `RedFlag` for a given cliente.
  This suggests the product tracks companies' credit/compliance risk over time and surfaces alerts — keep new Firestore-backed features consistent with this schema rather than inventing a parallel one.

## Firebase / Vuefire

Firebase config is wired in `nuxt.config.ts` under the `vuefire` module and pulled entirely from environment variables (`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`, `FIREBASE_MEASUREMENT_ID`). See `.env.example` for the required keys; `.env` holds real values and is gitignored. `nuxt-vuefire` and `firebase`/`vuefire` packages are installed for Firestore/Auth access.

## Notable dependencies already installed (not yet used in code)

- `@tiptap/*` — rich text editor (full extension set: mentions, collaboration, drag-handle, images, markdown, etc.)
- `chart.js` + `vue-chartjs` — charting, likely for score/rating history visualization
- `@pinia/nuxt` — state management
- `zod` — schema validation
- `dayjs` — date handling
- `@vueuse/nuxt` — composition utilities

When implementing features, check whether one of these already-installed libraries covers the need before reaching for something new.
