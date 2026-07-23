# PaperFlow

Prémiové české ERP + document workflow pro OSVČ, řemeslníky a firmy.
Běží kompletně v prohlížeči (LocalStorage) s hybridní přípravou na Supabase a OpenAI.

## Spuštění

```bash
npm install
npm run dev
```

Otevřete `http://localhost:5173/`

Volitelné `.env` (viz `.env.example`):

```bash
VITE_OPENAI_API_KEY=sk-...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Architektura (`src/`)

```
App.tsx                 # Routing (vč. /sign/:id bez shellu)
components/             # UI: ItemManager, AI, Auth, Signature…
pages/
  Dashboard.tsx         # Pipeline zakázek
  ProjectDetail.tsx     # One-click convert + ARES + WhatsApp
  Profile.tsx           # Můj Profil / Moje Firma
  SignDocument.tsx      # Mobilní podpis + Smart-Faktura
  AiAudit.tsx           # AI Právní Audit
  NewDocument.tsx       # Klasický průvodce
  Pricing.tsx           # Free / 390 / 890 / 1490
hooks/                  # useAuth, useErp, useDocuments
utils/
  numbering.ts          # CN/SOD/F/PP 2026…
  vat.ts                # 21% / 12% / 0%
  workflow.ts           # Quote→Contract→Advance→Protocol→Final
  ares.ts / ai.ts / legalAudit.ts / payments.ts / supabase.ts
types/erp.ts            # Projekt, položky, DPH, workflow
```

## Klíčové funkce

1. **Profil firmy** — IČO, DIČ, sídlo, účet → hlavička dokumentů  
2. **Workflow** — Nabídka → Smlouva → Záloha → Předání → Doplatek + čísla `CN2026001`…  
3. **DPH** — více řádků, 21 / 12 / 0 %, součty dle sazeb  
4. **ARES** — načtení klienta (mock při CORS)  
5. **WhatsApp** + `/sign/:id` canvas podpis  
6. **Smart-Faktura** — QR Platba, Apple/Google Pay, Stripe (mock)  
7. **AI Právní Audit** — OpenAI nebo simulace  
8. **Paywall** — Free 3 dok. / Premium 390 / Business 890 / Enterprise 1490  
9. **Supabase hybrid** — bez klíčů běží LocalStorage auth
