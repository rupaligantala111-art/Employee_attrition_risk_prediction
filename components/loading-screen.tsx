export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-background">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-primary-2 text-base font-extrabold text-white">
          HR
        </div>
        <div className="leading-tight">
          <p className="text-[15px] font-bold text-foreground">Attrition Intelligence</p>
          <p className="text-xs text-muted">Hybrid ML + BI</p>
        </div>
      </div>
      <div className="h-1 w-56 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/3 animate-[loading_1.1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary to-primary-2" />
      </div>
      <p className="text-sm text-muted">Loading dataset &amp; training model in-browser…</p>
      <style>{`@keyframes loading{0%{transform:translateX(-100%)}100%{transform:translateX(320%)}}`}</style>
    </div>
  );
}
