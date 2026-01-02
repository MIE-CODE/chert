/**
 * useAuth Hook
 * Manages authentication state and operations
 */

import { useState, useCallback, useEffect } from "react";
import { useUserStore } from "@/app/store";
import { AuthService, LoginCredentials, SignupData } from "@/app/services/auth-service";
import { User } from "@/app/store/types";
import { websocketService } from "@/app/services/api";
import { useToast } from "@/app/components/ui/toast";

export function useAuth() {
  const { login: loginUser, logout: logoutUser } = useUserStore();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Logs in a user
   */
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      setError(null);

      try {
        const user = await AuthService.login(credentials);
        loginUser(user);
        return user;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Login failed";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loginUser]
  );

  /**
   * Signs up a new user
   */
  const signup = useCallback(
    async (data: SignupData) => {
      setIsLoading(true);
      setError(null);

      try {
        const user = await AuthService.signup(data);
        loginUser(user);
        return user;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Signup failed";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loginUser]
  );

  /**
   * Verifies OTP
   */
  const verifyOTP = useCallback(
    async (phone: string, code: string) => {
      setIsLoading(true);
      setError(null);

      try {
        return await AuthService.verifyOTP(phone, code);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "OTP verification failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Sends OTP
   */
  const sendOTP = useCallback(async (phone: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.sendOTP(phone);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send OTP";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logs out the current user
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await AuthService.logout();
      logoutUser();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Logout failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [logoutUser]);

  return {
    isLoading,
    error,
    login,
    signup,
    verifyOTP,
    sendOTP,
    logout,
  };
}

