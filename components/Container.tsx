import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
  width = "max-w-6xl",
}: {
  children: ReactNode;
  className?: string;
  width?: string;
}) {
  return <div className={`mx-auto w-full px-5 sm:px-8 ${width} ${className}`}>{children}</div>;
}
