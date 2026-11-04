# Prompt log: fixing the gray haze from background removal

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** why does the background look like this *(a sandal photo with blotchy gray haze around it)*

The background remover had left the photo's white backdrop partly see-through, which showed as gray splotches on the blush tile. The agent:
- measured my uploaded sandal photo: about a quarter of its pixels were half see-through
- tested a cleanup on it (clearing faint leftovers and stray specks): much better, but haze touching the shoes remained
- compared the two AI models on the same product photo in the browser: the "quick" model (`isnet_quint8`) left ~9.8% of pixels half see-through, the standard model (`isnet_fp16`) ~0.4%, only about half a second slower

The agent opened Issue #54 and branch `fix/cutout-haze`, and changed `src/app/closet/items/remove-background.ts` to:
- use the standard model (about 80 MB, downloaded once and cached)
- clean the result: faint leftovers become fully clear, edges stay soft, and small specks not attached to the piece are removed (islands under 2% of the biggest one, so two shoes in one photo both stay)

## How it was checked

- `tsc`, `npm run lint` and `npm test` (34 tests) pass.
- In the browser, the real upload flow on an Edit page (not saved) with a product photo: done in about 3 seconds, with only 0.6% of pixels half see-through and 67% fully clear.
- Photos already uploaded with the quick model, like my Rollers Sandals, need to be uploaded again to get the cleaner cut.
