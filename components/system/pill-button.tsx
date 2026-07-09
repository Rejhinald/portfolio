"use client";

import { useCallback, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { applyMagnetic } from "@/lib/animations/magnetic";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  magnetic?: boolean;
  arrow?: boolean;
  target?: string;
  type?: "button" | "submit";
  className?: string;
  children: React.ReactNode;
};

export function PillButton({
  href,
  onClick,
  variant = "solid",
  magnetic = true,
  arrow = true,
  target,
  type = "button",
  className,
  children,
}: Props) {
  const cleanup = useRef<(() => void) | undefined>(undefined);

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      cleanup.current?.();
      cleanup.current = undefined;
      if (node && magnetic) cleanup.current = applyMagnetic(node);
    },
    [magnetic],
  );

  const base = cn(
    "group inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-medium transition-colors",
    variant === "solid"
      ? "bg-shu text-paper hover:bg-shu-deep"
      : "border border-rule text-ink hover:border-gold",
    className,
  );

  const inner = (
    <>
      {children}
      {arrow && (
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
        />
      )}
    </>
  );

  if (href) {
    return (
      <a
        ref={setRef}
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        className={base}
      >
        {inner}
      </a>
    );
  }

  return (
    <button ref={setRef} type={type} onClick={onClick} className={base}>
      {inner}
    </button>
  );
}
