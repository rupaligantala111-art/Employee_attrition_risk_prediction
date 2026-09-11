import { cn } from "@/lib/utils";

type Kpi = {
  lbl: string;
  val: string;
  sub: string;
  tone: "neutral" | "bad" | "good";
};

export function KpiGrid({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-6">
      {kpis.map((k, i) => (
        <div
          key={k.lbl}
          className="animate-fade-up rounded-[var(--radius-card)] border border-border bg-panel p-4"
          style={{ animationDelay: `${i * 45}ms` }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {k.lbl}
          </p>
          <p
            className={cn(
              "mt-2 text-[22px] font-extrabold leading-none",
              k.tone === "bad" && "text-bad",
              k.tone === "good" && "text-good",
              k.tone === "neutral" && "text-foreground",
            )}
          >
            {k.val}
          </p>
          <p className="mt-1.5 text-[11px] text-muted">{k.sub}</p>
        </div>
      ))}
    </div>
  );
}
