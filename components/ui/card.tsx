import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-panel p-5 shadow-[0_1px_2px_rgba(23,26,43,0.04)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  children,
  hint,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hint?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h3 className={cn("text-[15px] font-bold text-foreground", className)} {...props}>
        {children}
      </h3>
      {hint ? <span className="text-[11px] font-medium text-muted">{hint}</span> : null}
    </div>
  );
}
