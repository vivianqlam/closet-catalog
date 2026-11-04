# Prompt log: "Use whole photo" fix (stranger test)

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** Feedback from user: 1) when they added a photo and selected "use whole photo" it still cropped it weird. 2) when they inputted an item it seemed to take them a long time copy and pasting from the website… 3) in the style section they wanted to add accessories like a purse…

The agent found the cause of #1: "Use whole photo" does save the whole photo, but every tile showed uploaded photos zoomed to fill a square (`object-cover`), so a tall or wide photo lost its edges. It recommended fixing #1 (small, affects every new user, and the button wasn't doing what it says) and planning #2 as its own feature, since many stores block apps from reading their pages.

> **Me:** Do the link autofill

The agent opened Issue #45 and a branch, then I stopped it.

> **Me:** sorry can we actually fix #1 instead

The agent left Issue #45 open as planned future work, opened Issue #46 and branch `fix/whole-photo`, and changed `src/app/closet/item-image.tsx` to show uploaded photos fitted inside the tile (`object-contain`). Square photos (cropped or cut out) look the same as before; a whole, non-square photo now shows completely with the tile color around it.

## How it was checked

- `tsc`, `npm run lint` and `npm test` (12 tests) pass.
- In the browser, a tall test image swapped into one tile (not saved) showed fully, top to bottom, and the square photos around it were unchanged.
