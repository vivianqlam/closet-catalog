# Prompt log: line drawings that match the piece

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** for the images with the photo can we make them actually look like the actual item? for example the screen shot says long sleeve but that's not what that is.

The "no photo" drawings only had a few shapes, so my Swiftly Tech **Long-Sleeve** Shirt showed a sleeveless tank. The agent opened Issue #52 and branch `feature/better-sketches`:
- `src/app/closet/item-sketch.tsx`: 22 shapes instead of 9: tee, long sleeve/sweater, tank, sports bra, pants, leggings, shorts, skirt, dress, coat, puffer, vest, sneaker, boot, sandal/flip-flop, heel, flat/loafer, bag, belt bag, cap, headband and bikini. Every closed outline is filled with the item's color.
- The item's name picks the shape when it's clear (more specific words checked first), otherwise the category does. `sketchShape()` is exported so it can be tested.
- `tests/sketch.test.ts`: 24 checks using my real item names.

## Things that went sideways

- "Dolman sleeve button **down** shirt" first matched the puffer rule ("down"). The rule now only matches "down jacket/coat/parka".

## How it was checked

- `tsc`, `npm run lint` and `npm test` (34 tests) pass.
- In the browser, the white Swiftly Tech Long-Sleeve Shirt shows a long-sleeve drawing.
