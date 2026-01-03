"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
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

  const playToastSound = useCallback(() => {
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Soft notification sound (800Hz, short beep)
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (error) {
      // Silently fail if audio context is not available
      console.debug("Could not play toast sound:", error);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration: number = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const toast: Toast = { id, message, type, duration };
      
      setToasts((prev) => [...prev, toast]);

      // Play sound when toast appears
      playToastSound();

      // Auto-remove is handled by Toaster component with exit animation
    },
    [removeToast, playToastSound]
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
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleRemove = useCallback((id: string) => {
    // Clear any existing timeout
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }

    setExitingIds((prev) => new Set(prev).add(id));
    // Wait for animation to complete before actually removing
    const removeTimeout = setTimeout(() => {
      removeToast(id);
      setExitingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      timeoutRefs.current.delete(id);
    }, 250);
    timeoutRefs.current.set(id, removeTimeout);
  }, [removeToast]);

  // Set up auto-remove timeouts for new toasts
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0 && !exitingIds.has(toast.id) && !timeoutRefs.current.has(toast.id)) {
        const timeout = setTimeout(() => {
          handleRemove(toast.id);
        }, toast.duration);
        timeoutRefs.current.set(toast.id, timeout);
      }
    });

    // Cleanup timeouts for removed toasts
    return () => {
      timeoutRefs.current.forEach((timeout, id) => {
        if (!toasts.find((t) => t.id === id)) {
          clearTimeout(timeout);
          timeoutRefs.current.delete(id);
        }
      });
    };
  }, [toasts, exitingIds, handleRemove]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full md:w-auto">
      {toasts.map((toast) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          isExiting={exitingIds.has(toast.id)}
          onClose={() => handleRemove(toast.id)} 
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, isExiting, onClose }: { toast: Toast; isExiting: boolean; onClose: () => void }) {
  const itemRef = useRef<HTMLDivElement>(null);

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
      ref={itemRef}
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg shadow-lg border",
        "bg-surface-elevated border-border",
        "transform transition-all duration-300 ease-out",
        isExiting ? "animate-slide-out-right" : "animate-slide-in-right"
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

