/**
 * Token utilities for development and production environments
 */

// Type definitions for token utilities
interface TokenPayload {
  userid?: string;
  userId?: string;
  whitelabelCreator?: string;
  whitelabelHost?: string;
  iat?: number;
  exp?: number;
}

interface TokenInfo {
  userId?: string;
  whitelabelCreator?: string;
  whitelabelHost?: string;
  issuedAt: Date | string;
  expiresAt: Date | string;
}

// Development token for testing
export const DEV_TOKEN: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOiI2MmViODY2MDVkYmM1ZTE4MmM3NzY1NTciLCJ3aGl0ZWxhYmVsQ3JlYXRvciI6IjYyZWI4NjYwNWRiYzVlMTgyYzc3NjU1NyIsIndoaXRlbGFiZWxIb3N0IjoibGVhcm4uZGl2eWFuc2h1ZGFtYW5pLnh5eiIsImlhdCI6MTc1ODg3Njc1OSwiZXhwIjoxNzYxNDY4NzU5fQ.yqwszIOcn5PSQeKE7nSzLkJUXXoqAoNdOynN1Nhy1Hw'

/**
 * Extract token from URL query parameters
 * @returns {string | null} Token if found in URL, null otherwise
 */
export function getTokenFromURL(): string | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('token');
  } catch (error) {
    console.error('Error extracting token from URL:', error);
    return null;
  }
}

/**
 * Check if we're in development mode
 * @returns {boolean} True if in development mode
 */
export function isDevelopmentMode(): boolean {
  // Check for development environment using various indicators
  const isLocalhost: boolean = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  const isDevPort: boolean = window.location.port === '5173' || // Vite dev server
                   window.location.port === '3000';   // React dev server
  
  // Check for NODE_ENV if available (Vite/React usually sets this)
  const isNodeDevEnv: boolean = typeof import.meta !== 'undefined' && 
                       (import.meta as any).env && 
                       (import.meta as any).env.DEV;
  
  return isLocalhost || isDevPort || isNodeDevEnv;
}

/**
 * Get the appropriate token based on environment
 * Priority:
 * 1. Token from parent app data (if provided)
 * 2. Token from URL query parameters (production)
 * 3. Development token (development mode)
 * 
 * @param {string | null} parentToken - Token from parent app
 * @returns {string | null} Token to use for authentication
 */
export function getAuthToken(parentToken: string | null = null): string | null {
  // Priority 1: Use token from parent app if provided
  if (parentToken) {
    console.log('🔑 Using token from parent app');
    return parentToken;
  }

  // Priority 2: Extract token from URL (production)
  const urlToken: string | null = getTokenFromURL();
  if (urlToken) {
    console.log('🔑 Using token from URL query parameters');
    return urlToken;
  }

  // Priority 3: Use development token in development mode
  if (isDevelopmentMode()) {
    console.log('🔑 Using development token (dev mode)');
    return DEV_TOKEN;
  }

  console.log('⚠️ No token found');
  return null;
}

/**
 * Log token information for debugging
 * @param {string | null} token - Token to analyze
 */
export function logTokenInfo(token: string | null): void {
  if (!token) {
    console.log('🔍 No token provided');
    return;
  }

  try {
    // Extract payload from JWT (without verification)
    const parts: string[] = token.split('.');
    if (parts.length === 3) {
      const payload: TokenPayload = JSON.parse(atob(parts[1]));
      const tokenInfo: TokenInfo = {
        userId: payload.userid || payload.userId,
        whitelabelCreator: payload.whitelabelCreator,
        whitelabelHost: payload.whitelabelHost,
        issuedAt: payload.iat ? new Date(payload.iat * 1000) : 'Unknown',
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : 'Unknown'
      };
      console.log('🔍 Token payload:', tokenInfo);
    }
  } catch (error: any) {
    console.log('🔍 Token format analysis failed:', error.message);
  }
}
