# FE-T0: Create the project from scratch

Purpose: the repo, the `client/` app and the tooling every later frontend task builds on.

## What was built
- `.gitignore`, `README.md` (repo root)
- `client/` created with Vite (React + TypeScript template)
- `client/tailwind.config.ts`, `client/postcss.config.js`, `client/src/styles/index.css`
- `client/.prettierrc`, `client/.prettierignore`, ESLint with `eslint-config-prettier`
- `client/.env.example` and typed env variables in `client/src/vite-env.d.ts`
- Empty folders (each with `.gitkeep`) matching Section 8
- Throwaway test page in `client/src/App.tsx`

## How other parts use it
- Scripts, run from `client/`: `npm run dev | build | lint | typecheck | test | format | format:check`
- Tailwind classes work in any `.ts` or `.tsx` file under `client/src/`
- Env variables are read with `import.meta.env.VITE_USE_MOCKS`, `VITE_API_URL`, `VITE_WHATSAPP_NUMBER`. Copy `.env.example` to `.env.local` first
- Brand tokens are added to `src/styles/index.css` and `tailwind.config.ts` in FE-T1

## How to test it
Run `npm run dev`, then `npm run build`, `npm run lint`, `npm run typecheck`, `npm run test`. All pass. The page shows a Tailwind-styled "VSS Hair" heading.

## Assumptions and known limitations
- React is pinned to 18 and Zod to 3, to match the locked contract
- `eslint-config-prettier` was added so ESLint and Prettier do not conflict (see Open Questions)
- `npm run test` uses `--passWithNoTests`. Test setup comes in FE-T16
- `vercel.json`, the logo and the real `.env.local` values are not part of this task
- The first commit is on `develop`. `main` was created at the same commit

## Related tasks
- Next: [FE-T1](./FE-T1-design-system-and-layout.md)
- Uses the structure from Section 8 of the developer prompt