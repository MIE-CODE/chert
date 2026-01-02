"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUserStore } from "@/app/store";
import { AuthService } from "@/app/services/auth-service";

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
          const user = await AuthService.getCurrentUser();
          if (isMounted) {
            setCurrentUser(user);
            setIsInitialized(true);
            
            // If on auth pages, redirect to home
            if (pathname?.startsWith("/auth")) {
              router.replace("/");
            }
          }
        } catch (error) {
          // Token is invalid - clear it
          console.error("Failed to get current user:", error);
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
      } catch (error) {
        console.error("Auth initialization failed:", error);
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

