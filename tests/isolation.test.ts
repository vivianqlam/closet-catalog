// Test 1 from PLAN.md §4: data isolation.
//
// In plain English: two real test accounts log in to the real database.
// User A adds "Navy wool coat". User B, whose closet is empty, then loads
// their item list and also asks the database for everything it will give
// them. B must get zero items and never see A's coat, and B must not be able
// to change or delete it either. This is checked against Supabase itself
// (not a fake), because the privacy rules live in the database.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const userA = { email: process.env.TEST_USER_EMAIL, password: process.env.TEST_USER_PASSWORD };
const userB = { email: process.env.TEST_USER_B_EMAIL, password: process.env.TEST_USER_B_PASSWORD };
const configured = Boolean(url && key && userA.email && userA.password && userB.email && userB.password);

// Each user gets their own separate connection, like two people on two phones.
async function logIn(account: typeof userA) {
  const client = createClient(url!, key!, { auth: { persistSession: false } });
  const { error } = await client.auth.signInWithPassword({
    email: account.email!,
    password: account.password!,
  });
  if (error) throw new Error(`Couldn't log in as ${account.email}: ${error.message}`);
  return client;
}

describe.skipIf(!configured)("data isolation between users", () => {
  let a: SupabaseClient;
  let b: SupabaseClient;
  let coatId: string;
  // A unique name per run, so the test never trips over a leftover coat.
  const coatName = `Navy wool coat (isolation test ${Date.now()})`;

  beforeAll(async () => {
    [a, b] = await Promise.all([logIn(userA), logIn(userB)]);
    const { data, error } = await a
      .from("items")
      .insert({ name: coatName, category_id: 4, season: "winter", color: "Navy" })
      .select("id")
      .single();
    if (error) throw new Error(`User A couldn't add the coat: ${error.message}`);
    coatId = data.id;
  });

  afterAll(async () => {
    if (coatId) await a.from("items").delete().eq("id", coatId);
    await Promise.all([a?.auth.signOut(), b?.auth.signOut()]);
  });

  it("User A can see their own coat (so the test isn't passing by accident)", async () => {
    const { data } = await a.from("items").select("id, name").eq("id", coatId);
    expect(data).toEqual([{ id: coatId, name: coatName }]);
  });

  it("User B's item list is empty", async () => {
    // The same query the closet page runs.
    const { data, error } = await b.from("items").select("id, name");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("User B can't find the coat even by asking for it directly", async () => {
    const byId = await b.from("items").select("id").eq("id", coatId);
    const byName = await b.from("items").select("id").ilike("name", "%Navy wool coat%");
    expect(byId.data).toEqual([]);
    expect(byName.data).toEqual([]);
  });

  it("User B can't change or delete the coat", async () => {
    const updated = await b.from("items").update({ name: "Hacked" }).eq("id", coatId).select("id");
    const deleted = await b.from("items").delete().eq("id", coatId).select("id");
    expect(updated.data).toEqual([]);
    expect(deleted.data).toEqual([]);

    // And from A's side, the coat is untouched.
    const { data } = await a.from("items").select("name").eq("id", coatId).single();
    expect(data?.name).toBe(coatName);
  });
});
