import { createClient } from "@/lib/supabase/server";

export default async function ClosetPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("users").select("email").single();

  return (
    <section>
      <h1 className="font-serif text-3xl font-semibold">Your closet</h1>
      <p className="mt-2 text-charcoal/70">
        Logged in as <span className="font-medium">{profile?.email}</span>. Items will
        show up here once the catalogue feature is built.
      </p>
    </section>
  );
}
