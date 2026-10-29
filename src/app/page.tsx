import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/closet");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="label">A wardrobe for every trip</p>
      <h1 className="mt-3 text-5xl font-medium tracking-tight">Closet Catalog</h1>
      <p className="mt-4 max-w-md text-lg text-muted">
        Remember everything you own, find the right pieces for every climate, and
        share what you&apos;re packing with friends.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-accent"
        >
          Create an account
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-line px-6 py-3 text-sm font-medium hover:border-ink"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
