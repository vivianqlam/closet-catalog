# Prompt log: Dashboard (feature 7)

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** You merge it *(PR #14, then go on to feature 7)*

The agent started feature 7 from the user story in PLAN.md and opened Issue #15. It added:
- **`/closet/dashboard`**, linked from new "Closet / Dashboard" tabs under the header. It has three stats:
  - **Total items**: the big headline number
  - **Most worn**: the item with the highest "times worn" count (a tie goes to the name that comes first A–Z), linked to its page. It says "Nothing worn yet" if nothing has been worn.
  - **All-season**: the share of the closet that's all-season, as a whole-number percent, or "—" for an empty closet
- **A bar chart of items per category**, built with Recharts:
  - horizontal bars, so "Accessories" fits on a phone
  - hovering a bar shows "Tops: 2 items"
  - a "Show as a table" option gives the same numbers as a table
  - screen readers get a one-sentence summary of the chart
- **`src/lib/dashboard.ts`**: one function, `computeDashboard`, that does all the math from a plain list of items. It doesn't use the database or Next.js, so the dashboard test from PLAN.md can check it directly.

## Design decisions

- **Chart color.** The app's burgundy accent (`#6e302e`) failed the dataviz color checks for a chart mark: it was too dark and too gray to read as a colored bar. The agent ran the palette validator and picked a lighter step from the same family (`#9c4a43`), which passes on the paper background. Numbers and labels stay in the text colors, not the bar color.
- **One series → no legend.** The chart title says what the bars are.

## How it was checked

In the local app, logged in as the test account:
- 3 test items (blazer, chinos, loafers worn twice) → Total 3, Most worn "Test black loafers · Worn 2 times", All-season 33%, with bars for Bottoms, Outerwear and Shoes
- Added 2 tops (one all-season) → Total 5, All-season 40% (2 of 5), Tops bar = 2; the table matched the chart
- Hovering the Tops bar → "Tops: 2 items"
- Phone-sized screen: stats stack, the chart fits, no sideways scrolling
- `npm run build` (production build) succeeds, and `tsc` and `eslint` pass
