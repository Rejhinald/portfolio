import { cn } from "@/lib/utils";

type Surface = "paper" | "paper-2" | "paper-3" | "ink";

const surfaceClass: Record<Surface, string> = {
  paper: "bg-paper text-ink",
  "paper-2": "bg-paper-2 text-ink",
  "paper-3": "bg-paper-3 text-ink",
  ink: "bg-ink text-paper",
};

export function Section({
  id,
  surface = "paper",
  pad = true,
  className,
  children,
}: {
  id?: string;
  surface?: Surface;
  pad?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(surfaceClass[surface], pad && "section-pad", className)}
    >
      {children}
    </section>
  );
}
