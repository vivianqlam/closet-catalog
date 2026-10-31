# Handoff notes

A running status file for whoever (person or AI agent) picks this project up next.
Last updated: Oct 30, 2026. Demo Day: **Wed Nov 4, 2026**.

Read this first, then [PLAN.md](PLAN.md) (the original plan; never edit it, only append the Plan vs Reality table at the bottom) and the per-feature logs in [prompts/](prompts/).

## The assignment, in short

Build Closet Catalog the professional way:
- **Workflow for every change:** GitHub Issue → feature branch → build → `prompts/<feature>.md` log → PR that says "closes #N" → merge → Vercel deploys main.
- No direct commits to `main`. At least 9 merged PRs (we have 13).
- 7 spine features plus 3 custom ones (photo upload, trip packing lists, share link). At least 5 real entries on the live site.
- 2 tests (data isolation; a dashboard stat). Each needs a plain-English explanation, a red and a green screenshot, and a "what would break it" note.
- Also needed: `schema.md`, `README.md`, a Plan vs Reality table appended to PLAN.md, and a reflection.

**About the owner:** Vivian is not a developer. Explain everything in plain English and keep steps short.

## Live links

- Live site: https://closet-catalog-omega.vercel.app (Vercel auto-deploys `main`)
- GitHub: https://github.com/vivianqlam/closet-catalog
- Supabase SQL editor: https://supabase.com/dashboard/project/dfbcwbgvtyskaxaezzpp/sql/new

## What's built (all merged to main)

| PR | Feature | Prompt log |
|----|---------|------------|
| #2 | PLAN.md | prompts/plan.md |
| #4 | Sign up, login, logout | prompts/auth.md |
| #6 | Data model: categories, items, trips, packing lists, stars (RLS on every table) | prompts/data-model.md |
| #8 | Add, view, edit, delete items | prompts/items.md |
| #10 | Friendly form validation | prompts/validation.md |
| #12 | Star favorites + Starred tab | prompts/stars.md |
| #14 | Search, filter, sort | prompts/search-filter-sort.md |
| #16 | Dashboard with chart and stats | prompts/dashboard.md |
| #18 | Item photos (upload or product image link), private storage bucket | prompts/photos.md |
| #21 | Crop step before upload (square, react-easy-crop) | prompts/photo-crop.md |
| #22 | Trip packing lists with suggestions by climate | prompts/trips.md |
| #24 | Read-only share links for packing lists | prompts/share-link.md |
| #26 | Optional photo on the Add item form | prompts/photo-on-add.md |

All four SQL migrations in `supabase/migrations/` have been run on the live database.

## In progress: tests (Issue #27, branch `feature/tests`)

The branch is pushed, but there's **no PR yet**. One commit (`f78e44e`) adds:
- `vitest.config.mts`, plus `"test": "vitest run"` in package.json
- `tests/dashboard.test.ts`: a 6-item closet → total 6, Tops 3 / Bottoms 1 / Shoes 2, most-worn "Black loafers" (5), 50% all-season, and an empty closet gives nulls
- `tests/isolation.test.ts`: test users A and B log in to the real Supabase. A adds a "Navy wool coat". B can't list it, find it by id or name, or update or delete it. The test cleans up after itself.

Run it with `npx vitest run`. Both files pass (9 tests, checked Oct 30). The isolation test needs `.env.test.local` (see below).

Remaining steps for the tests:
1. **Dashboard red/green screenshots: done.** They're on Vivian's Desktop, probably `Screenshot 2026-10-29 at 2.58.26 PM.png` (red) and `... 3.00.37 PM.png` (green). Confirm with her.
   - The red run came from briefly breaking the most-worn sort in `src/lib/dashboard.ts`, which was then restored.
