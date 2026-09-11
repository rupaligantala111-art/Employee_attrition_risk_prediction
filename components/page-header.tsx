export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-5">
      <h1 className="text-pretty text-[26px] font-extrabold tracking-tight text-foreground md:text-[30px]">
        {title}
      </h1>
      <p className="mt-1.5 max-w-2xl text-pretty text-[13.5px] leading-relaxed text-muted">
        {subtitle}
      </p>
    </div>
  );
}
