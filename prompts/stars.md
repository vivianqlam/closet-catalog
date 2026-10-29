# Prompt log: Stars (feature 5)

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** You merge it *(PR #10, then go on to feature 5)*

The agent started feature 5 from the user story in PLAN.md and opened Issue #11. It added:
- A `toggleStar` server action. Starring adds one row to the `stars` table (who + which item); unstarring removes it. This is the single junction table the assignment asks for, built in feature 2.
- A star button (☆ / ★) in the corner of every tile in the closet grid, and next to the item name on the detail page. It sits outside the tile's link, so tapping it stars the item without opening it.
- The star flips right away when tapped (React's `useOptimistic`), and the save happens in the background.
- A **★ Starred** tab next to "All" with a count. It shows only starred pieces, or "No starred pieces yet. Tap ☆ on any item to add it here." when there are none.

## Privacy

The database rules from feature 2 already make sure you can only see your own stars, and can only star items you own. Deleting an item also deletes its stars automatically.

## How it was checked

In the local app, logged in as the test account, with two test items ("Test black loafers" and "Test olive chinos"):
- Tapped ☆ on the loafers in the grid → turned into a burgundy ★, the page stayed on the grid, and the Starred tab count went 0 → 1
- Opened the Starred tab → only the loafers were shown
- Opened the loafers' detail page → the star was filled in; tapped it to unstar → ☆
- Starred tab → count 0 and the "No starred pieces yet" message
- `tsc` and `eslint` pass
