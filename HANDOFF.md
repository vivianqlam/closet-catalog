# Handoff notes

A running status file for whoever (person or AI agent) picks this project up next.
Last updated: Oct 30, 2026. Demo Day: **Wed Nov 4, 2026**.

Read this first, then [PLAN.md](PLAN.md) (the original plan; never edit it, only append the Plan vs Reality table at the bottom) and the per-feature logs in [prompts/](prompts/).

## The assignment, in short

Build Closet Catalog the professional way:
- **Workflow for every change:** GitHub Issue → feature branch → build → `prompts/<feature>.md` log → PR that says "closes #N" → merge → Vercel deploys main.
- No direct commits to `main`. At least 9 merged PRs (we have 14).
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
| #30 | Tests: data isolation + dashboard stat | prompts/tests.md |

All four SQL migrations in `supabase/migrations/` have been run on the live database.

## Tests: done (PR #30, Issue #27)

- Run them with `npm test` (9 tests). The isolation test needs `.env.test.local`.
- Write-ups with red/green screenshots: [docs/tests.md](docs/tests.md). Screenshots: `docs/screenshots/`. Prompt log: [prompts/tests.md](prompts/tests.md).
- The isolation red run used a TEMP "any logged-in user can read items" policy on Oct 30. It was dropped right after, and the green run (4 passed) confirmed it was gone.

## Still to do

- [x] `schema.md` (Issue #31, branch `docs/schema`). Note: `users.display_name` exists but isn't used by the app.
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
