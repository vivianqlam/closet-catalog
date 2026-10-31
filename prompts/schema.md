# Prompt log: schema.md (database documentation)

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** before we start schema, what else in the app needs to be built from the plan? Is everything mostly complete?

The agent checked PLAN.md against the app code. All 7 spine features and all 3 custom features are built; only the optional outfit suggester (backlog) isn't. It found that one planned column, `users.display_name`, exists but isn't used.

> **Me:** Start schema.md

The agent opened Issue #31 and branch `docs/schema`, read the four SQL files in `supabase/migrations/`, and wrote `schema.md`:
- every table and column, with its rules (required, allowed values, defaults)
- the relationships, and what gets deleted along with what
- the privacy (Row Level Security) rule on each table, in plain English
- the private `item-photos` bucket and its folder-per-user rules
- the two share-link functions, `get_shared_trip` and `is_shared_photo`, and the known photo trade-off
- a short "changes from the plan" table

It also updated HANDOFF.md to show the tests are done.

## Things that went sideways

- **The agent first said `last_worn_on` was unused.** Checking the code showed the **Wore it** button sets it and the item page shows it as "Last worn." Only `display_name` is unused. schema.md reflects that.

## How it was checked

- Every table, column, rule and policy in schema.md was compared against `supabase/migrations/0001`–`0004`.
- The 24-character share token was checked against the code that makes it (`randomBytes(18)` in `src/app/closet/trips/actions.ts`).
- No database changes were made; this PR is documentation only.
