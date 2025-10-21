/**
 * Custom TagMango Authentication Service
 * Replaces the base44 auth with TagMango's external auth API
 */

import { User } from "../types/dataService";
import { useUserStore } from "../stores/userStore";

const TAGMANGO_API_BASE = import.meta.env.VITE_TAGMANGO_API_BASE;


class TagMangoAuth {
  private token: string | null;
  private user: User | null;

  constructor() {
    this.token = localStorage.getItem("tagmango_token");

    // Also load user from localStorage if available
    const storedUser = localStorage.getItem("tagmango_user");
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        this.user = null;
      }
    } else {
      this.user = null;
    }
  }

  /**
   * Verify token with TagMango API and get user info
   * @param {string} token - JWT token to verify
   * @returns {Promise<User>} User object if token is valid
   */
  async verifyToken(token: string): Promise<User> {
    try {
      const response = await fetch(
        `${TAGMANGO_API_BASE}/external/auth/verify-token?token=${encodeURIComponent(
          token
        )}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Authentication failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const user: User = {
        _id: data.result._id,
        userId: data.result._id || data.id || "",
        email: data.result.email || "",
        name: data.result.name || "",
        role: data.result.role || "user",
        profilePic: data.result.profilePic || data.result.profile_pic,
        createdAt: data.result.createdAt || data.result.created_at,
        updatedAt: data.result.updatedAt || data.result.updated_at,
        phone: String(data.result.phone) || "",
        profile: data.result.profile || {
          status: "not_started",
          currentPhaseIndex: 0,
          currentQuestionIndexInPhase: 0,
          answers: {},
        },
      };

      // Store token and user data.result
      this.token = token;
      this.user = user;
      localStorage.setItem("tagmango_token", token);
      localStorage.setItem("tagmango_user", JSON.stringify(user));

      // Update Zustand store
      const { setCurrentAppUser, setToken } = useUserStore.getState();
      setCurrentAppUser(user);
      setToken(token);

      return user;
    } catch (error) {
      console.error("TagMango auth verification failed:", error);
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<User>} Current user or throws error if not authenticated
   */
  async me(): Promise<User> {
    // If we have a cached user and token, return it
    if (this.user && this.token) {
      return this.user;
    }

    // Try to get from localStorage
    const storedToken = localStorage.getItem("tagmango_token");
    const storedUser = localStorage.getItem("tagmango_user");

    console.log(storedToken);
    console.log(storedUser);

    if (storedToken && storedUser) {
      try {
        this.token = storedToken;
        this.user = JSON.parse(storedUser);

        // Verify the stored token is still valid
        const verifiedUser = await this.verifyToken(storedToken);
        return verifiedUser;
      } catch (error) {
        console.log("Stored token is invalid, clearing auth");
        this.clearAuth();
        throw error;
      }
    }

    // No valid authentication found
    throw new Error("User not authenticated");
  }

  /**
   * Set authentication token (called when token is received from parent)
   * @param {string} token - JWT token
   * @returns {Promise<User>} User object
   */
  async authenticate(token: string): Promise<User> {
    if (!token) {
      throw new Error("Token is required");
    }

    return await this.verifyToken(token);
  }

  /**
   * Check if user is currently authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.token && this.user);
  }

  /**
   * Get current token
   * @returns {string|null} Current JWT token
   */
  getToken(): string | null {
    return this.token || localStorage.getItem("tagmango_token");
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem("tagmango_token");
    localStorage.removeItem("tagmango_user");

    // Update Zustand store
    const { logout } = useUserStore.getState();
    logout();
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAuth();
  }
}

// Create singleton instance
const tagMangoAuth = new TagMangoAuth();

export default tagMangoAuth;
