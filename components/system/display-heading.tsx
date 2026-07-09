import { cn } from "@/lib/utils";

type Props = {
  as?: "h1" | "h2" | "h3";
  animate?: "line-wipe" | "word-stagger" | "fade-up";
  className?: string;
  children: React.ReactNode;
};

export function DisplayHeading({
  as: Tag = "h2",
  animate,
  className,
  children,
}: Props) {
  return (
    <Tag data-animate={animate} className={cn("display", className)}>
      {children}
    </Tag>
  );
}
