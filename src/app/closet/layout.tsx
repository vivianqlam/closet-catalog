import Link from "next/link";
import { logOut } from "../(auth)/actions";
import { NavLinks } from "./nav-links";

export default function ClosetLayout({ children }: LayoutProps<"/closet">) {
  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-4 pb-2">
          <Link href="/closet" className="text-sm font-semibold whitespace-nowrap uppercase tracking-[0.12em] sm:tracking-[0.18em]">
            Closet Catalog
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/closet/items/new"
              className="rounded-full bg-ink px-4 py-1.5 text-sm font-medium whitespace-nowrap text-paper hover:bg-accent"
            >
              + Add item
            </Link>
            <form action={logOut}>
              <button
                type="submit"
                className="rounded-full border border-line px-4 py-1.5 text-sm whitespace-nowrap hover:border-ink"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
        <NavLinks />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
