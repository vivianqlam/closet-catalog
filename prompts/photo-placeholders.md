# Prompt log: line drawings for items without a photo

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** From a ux/ui standpoint the items without a photo aren't great... what should we do about that

15 of my 85 pieces have no photo, and the plain colored circle looked like a broken image next to real photos. The agent suggested two fixes: find photos for those pieces, and make "no photo" look intentional. I said go with both, placeholder first.

The agent opened Issue #41 and branch `feature/photo-placeholders`:
- New `src/app/closet/item-sketch.tsx`: a simple line drawing (top, bottoms, shorts, dress, coat, shoe, bag, hat, sports top) outlined in oxblood and filled with the item's color when the browser knows the color name.
- The category picks the drawing, but the item's name wins when it's clearer: "Speed Up Short" in Activewear draws shorts, a ball cap in Accessories draws a hat.
- On the closet grid, those tiles get a small "+ Add photo" pill. The whole card already opens the item page, where the photo button is.
- Used everywhere photos appear: closet grid, item page, trips, shared trip page and Style me. The old circle (`swatch.tsx`) is gone.

## Things that went sideways

- **The first version drew a bag for the ball cap and a sports bra for shorts,** because Activewear covers both. Matching on the item's name fixed it.
- **`npm run lint` reported thousands of problems** that all came from another session's leftover copy of the project in `.claude/worktrees`, not from the app. `eslint src tests` is clean.

## How it was checked

- `tsc`, `eslint src tests` and `npm test` (12 tests) pass.
- In the browser with my real closet: the cap shows a hat, the lululemon shorts show shorts, the black bra is filled black, and each tile has the "+ Add photo" pill.
