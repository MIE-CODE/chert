/**
 * Authentication Service
 * Handles all authentication-related business logic
 */

import { User } from "@/app/store/types";
import { authAPI, websocketService } from "./api";
import { apiClient } from "@/app/lib/api-client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  phone: string;
  username: string;
  email: string;
  password: string;
}

export class AuthService {
  /**
   * Authenticates a user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<User> {
    const response = await authAPI.login(credentials);
    // Connect WebSocket after login
    if (response.token) {
      websocketService.connect(response.token);
    }
    return response.user;
  }

  /**
   * Registers a new user
   */
  static async signup(data: SignupData): Promise<User> {
    const response = await authAPI.signup(data);
    // Connect WebSocket after signup
    if (response.token) {
      websocketService.connect(response.token);
    }
    return response.user;
  }

  /**
   * Verifies OTP code (if needed for phone verification)
   */
  static async verifyOTP(phone: string, code: string): Promise<boolean> {
    // This would be a custom endpoint if needed
    // For now, return true if code is valid format
    return code.length === 6 && /^\d+$/.test(code);
  }

  /**
   * Sends OTP to phone number (if needed)
   */
  static async sendOTP(phone: string): Promise<void> {
    // This would be a custom endpoint if needed
    console.log(`OTP sent to ${phone}`);
  }

  /**
   * Logs out the current user
   */
  static async logout(): Promise<void> {
    await authAPI.logout();
    websocketService.disconnect();
  }

  /**
   * Refreshes authentication token
   */
  static async refreshToken(): Promise<string> {
    return await authAPI.refreshToken();
  }

  /**
   * Validates if user session is still valid
   */
  static async validateSession(): Promise<boolean> {
    try {
      await authAPI.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User> {
    return await authAPI.getCurrentUser();
  }
}