2. **Isolation red/green screenshots: not done.** Vivian chose to "loosen the rule briefly":
   1. Vivian runs this in the Supabase SQL editor (as of Oct 30 it has **not** been run; the tests were green):
      `create policy "TEMP demo: any logged-in user can read items" on public.items for select to authenticated using (true);`
   2. Run `clear && npx vitest run tests/isolation.test.ts --reporter=verbose` in a terminal she can see. It should go red. She screenshots it.
   3. **Right away**, she runs `drop policy "TEMP demo: any logged-in user can read items" on public.items;`. Re-run the test; it should be green (4 passed). She screenshots it.
   4. Never leave the TEMP policy in place: while it exists, every logged-in user can read every item.
3. Copy the 4 screenshots into `docs/screenshots/`. Write the test write-ups (plain English, plus "what would break it"), e.g. `docs/tests.md` or a section of the README.
4. Write `prompts/tests.md` (Key prompts / Things that went sideways / How it was checked). Sideways so far:
   - a Vitest install conflict, fixed by pinning `@types/node` 24.19.2 and renaming the config to `.mts`
   - env vars, fixed by loading them with `loadEnv(mode, cwd, "")`
5. Open the PR ("closes #27"). Merge only when Vivian says so.

## Still to do after the tests

- [ ] `schema.md`: tables, columns, RLS rules, the storage bucket, and the share-link functions (read `supabase/migrations/`).
- [ ] `README.md` (doesn't exist yet): what the app is, the live URL, tools used, how to run (`npm install`, `.env.local`, `npm run dev`, `npm test`). Credit the design: the look is adapted from the MIT-licensed tandpfun/wardrobe repo.
- [ ] **Plan vs Reality table** appended to PLAN.md. Items to include:
  - the wardrobe look replaced the planned palette/font ("Changed")
  - added the crop step
  - added the photo on the Add form
  - photo links as well as uploads
  - the share-link trade-off: while a trip is shared, its photos are readable by anyone with the link
- [ ] Vivian adds 5+ real items on the **live** site from her phone.
- [ ] Help with the reflection; prep for Demo Day.
- [ ] Each of the docs above goes through the same Issue → branch → PR flow.

## Tech notes (things that will trip you up)

- **Next.js 16.4.3.** Read `node_modules/next/dist/docs/` before writing code (see AGENTS.md).
  - `src/proxy.ts` replaces middleware.
  - Page `params` and `searchParams` are Promises (`PageProps<"/route">`).
  - Run `npx next typegen` after adding routes.
- **Tailwind v4:** the theme is in `src/app/globals.css`.
  - Palette: paper `#f4f0e8`, ink `#191919`, muted `#66625d`, line `#cfc8bc`, accent `#6e302e`, tile `#ebe5da`.
  - Font: Instrument Sans.
- **Supabase:** `@supabase/ssr` with the publishable key, and RLS on every table.
  - Photos are in the private bucket `item-photos`, in per-user folders, shown via 1-hour signed URLs.
  - Share links use the security-definer SQL functions `get_shared_trip` and `is_shared_photo`.
- **Forms:** Server Actions + `useActionState`.
  - The form uses `key={state.attempt}` so it redraws after a failed save.
  - Read live values through a `useRef`, because the action closure is stale.
- **Dev server:** `npm run dev` on http://localhost:3000.
  - Restart it after adding route folders.
  - If you get a hydration error after switching branches, run `rm -rf .next`.

## Accounts and secrets

- `.env.local` and `.env.test.local` are gitignored. **Never commit them, and never print the values in chat.**
- **Never use or ask for the Supabase secret/service_role key.**
- **Test accounts** (local testing only, never on the production URL):
  - `test-a@closetcatalog.test` holds the test items "Test striped shirt", "Test white tee" (has a photo), "Test navy blazer", "Test black loafers", and the trip "Test beach week" (sharing off).
  - `test-b@closetcatalog.test` is empty, on purpose, for the isolation test.
  - Their passwords are in `.env.test.local`.
- Vivian's own live account: if she can't log in, she can sign up with a `+closet` alias of her Gmail.

## Working rules Vivian has set

- Ask before any change to the live database. Give her the SQL; she runs it.
- Merge PRs with `gh` only after she explicitly says "you merge it", each time.
- She picks every photo herself. Don't browse or upload from her photo library.
