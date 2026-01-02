"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, value, ...props }, ref) => {
    // Ensure value is always a string to prevent controlled/uncontrolled input warnings
    const inputValue = value ?? "";
    
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="block text-sm font-medium text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 rounded-lg border bg-surface-elevated text-primary placeholder:text-tertiary",
            "focus:outline-none",
            "transition-all duration-200",
            error
              ? "border-error"
              : "border-border hover:border-primary/50",
            className
          )}
          value={inputValue}
          {...props}
        />
        {error && (
          <span className="text-sm text-error">{error}</span>
        )}
        {helperText && !error && (
          <span className="text-sm text-secondary">{helperText}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

