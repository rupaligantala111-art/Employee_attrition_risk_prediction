"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Activity,
  Table2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "./data-provider";

type NavItem = { href: string; label: string; icon: LucideIcon };

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/prediction", label: "Prediction", icon: Sparkles },
  { href: "/performance", label: "Model Performance", icon: Activity },
  { href: "/explorer", label: "Data Explorer", icon: Table2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { dataset } = useData();

  return (
    <aside className="sticky top-0 flex h-screen w-[230px] flex-shrink-0 flex-col border-r border-border bg-panel px-3.5 py-5 max-lg:hidden">
      <div className="flex items-center gap-2.5 px-2 pb-5">
        <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-primary to-primary-2 text-[15px] font-extrabold text-white">
          HR
        </div>
        <div className="leading-[1.15]">
          <b className="block text-sm font-bold">Attrition Intelligence</b>
          <span className="text-[11px] text-muted">Hybrid ML + BI</span>
        </div>
      </div>

      <nav className="mt-1.5 flex flex-col gap-[3px]">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[13.5px] font-semibold transition-colors",
                active
                  ? "bg-primary text-white"
                  : "text-muted hover:bg-primary-soft hover:text-primary",
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border px-2.5 pt-3 text-[11px] leading-relaxed text-muted">
        Dataset: <b className="text-foreground">{dataset.records.length.toLocaleString()}</b> employee
        records
        <br />
        Model trained client-side on page load. No backend, no external API calls.
      </div>
    </aside>
  );
}
