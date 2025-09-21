import { createClient } from '@base44/sdk';

// Ensure app ID is properly defined
const APP_ID = "68718381c8f49626126ee779";

// Validate app ID before creating client
if (!APP_ID || APP_ID === 'null' || APP_ID === 'undefined') {
  console.error('❌ Base44 App ID is not properly configured!');
  throw new Error('Base44 App ID is missing or invalid');
}

// Create client with validated app ID
export const base44 = createClient({
  appId: APP_ID,
  apiUrl: 'https://app.base44.com/api',
  debug: false // Reduce debug noise in production
});

// Debug logging
console.log('✅ Base44 client initialized successfully');
console.log('🆔 App ID:', APP_ID);
console.log('🔗 Client config:', {
  appId: APP_ID,
  requiresAuth: false,
  apiUrl: 'https://app.base44.com/api'
});
