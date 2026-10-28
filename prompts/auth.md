# Prompt log: Sign up and login (feature 1)

Agent: Claude Code (Claude Opus 5.5)

## Key prompts

> **Me:** Merged + ready

The agent started feature 1 from the user story in PLAN.md: "As a new visitor, I want to create an account with my email and a password, then log in and log out, so that my closet is private to me."

**Agent (summary):** Opened Issue #3, created the `feature/auth` branch, generated a Next.js 16 + Tailwind starter, and added:
- `supabase/migrations/0001_users.sql`: a `users` table, a rule that each user can only read their own row, and a trigger that adds a row on every sign up
- sign up and login pages with friendly error messages, plus a logout button
- `src/proxy.ts`, which keeps the session fresh and sends logged-out visitors to `/login`

> **Me:** plain english

**Agent (summary):** Rewrote the three Supabase setup steps (paste keys, run the SQL, turn off "Confirm email") without jargon.

> **Me:** should I paste my publishable key for you here?

**Agent (summary):** It's safe, since the publishable key is meant to be public and the database's privacy rules protect the data, but never share the secret / service_role key.

## Things that went sideways

1. **Build failed on the first try.** Next.js 16's new starter turns on `cacheComponents`, which pre-builds pages ahead of time. Our pages read the login cookie, so the build errored ("encountered uncached or runtime data during prerendering"). The agent read the Next.js docs bundled with the project and turned the setting off, since every page in this app is personal to the logged-in user.
2. **"relation users already exists" in the SQL Editor.** I ran the SQL a second time. The agent checked from the API that the table already existed with the right columns, so the first run had worked.
3. **Supabase renamed its key.** It now gives a "publishable key" (`sb_publishable_...`) in place of the old "anon key", so the env variable is named `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## How it was checked

The agent ran the app locally and in the browser:
- Submitted an empty sign-up form → "Please enter your email."
- Signed up a test account → landed on `/closet` showing its email (read from the `users` table, which proves the trigger worked)
- Logged out → visiting `/closet` redirected to `/login`
- Wrong password → "That email and password don't match an account."
- Correct password → back in the closet
