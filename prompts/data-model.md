# Prompt log: Data model (feature 2)

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** Signed up, go

The agent started feature 2 from the user story in PLAN.md (users plus two or more related tables). It opened Issue #5, created the `feature/data-model` branch, and added:
- `supabase/migrations/0002_data_model.sql`: five tables (`categories`, `items`, `trips`, `trip_items`, `stars`), matching the diagram in PLAN.md §3
  - `categories` is one shared list (Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories) that everyone can read
  - `items`, `trips` and `stars` each belong to one user, and privacy rules (Row Level Security) mean you only ever see your own rows
  - `trip_items` links trips to items (many-to-many); you can only pack your own items into your own trips
  - the database itself rejects bad data: blank names, unknown seasons, or a trip that ends before it starts
- `src/lib/types.ts`: the same shapes written in TypeScript so the app code knows what each row looks like
- an updated `/closet` page that shows your item count and one tile per category

> **Me:** can we take from this app? https://github.com/tandpfun/wardrobe I like the formatting of it and I think a lot of it is replicable to what i'm hoping to get out of my project. Let me know your thoughts or any nuances between this and what I want to do

**Agent (summary):** Borrow the *look*, not the code. That app stores clothes in local files on one computer, with no accounts, and pays for an AI service to cut out photo backgrounds. Ours needs logins, a real database, trips and a share link, so its code doesn't transfer. Its design does: off-white paper background, near-black text, a muted burgundy accent, Instrument Sans in small uppercase labels, category tabs, a "floating" image grid, and a side panel for item details. A free trick (product photos on white plus `mix-blend-multiply`) gets a similar cut-out look without paying for AI.

> **Me:** Yes, adopt it

**Agent (summary):** The new look starts with feature 3 (add/view/edit/delete). The photo feature will also accept a pasted product-image link. The repo is MIT-licensed and will be credited in the README. Because PLAN.md must stay as written, this goes in the Plan vs. Reality table as a "Changed" row: design palette and font switched from linen/terracotta + Fraunces to the wardrobe repo's paper/ink/burgundy + Instrument Sans.

## How it was checked

- The SQL was run in the Supabase SQL Editor
- Checked from the API with the public key and no login: `categories` returns the 6 categories, while `items`, `trips`, `trip_items` and `stars` return empty lists (privacy rules hide other people's rows)
- `npx tsc --noEmit` and `npm run lint` pass
