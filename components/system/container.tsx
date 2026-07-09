import { cn } from "@/lib/utils";

const sizeClass = {
  default: "wa-container",
  narrow: "wa-container-narrow",
  wide: "wa-container-wide",
} as const;

export function Container({
  size = "default",
  className,
  children,
}: {
  size?: keyof typeof sizeClass;
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(sizeClass[size], className)}>{children}</div>;
}
