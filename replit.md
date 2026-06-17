# Saksi Bahasa — Indonesian Translator

## Project Overview

Full-stack Indonesian language translator for Jehovah's Witnesses ministry. Translates English to Indonesian in 3 styles (Casual/Slang, Polite/Public, Formal JW Meeting). Each translation shows a literal grammar gloss beneath. Every Indonesian word is clickable/tappable to open a Word Family popup.

## Artifacts

| Artifact | Kind | Path |
|----------|------|------|
| `artifacts/api-server` | API | Express backend, translation routes |
| `artifacts/translator-web` | Web (Vite + React) | Main web app at `/` |
| `artifacts/translator-mobile` | Mobile (Expo) | Companion mobile app at `/translator-mobile/` |

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Validation**: Zod (`zod/v4`)
- **API codegen**: Orval (from OpenAPI spec)
- **AI**: OpenAI `gpt-5` via Replit AI Integrations (no user API key required)
- **Mobile**: Expo (Expo Router), React Native
- **Web**: Vite + React + Tailwind (shadcn/ui)

## Key Files

- `artifacts/api-server/src/routes/translate.ts` — translation + word-family backend routes
- `lib/api-spec/openapi.yaml` — OpenAPI spec for `/translate` and `/word-family`
- `lib/api-client-react/src/generated/api.ts` — generated hooks (`useTranslate`, `useGetWordFamily`)
- `artifacts/translator-web/src/pages/home.tsx` — web main page
- `artifacts/translator-web/src/components/word-family-sheet.tsx` — web word family drawer
- `artifacts/translator-mobile/app/(tabs)/index.tsx` — mobile main screen
- `artifacts/translator-mobile/components/WordFamilySheet.tsx` — mobile word family modal

## Design System

- Primary (Amber): `#d97706`
- Dark background: `#111827` (deep slate)
- Light background: `#f7f4ef` (warm parchment)
- Card radius: 12px / `0.75rem`
- Font: Inter

## Translation Styles

1. **Casual** — uses lu/gue pronouns, colloquial Indonesian
2. **Polite** — standard baku Indonesian for public speech
3. **Formal (JW Meeting)** — elevated discourse style using jw.org 2010+ vocabulary

## JW Vocabulary

Uses official jw.org Indonesian vocabulary: Yehuwa, Saksi Yehuwa, Badan Pimpinan, Menara Pengawal, jemaat, penatua, pewarta, perintis, Balai Kerajaan, dsb.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally
