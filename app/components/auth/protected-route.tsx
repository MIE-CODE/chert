"use client";

import { useAuthContext } from "./auth-provider";
import { useUserStore } from "@/app/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isInitialized } = useAuthContext();
  const { isAuthenticated } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // If auth is initialized and user is not authenticated, redirect
    if (isInitialized && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Don't render until auth is initialized
  if (!isInitialized) {
    return null; // AuthProvider handles the loading state
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

