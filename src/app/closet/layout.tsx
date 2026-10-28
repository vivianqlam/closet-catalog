import Link from "next/link";
import { logOut } from "../(auth)/actions";

export default function ClosetLayout({ children }: LayoutProps<"/closet">) {
  return (
    <>
      <header className="border-b border-line bg-white/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/closet" className="font-serif text-xl font-semibold">
            Closet Catalog
          </Link>
          <form action={logOut}>
            <button
              type="submit"
              className="rounded-full border border-charcoal/20 px-4 py-1.5 text-sm hover:bg-white"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
