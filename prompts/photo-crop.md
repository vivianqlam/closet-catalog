# Prompt log: Crop photos before upload (addition to feature 8)

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** when I upload a photo of myself and there are other people in it, how do I specifiy who I am

**Agent (summary):** The app doesn't recognize people; a photo is just attached to one item. Crop to the outfit first. That looks better in the square tile and keeps friends' faces out of anything shared later with the trip link.

> **Me:** if I upload a photo of myself, will you be able to just capture the article of clothes?

**Agent (summary):** Three options:
1. a crop step where I drag a box around the clothing: free, reliable, small
2. automatic background removal: free, but it keeps the whole person
3. AI that finds the garment: sends photos to an outside service, costs per photo, and is less predictable

The agent recommended (1) now and backlogging (3), given Demo Day on Nov 4.

> **Me:** Add crop step

> **Me:** can you give me an example of what the photo might look like on the app? this way I know how to crop the photo / what pictures to take

**Agent (summary):** It showed a mockup of the square closet tiles: a flat lay that fills about 80% of the square, a piece on a hanger against a plain wall, a product link blended into the tile (all good), and a group shot where the jacket is tiny (crop it).

The agent opened Issue #20 and added:
- **A "Frame the clothing" box** that opens right after you pick a photo (`react-easy-crop` 6.2.4). It's a square, the same shape as the closet tiles. You drag the photo and use the zoom slider (or pinch on a phone) to fit just the piece inside.
- **Save photo** cuts out only the square, in the browser, then shrinks and uploads it as before. Nothing outside the square ever leaves your device.
- **Use whole photo** skips cropping, and **Cancel** uploads nothing.
- If the browser can't open the photo (e.g. some iPhone HEIC files on a laptop), it says so instead of showing a blank box.

## How it was checked

In the local app, logged in as the test account:
- Generated a fake "group photo" (three figures; the middle one in a coral jacket) and picked it → the crop box opened
- Zoomed and dragged so the square held only the coral jacket → **Save photo** → the stored photo was 667×667, coral in the middle and plain background at the edges, with neither neighbor in it
- Picked another photo → **Cancel** → the item's photo didn't change
- **Use whole photo** → stored uncropped (1200×800)
- Phone-sized screen: the box, slider and buttons fit
- Removed the test photo afterward; the test account's storage folder is empty
- `npm run build`, `tsc` and `eslint` pass
