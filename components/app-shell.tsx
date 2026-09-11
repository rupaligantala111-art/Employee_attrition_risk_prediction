"use client";

import { DataProvider } from "./data-provider";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <MobileNav />
          <main className="min-w-0 flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </DataProvider>
  );
}
