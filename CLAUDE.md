@AGENTS.md

# KIIIBS Next.js port

A Next.js 16 copy of the KIIIBS Vue store. The Vue app at `../E-Commerce-Store` is the reference for every pixel and behaviour. **Never modify it.**

Read `docs/migration-plan.md` (phases, component map, known quirks) and `docs/adr/` (decisions) before changing structure.

## Commands

- `npm run dev`: dev server on :3000
- `npm run lint` / `npm run typecheck` / `npm run format:check`
- `npm test`: Vitest unit tests (`npm run test:coverage` for coverage)
- `npm run test:e2e`: Playwright against the Next app
- `npm run test:parity`: Playwright against both apps (Vue on :4173)

## Layout

- `src/app/`: routing files only, kept thin
- `src/components/{ui,layout,cart,sections}/`: shared components
- `src/features/<page>/components/`: components used by one page only
- `src/store/`: Zustand stores; `src/lib/`: data, pure helpers, validation
- `src/test/`: Vitest setup and helpers; `e2e/specs/`, `e2e/pages/`: Playwright

## Porting checklist (every component)

1. Read the Vue file and the components it uses.
2. Keep every Tailwind class string, text and `data-test` value exactly.
3. Accept `className`, `onClick` and other props and put them on the outer element, as Vue does automatically.
4. `v-show` → stay in the DOM but hidden; `v-if` → remove from the DOM.
5. Add `'use client'` only when the component uses state, effects, stores, browser APIs or event handlers.
6. Write the colocated `*.test.tsx`, covering what the user sees and does.
7. Run lint, typecheck and tests, then commit.

## Conventions

- Prettier: tabs, no semicolons, single quotes, trailing commas.
- Component files are PascalCase (`ButtonSolid.tsx`); everything else kebab-case.
- Conventional commits (`feat(cart): …`, `test(nav): …`, `docs: …`), one concern per commit.
- A new structural decision gets a new ADR in `docs/adr/`.
