# Prompt log: Search, filter and sort (feature 6)

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** You merge it *(PR #12, then go on to feature 6)*

The agent started feature 6 from the user story in PLAN.md and opened Issue #13. It added:
- **A search and filter bar** on `/closet`:
  - a search box (matches name *or* brand, ignoring upper/lower case)
  - menus for season, formality, and sort (Newest, Oldest, Most worn, A–Z)
  - menus apply as soon as you pick something; the search runs on Enter or "Search"
  - "Clear" resets everything
- **Choices live in the page address**, e.g. `/closet?q=blazer&season=winter&sort=worn`. Refreshing, the back button, or sharing the link all keep them. The category and Starred tabs keep your other choices too.
- **Tab counts follow the filters**, so with "Winter" picked, "Outerwear 1" means one winter-ready outerwear piece. The top right says "Showing X of Y".
- **"Nothing matches those filters."** with a "Clear filters" button when nothing is left.
- `src/lib/closet-filters.ts` reads the address safely: unknown values like `?season=bogus` are ignored rather than breaking the page.

## Design decisions

- **Picking a season also shows all-season pieces.** Answering "what can I wear in winter?" should include your all-season loafers. "All-season only" is its own option for when you want just those.
- **Search, season, formality and sort run in the database.** Category and Starred are applied after, so each tab can show its own count.
- **Search text is cleaned before it reaches the database.** Characters like `,` `(` `%` have special meaning in Supabase's filter syntax, so they're dropped. Searching `(,%` just shows everything instead of causing an error.

## Things that went sideways

1. **On a phone, the header's buttons wrapped onto two lines** ("+ Add / item"). Fixed by keeping them on one line and tightening the wordmark's letter spacing on small screens.

## How it was checked

In the local app, logged in as the test account, with three test items (navy blazer: Outerwear, winter, business, J.Crew; olive chinos: Bottoms, spring; black loafers: Shoes, all-season, worn twice):

| Address | Result |
|---|---|
| `?q=crew` | blazer (brand match) |
| `?q=NAVY` | blazer (case doesn't matter) |
| `?season=winter` | blazer + loafers (all-season included) |
| `?season=all-season` | loafers only |
| `?formality=business` | blazer |
| `?sort=worn` | loafers first |
| `?sort=az` | loafers, blazer, chinos |
| `?sort=oldest` | loafers, chinos, blazer |
| `?season=winter&category=5` | loafers (Shoes tab keeps the season filter) |
| `?q=zzz` | "Nothing matches those filters." |
| `?q=(,%` | no error; everything shown |
| `?season=bogus&sort=bogus` | ignored; normal closet |

Also, by hand in the browser: picking "Winter" applied right away; typing "blazer" + Enter narrowed to one; "Clear" reset the bar and showed all 3. On a phone-sized screen there's no sideways scrolling. `tsc` and `eslint` pass.
