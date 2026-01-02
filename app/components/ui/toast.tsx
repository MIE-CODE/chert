"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { cn } from "@/app/lib/utils";
import { HiX, HiCheckCircle, HiExclamationCircle, HiInformationCircle } from "react-icons/hi";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const toast: Toast = { id, message, type, duration };
      
      setToasts((prev) => [...prev, toast]);

      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, "success", duration),
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => showToast(message, "error", duration),
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => showToast(message, "info", duration),
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, "warning", duration),
    [showToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      removeToast,
      success,
      error,
      info,
      warning,
    }),
    [toasts, showToast, removeToast, success, error, info, warning]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

function Toaster() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full md:w-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const icons = {
    success: HiCheckCircle,
    error: HiExclamationCircle,
    info: HiInformationCircle,
    warning: HiExclamationCircle,
  };

  const iconColors = {
    success: "text-success",
    error: "text-error",
    info: "text-primary",
    warning: "text-warning",
  };

  const Icon = icons[toast.type];
  const iconColor = iconColors[toast.type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg shadow-lg border",
        "bg-surface-elevated border-border",
        "animate-in slide-in-from-right-full fade-in duration-300"
      )}
      role="alert"
    >
      <Icon className={cn("w-5 h-5 shrink-0", iconColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 p-1 rounded hover:bg-surface transition-colors"
        aria-label="Close"
      >
        <HiX className="w-4 h-4 text-secondary" />
      </button>
    </div>
  );
}

