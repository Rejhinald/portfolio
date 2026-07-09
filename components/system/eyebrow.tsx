import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="eyebrow">{children}</span>
      <span className="gold-rule" />
    </div>
  );
}
