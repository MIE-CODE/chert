"use client";

import { ReactNode } from "react";
import { cn } from "@/app/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "error";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  className,
}: BadgeProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-full font-medium";

  const variants = {
    default: "bg-surface-elevated text-primary",
    primary: "bg-primary text-inverse",
    success: "bg-success text-inverse",
    warning: "bg-warning text-inverse",
    error: "bg-error text-inverse",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs min-w-[1.25rem] h-5",
    md: "px-2.5 py-1 text-sm min-w-[1.5rem] h-6",
  };

  return (
    <span className={cn(baseClasses, variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}

