# Prompt log: real closet import + Activewear category

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** I do want to input my clothing items which I think could help hone in on the ux/ui. I had instinct pull from my email to find things i've purchased in the last 5 years. not everything is something i've kept or things I currently wear, but it's a great start.

The agent suggested a keep-or-toss checklist before touching the app. It read the Instinct export (114 items, 81 store photos) and built a private checklist page with Keep / Toss buttons and a guessed category and season for each item.

> **Me:** Done, check it

The agent read the choices back: 74 kept, 40 tossed. It asked three questions, and I picked:
- use the store photos for now
- add an **Activewear** category for the 25 workout pieces
- tidy the receipt names (ALL CAPS, store codes like "BLK 4", "*Online Only")

> **Me:** Looks good, build it

The agent opened Issue #33 and branch `feature/activewear-import`:
- `supabase/migrations/0005_activewear.sql` adds category 7, Activewear. The app reads categories from the database, so no code changed.
- The import SQL, the 59 photos and a step-by-step HOW-TO went into `imports/closet-2026-11/`, which is **git-ignored**.

## Things that went sideways

- **Instinct's link needed a sign-in, then failed the "are you human" check.** I sent a zip of the export instead.
- **This repo is public.** My item list, email and store photos shouldn't be on GitHub, so they stay in the ignored `imports/` folder. Only the category migration and the docs are committed.
- **One "photo" was really a WebP file named .jpg, and one was 2560px wide.** The agent converted every photo to a real JPEG, at most 1200px, all under 250 KB, so they fit the bucket's 2 MB, JPEG/PNG/WebP rule.

> **Me:** can we edit some of the photos to just the item? I want it to look standard across all items despite what the website has

The agent used the Mac's built-in subject cut-out (Apple Vision) to remove each background, then centered the item on a square tile in the app's beige (#EDE6DA). Product shots came out clean. Photos with a model still show the model, because the tool can't separate a garment from the person wearing it.

## More things that went sideways

- **Wrong email.** The import looked me up by my personal email, but my app account uses my school email. Listing every account (`select id, email from public.users`) caught it before anything ran. That also showed that the only photo folder in storage belonged to the test-a account, not me.
- **Supabase warned "creates a table without RLS."** It was a false alarm: the import only adds rows to `items`, which already has RLS on. I clicked "Run and enable RLS", which changed nothing.

## How it was checked

- The 0005 migration uses `on conflict do nothing`, so running it twice is harmless.
- The import uses fixed item ids, so running it twice is also harmless. It links a photo only if that file is actually in storage, and it ends with a count to check (74 items, 59 with photos).
- Vivian ran it on Nov 3, 2026. The final check said 74 items, 59 with photos.
