"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/closet", label: "Closet" },
  { href: "/closet/dashboard", label: "Dashboard" },
];

// Section links under the header; the current one is underlined.
export function NavLinks() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/closet"
      ? pathname === "/closet" || pathname.startsWith("/closet/items")
      : pathname.startsWith(href);

  return (
    <nav aria-label="Sections" className="mx-auto flex max-w-6xl gap-5 px-4">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
          className={`label -mb-px border-b-2 py-2 ${
            isActive(link.href) ? "border-ink !text-ink" : "border-transparent hover:!text-ink"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
