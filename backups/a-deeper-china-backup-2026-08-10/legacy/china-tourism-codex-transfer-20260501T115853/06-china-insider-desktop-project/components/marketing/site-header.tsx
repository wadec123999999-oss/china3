import Link from "next/link";

import { en } from "@/lib/i18n/en";

const navItems = [
  { href: "/", label: en.navigation.home },
  { href: "/chat", label: en.navigation.chat },
  { href: "/experts", label: en.navigation.experts },
  { href: "/account", label: en.navigation.account },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#d9c8ae]/55 bg-[#fbf7ef]/92 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link className="flex leading-none" href="/">
          <span className="font-serif text-[20px] font-semibold tracking-[-0.02em] text-[#2b211d] sm:text-[24px]">
            A Deeper China
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-[#66554a] sm:gap-7">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="transition hover:text-[#201814]"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
