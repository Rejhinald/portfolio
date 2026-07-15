import { cn } from "@/lib/utils";
import { Hanko } from "./hanko";

export function Eyebrow({
  children,
  seal,
  className,
}: {
  children: React.ReactNode;
  /** Section's formal kanji numeral — renders the ledger hanko beside the label. */
  seal?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col gap-3", className)}>
      {seal && (
        <span className="absolute -left-3 -top-4 z-10 lg:-left-6">
          <Hanko glyph={seal} size={36} />
        </span>
      )}
      <span className={cn("eyebrow", seal && "pl-6 lg:pl-4")}>{children}</span>
      <span className="gold-rule" />
    </div>
  );
}
