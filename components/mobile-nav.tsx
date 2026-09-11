"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Sparkles, Activity, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prediction", label: "Predict", icon: Sparkles },
  { href: "/performance", label: "Model", icon: Activity },
  { href: "/explorer", label: "Data", icon: Table2 },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-panel/90 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-2 text-xs font-extrabold text-white">
          HR
        </div>
        <b className="text-sm">Attrition Intelligence</b>
      </div>
      <nav className="scroll-thin flex gap-1 overflow-x-auto px-2 pb-2">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                active ? "bg-primary text-white" : "text-muted hover:bg-primary-soft",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
