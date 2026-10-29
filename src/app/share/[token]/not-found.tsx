import Link from "next/link";

// Shown for a wrong link, or one whose owner has turned sharing off.
export default function SharedTripNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="label">Closet Catalog</p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">This packing list isn&apos;t shared</h1>
      <p className="mt-3 max-w-sm text-muted">
        The link may be mistyped, or its owner turned sharing off. Ask them for a fresh link.
      </p>
      <Link href="/" className="mt-6 rounded-full border border-line px-5 py-2 text-sm hover:border-ink">
        Go to Closet Catalog
      </Link>
    </main>
  );
}
