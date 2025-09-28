/**
 * Custom TagMango Authentication Service
 * Replaces the base44 auth with TagMango's external auth API
 */

const TAGMANGO_API_BASE = 'https://api-prod-new.tagmango.com/api/v1';

// Type definitions for authentication
interface TagMangoUser {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

interface AuthResponse {
  success: boolean;
  data?: TagMangoUser;
  error?: string;
}

class TagMangoAuth {
  private token: string | null;
  private user: TagMangoUser | null;

  constructor() {
    this.token = localStorage.getItem('tagmango_token');
    this.user = null;
  }

  /**
   * Verify token with TagMango API and get user info
   * @param {string} token - JWT token to verify
   * @returns {Promise<TagMangoUser>} User object if token is valid
   */
  async verifyToken(token: string): Promise<TagMangoUser> {
    try {
      const response = await fetch(
        `${TAGMANGO_API_BASE}/external/auth/verify-token?token=${encodeURIComponent(token)}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Store token and user data
      this.token = token;
      this.user = data;
      localStorage.setItem('tagmango_token', token);
      localStorage.setItem('tagmango_user', JSON.stringify(data));

      return data;
    } catch (error) {
      console.error('TagMango auth verification failed:', error);
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Get current authenticated user
   * @returns {Promise<TagMangoUser>} Current user or throws error if not authenticated
   */
  async me(): Promise<TagMangoUser> {
    // If we have a cached user and token, return it
    if (this.user && this.token) {
      return this.user;
    }

    // Try to get from localStorage
    const storedToken = localStorage.getItem('tagmango_token');
    const storedUser = localStorage.getItem('tagmango_user');

    console.log(storedToken)
    console.log(storedUser)

    if (storedToken && storedUser) {
      try {
        this.token = storedToken;
        this.user = JSON.parse(storedUser);
        
        // Verify the stored token is still valid
        const verifiedUser = await this.verifyToken(storedToken);
        return verifiedUser;
      } catch (error) {
        console.log('Stored token is invalid, clearing auth');
        this.clearAuth();
        throw error;
      }
    }

    // No valid authentication found
    throw new Error('User not authenticated');
  }

  /**
   * Set authentication token (called when token is received from parent)
   * @param {string} token - JWT token
   * @returns {Promise<TagMangoUser>} User object
   */
  async authenticate(token: string): Promise<TagMangoUser> {
    if (!token) {
      throw new Error('Token is required');
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
    return this.token || localStorage.getItem('tagmango_token');
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('tagmango_token');
    localStorage.removeItem('tagmango_user');
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

