# Prompt log: Tests (data isolation + dashboard stat)

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** *(Issue #27)* Write the two tests from PLAN.md §4: data isolation, and a dashboard stat.

The agent opened Issue #27 and branch `feature/tests`, and added:
- **Vitest**, a test runner, plus `npm test` to run it, and a `vitest.config.mts` that loads the Supabase address and test accounts from `.env.local` / `.env.test.local`.
- **`tests/isolation.test.ts`**: test users A and B log in to the real Supabase. A adds a "Navy wool coat"; B can't list it, find it by ID or name, or change or delete it. The test deletes the coat afterwards.
- **`tests/dashboard.test.ts`**: a pretend 6-item closet → 6 total, Tops 3 / Bottoms 1 / Shoes 2, most-worn "Black loafers" (5), 50% all-season, and an empty closet gives no made-up numbers.

> **Me:** *(on how to get a red screenshot for the isolation test)* Loosen the rule briefly.

The agent gave me the SQL for a temporary extra rule letting any logged-in user read any item, and the SQL to remove it. I ran both myself in the Supabase SQL editor.

> **Me:** Done, I ran it

The agent ran the isolation test in a terminal tab I could see. It went red (B saw all of A's items). I took screenshots and removed the rule right away.

> **Me:** *(about Supabase's "Potential issue detected… destructive operations" pop-up on the `drop policy` line)* getting this, is it okay to proceed?

The agent explained that Supabase warns on any `drop`. This one only removed the temporary rule, not any data, so it was safe to run. After that, the test went green again.

## Things that went sideways

- **Vitest wouldn't install.** It clashed with the version of `@types/node` the project had. The fix was pinning `@types/node` to 24.19.2 and renaming the config file from `.ts` to `.mts`.
- **The tests couldn't see the environment variables.** Vitest doesn't load `.env.local` the way Next.js does, so the isolation test had no Supabase address. Fixed by loading them in the config with `loadEnv(mode, cwd, "")`.
- **Copying the screenshots failed at first.** macOS puts an invisible special space before "PM" in screenshot file names, so the typed name didn't match. Fixed by matching the files by pattern.

## Design decisions and trade-offs

- **The isolation test uses the real database, not a fake.** The privacy rule lives in Supabase, so only a real check proves it. The cost: it needs internet and the test accounts in `.env.test.local`, and it skips itself without them.
- **A "sanity" check that User A *can* see the coat**, so the test can't pass just because nothing is there.
- **A unique coat name each run** (`Navy wool coat (isolation test <timestamp>)`), so a leftover coat from a crashed run can't confuse it.
- **The red run meant briefly loosening a rule on the live database.** It was open for about 2 minutes on Oct 30, 2026, and only the test accounts' items were read. The rule was removed right after, and the green run confirmed it was gone.

## How it was checked

- `npx vitest run`: both files pass (9 tests), Oct 30, 2026.
- **Isolation red/green (Oct 30):** with the temporary rule, 2 failed / 2 passed (B saw A's 5 items, including the coat). After dropping it, 4 passed.
- **Dashboard red/green (Oct 29):** with the most-worn calculation briefly broken, 1 failed / 4 passed. After restoring the code, 5 passed.
- Screenshots are in `docs/screenshots/`; the write-ups are in [docs/tests.md](../docs/tests.md).
