"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/app/store";
import { AuthService } from "@/app/services/auth-service";
import { useToast } from "@/app/components/ui/toast";

interface AuthContextType {
  isInitialized: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isInitialized: false,
  isAuthenticated: false,
});

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, currentUser, setCurrentUser } = useUserStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const toast = useToast();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Check if token exists in localStorage
        const token = typeof window !== "undefined" 
          ? localStorage.getItem("auth_token") 
          : null;

        if (!token) {
          // No token - user is not authenticated
          if (isMounted) {
            setIsInitialized(true);
            
            // If on a protected route, redirect to login
            if (!pathname?.startsWith("/auth")) {
              router.replace("/auth/login");
            }
          }
          return;
        }

        // Token exists - validate it by fetching current user
        try {
          console.log("AuthProvider: Fetching current user...");
          const user = await AuthService.getCurrentUser();
          console.log("AuthProvider: Received user from API:", user);
          if (isMounted) {
            console.log("AuthProvider: Setting user in store:", user);
            setCurrentUser(user);
            setIsInitialized(true);
            console.log("AuthProvider: User set, auth initialized");
            
            // If on auth pages, redirect to home
            if (pathname?.startsWith("/auth")) {
              router.replace("/");
            }
          }
        } catch (error: any) {
          // Handle errors gracefully - don't break the app
          const errorMessage = error?.message || "Failed to verify authentication";
          const isTimeout = error?.isTimeout || error?.code === 'ECONNABORTED' || errorMessage.includes('timeout');
          const isNetworkError = error?.isNetworkError || error?.code === 'ERR_NETWORK';
          
          // Show toast notification for timeout/network errors
          if (isTimeout) {
            toast.warning("Connection timeout. Please check your internet connection.");
          } else if (isNetworkError) {
            toast.warning("Network error. Please check your connection.");
          } else {
            // For other errors, just log them (don't show toast for auth errors during initialization)
            console.error("Failed to get current user:", error);
          }
          
          // Token is invalid or error occurred - clear it
          localStorage.removeItem("auth_token");
          localStorage.removeItem("refresh_token");
          if (isMounted) {
            setCurrentUser(null);
            setIsInitialized(true);
            
            // Redirect to login if on protected route
            if (!pathname?.startsWith("/auth")) {
              router.replace("/auth/login");
            }
          }
        }
      } catch (error: any) {
        // Handle errors gracefully - don't break the app
        const errorMessage = error?.message || "Authentication initialization failed";
        const isTimeout = error?.isTimeout || error?.code === 'ECONNABORTED' || errorMessage.includes('timeout');
        const isNetworkError = error?.isNetworkError || error?.code === 'ERR_NETWORK';
        
        // Show toast notification for timeout/network errors
        if (isTimeout) {
          toast.warning("Connection timeout. Please check your internet connection.");
        } else if (isNetworkError) {
          toast.warning("Network error. Please check your connection.");
        } else {
          console.error("Auth initialization failed:", error);
        }
        
        if (isMounted) {
          setIsInitialized(true);
          
          // On error, redirect to login if on protected route
          if (!pathname?.startsWith("/auth")) {
            router.replace("/auth/login");
          }
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  // Don't render anything until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-secondary">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isInitialized, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

