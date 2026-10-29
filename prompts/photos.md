# Prompt log: Photos (feature 8, custom feature 1)

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me (during planning):** how will you access my photos? I don't want to give you full access. Can I pick and choose

**Agent (summary):** The app never gets access to your photo library. The "Upload photo" button opens your phone's own picker, and only the one photo you choose is sent.

> **Me:** Yes, adopt it *(the tandpfun/wardrobe look; the agent offered a "paste a product image link" option to get its cut-out catalogue style without paid AI background removal)*

> **Me:** You merge it *(PR #16, then go on to feature 8)*

The agent opened Issue #17 and added:
- **`supabase/migrations/0003_photos.sql`** (I ran it in the SQL Editor):
  - a **private** storage bucket, `item-photos`, limited to JPG/PNG/WebP and 2 MB per file
  - storage rules so each account can only read, add or delete files in its own folder (`<user id>/…`)
  - a new `photo_url` column on items for pasted product-image links (must start with `https://`)
- **On each item's page:** Upload photo / Replace photo, Paste image link, and Remove.
  - The upload uses your phone's normal camera or photo picker (`<input type="file">`), so only the photo you pick is sent.
  - The photo is **shrunk in the browser** first (`browser-image-compression`: at most 1600 px and about 1 MB) before it leaves your phone.
- **Showing photos:** because the bucket is private, the app creates **signed links** that stop working after an hour. A link copied out of the page won't keep working.
- **Image links** get the wardrobe repo's trick, `mix-blend-multiply`: a product shot on a white background blends into the tile, so the item looks cut out.
- **Cleanup:** replacing a photo, switching to a link, Remove, or deleting the item also deletes the old photo file from storage.

## Things that went sideways

1. **After switching from an upload to a link, the old photo's address still loaded.** That looked like the file hadn't been deleted. The agent logged in as the test account with a small script and listed the storage folder, which was empty, so the delete had worked. Supabase's cache was still serving the copy behind the old signed link, and that link expires within an hour anyway.

## How it was checked

In the local app, logged in as the test account:
- Before logging in: listing the bucket returned nothing, and an upload attempt was refused ("new row violates row-level security policy")
- Uploaded a 3000×3000 test image → it showed on the item page and grid; the stored copy was **1600×1600, 25 KB**; and the file can't be opened without the signed link
- Pasted `http://…` → "Please use a link that starts with https://"
- Pasted an `https://` product-style image on white → shown blended into the tile; the old uploaded file was deleted from the folder
- **Remove** → back to the color circle
- Uploaded a photo to another item, then deleted that item → the folder was empty again
- `npm run build`, `tsc` and `eslint` pass
