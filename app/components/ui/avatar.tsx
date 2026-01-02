"use client";

import { cn } from "@/app/lib/utils";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
};

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  online,
  className,
  onClick,
}: AvatarProps) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-inverse font-medium overflow-hidden",
          sizeClasses[size],
          onClick && "cursor-pointer hover:opacity-90 transition-opacity"
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials || "?"}</span>
        )}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            online ? "bg-online" : "bg-offline",
            size === "xs" || size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"
          )}
        />
      )}
    </div>
  );
}

