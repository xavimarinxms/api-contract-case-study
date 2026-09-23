# Product Case Studies

Next.js (App Router · TypeScript · Tailwind CSS). Hosts a small set of
interactive Product Owner case studies, each under its own route, in a
single Vercel project. All data and API behavior shown is simulated
client-side — there is no backend.

## Development

```bash
npm install
npm run dev
```

## Build / production (Vercel uses this by default)

```bash
npm run build
npm run start
```

## Structure

```
app/
  page.tsx                     → root listing "/" (generated from app/caseStudies.ts)
  caseStudies.ts                → case study registry
  api-contract-negotiation/
    page.tsx                    → server component + metadata
    ContractConsole.tsx         → interactive prototype (client-side)
components/
  CaseStudyShell.tsx            → header + back link, shared across case studies
```

## Adding a new case study

1. Create `app/<slug>/page.tsx` (wrap it in `<CaseStudyShell>`).
2. Add an entry in `app/caseStudies.ts`.

Nothing else to touch — the root listing updates on its own.
