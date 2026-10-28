import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/closet");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-serif text-5xl font-semibold tracking-tight">Closet Catalog</h1>
      <p className="mt-4 max-w-md text-lg text-charcoal/70">
        Remember everything you own, find the right pieces for every climate, and
        share what you&apos;re packing with friends.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-terracotta px-6 py-3 font-medium text-white hover:opacity-90"
        >
          Create an account
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-charcoal/20 px-6 py-3 font-medium hover:bg-white"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
