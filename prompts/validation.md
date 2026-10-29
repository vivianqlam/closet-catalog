# Prompt log: Validation (feature 4)

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** You merge it *(PR #8, then go on to feature 4)*

The agent started feature 4 from the user story in PLAN.md and opened Issue #9. It added:
- `src/lib/validation.ts`: one function, `validateItem`, that checks a submitted item and returns either a clean row to save or a list of friendly messages, one per field:
  - blank name → "Please give this item a name." (a name of only spaces counts as blank)
  - no category → "Please choose a category."
  - no season → "Please choose a season."
  - name over 80 characters → "Please keep the name under 80 characters."
  - color or brand over 60, notes over 500 → "Please keep … under … characters."
  - a formality that isn't on the list → "Please choose a formality from the list."
- The add and edit actions now run `validateItem` **on the server** before saving, so the rules can't be skipped by changing the page in the browser. The database's own checks (from feature 2) are a second safety net behind them.
- The form shows each message in burgundy under its field, outlines that field, and adds "Please fix the highlighted fields." above the Save button. Required fields are marked with `*`. Screen readers announce the message for the field they're on.
- The browser's own grey pop-up bubbles are turned off (`noValidate`) so our friendlier wording shows instead.

`validateItem` doesn't use Next.js or Supabase, so it can be unit tested on its own later.

## Things that went sideways

1. **The Category dropdown went blank after a failed save.** Typed text was kept, but React clears a form after every save attempt, and a dropdown snaps back to "Choose…" when that happens. The fix counts save attempts and redraws the form after each one, filled in with what was typed.
2. **A "Hydration failed" error screen during testing.** The local server was still serving the old form while the browser had the new code, because git had just switched branches underneath it. Clearing Next's build cache (`.next`) and restarting the local server fixed it. It wasn't a bug in the app.
3. **The linter refused a small helper component** defined inside the form (React rule: components must not be created during render). It was moved outside the form.

## How it was checked

In the local app, logged in as the test account:
- Submitted a completely empty form → the three messages for name, category and season, with each field outlined
- Filled name, category, color and brand but no season → only "Please choose a season."; everything typed (including the Category dropdown) was still there
- An 81-character name → "Please keep the name under 80 characters."
- Fixed the name → saved and opened the new item's page
- On the Edit page, replaced the name with spaces → "Please give this item a name." and the item was not changed
- Deleted the test item afterward
- `tsc` and `eslint` pass
