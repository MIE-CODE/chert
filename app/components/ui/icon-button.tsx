"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/app/lib/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function IconButton({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}: IconButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default:
      "text-secondary hover:bg-surface",
    primary:
      "bg-primary text-inverse hover:bg-primary-hover",
    ghost:
      "text-primary hover:bg-surface",
    danger:
      "bg-error text-inverse hover:bg-red-600",
  };

  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
