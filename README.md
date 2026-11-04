# Closet Catalog

A wardrobe catalogue that remembers what I own and helps me pack. I add each piece once (with a photo), then browse, search and filter my closet, build outfits, and make packing lists for trips that I can share with friends.

**Live site:** https://closet-catalog-omega.vercel.app

Built by Vivian Lam for Intro to Coding (MBA, Fall 2026), with Claude Code as the coding agent. Every change went through GitHub Issue → feature branch → pull request.

## What it does

- **Your closet:** add, edit and delete pieces (name, category, color, season, formality, brand, notes). A photo grid with search, filters (category, season, formality, starred) and sorting.
- **Photos:** upload from your phone (with a crop step) or link a store's product image. Pieces without a photo show a line drawing of what they are.
- **Stars and "Wore it":** star favorites; tap "Wore it" to count wears.
- **Dashboard:** a chart of pieces per category and closet stats.
- **Style me:** flip through tops, bottoms and shoes to build an outfit, or let "Surprise me" pick one.
- **Trips:** make a trip (destination, dates, climate, type), add pieces with suggestions for the climate, and check them off as you pack.
- **Share a trip:** turn on a read-only link so friends can see what you're packing, no login needed. Turning it off stops the link right away.
- **Private by design:** every table uses Row Level Security, so each person only ever sees their own closet. See [schema.md](schema.md).

## Built with

| Tool | Used for |
|---|---|
| [Next.js 16](https://nextjs.org) + TypeScript | Pages and server logic |
| [Supabase](https://supabase.com) | Postgres database, login (email + password), private photo storage |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [Recharts](https://recharts.org) | Dashboard chart |
| react-easy-crop, browser-image-compression | Cropping and shrinking photos before upload |
| [Vitest](https://vitest.dev) | Tests |
| [Vercel](https://vercel.com) | Hosting; deploys `main` automatically |
| [Claude Code](https://claude.com/claude-code) | Coding agent |

## Run it on your computer

1. Install [Node.js](https://nodejs.org) (version 20 or newer).
2. Install the packages:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in your Supabase project's URL and publishable key (Supabase → Project Settings → API). Never commit `.env.local`.
4. Set up the database: in the Supabase SQL Editor, run the files in [`supabase/migrations/`](supabase/migrations/) in order (0001 → 0005).
5. Start the app and open http://localhost:3000:
   ```bash
   npm run dev
   ```

## Tests

```bash
npm test
```

The data isolation test also needs two test accounts in `.env.test.local` (not committed). What each test checks, with red and green screenshots, is in [docs/tests.md](docs/tests.md).

## Project docs

- [PLAN.md](PLAN.md): the original plan, with a Plan vs Reality table at the bottom
- [schema.md](schema.md): the database, tables and privacy rules
- [HANDOFF.md](HANDOFF.md): status notes for whoever picks the project up next
- [prompts/](prompts/): a log of the key prompts and what went sideways for each feature

## Credits

The original layout and neutral palette were adapted from [tandpfun/wardrobe](https://github.com/tandpfun/wardrobe) (MIT License), including the trick of blending product photos into the tile color. The current oxblood and ballet-pink look, Shrikhand headlines and line drawings were designed for this project.
