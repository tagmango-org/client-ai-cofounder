/**
 * Data Service with TagMango Authentication Integration
 * 
 * This service layer automatically routes API calls based on authentication status:
 * - If user is authenticated with TagMango: Uses custom backend APIs
 * - If user is not authenticated: Uses local storage fallback
 * 
 * Authentication Flow:
 * 1. Check if user is real (not anonymous)
 * 2. Check if TagMango authentication is active
 * 3. Extract TagMango user ID from JWT token
 * 4. Route to appropriate data source (custom backend or local storage)
 * 
 * Migration Status:
 * ✅ Profile APIs: Migrated to custom backend
 * ✅ Conversation APIs: Migrated to custom backend
 * ✅ Message APIs: Migrated to custom backend
 */

import * as localConversationManager from '../localStorage/conversationManager';
import * as localMessageManager from '../localStorage/messageManager';
import tagMangoAuth from '@/api/auth';
import { getUserProfile, updateUserProfile } from '@/api/profile';
import * as conversationAPI from '@/api/conversations';
import * as messageAPI from '@/api/messages';
import type {
  User,
  CreateConversationParams,
  UpdateConversationParams,
  DeleteConversationParams,
  ListMessagesParams,
  CreateMessageParams,
  UpdateMessageParams,
  UpdateUser,
} from '@/types/dataService';
import { Phone } from 'lucide-react';

const isRealUser: any = (user: any) => user && user._id !== 'anonymous';

// Check if user is authenticated with TagMango
const isTagMangoAuthenticated = (): boolean => {
  try {
    return tagMangoAuth.isAuthenticated();
  } catch (error) {
    console.error('TagMango authentication check failed:', error);
    return false;
  }
};

// Get TagMango user ID from authenticated user or token
const getTagMangoUserId = (): string | null => {
  try {
    // First try to get from TagMango auth service
    const token = tagMangoAuth.getToken();
    if (token) {
      // Parse JWT token to extract user ID
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        return payload.userid || payload.userId || payload.id || null;
      }
    }
    return null;
  } catch (error) {
    console.error('Error extracting TagMango user ID:', error);
    return null;
  }
};

// Enhanced user check: real user AND TagMango authenticated
const isAuthenticatedRealUser = (user: any): boolean => {
  return isRealUser(user) && isTagMangoAuthenticated();
};

// Utility function to get authentication status for debugging
export const getAuthenticationStatus = (currentUser: User | null) => {
  const realUser = isRealUser(currentUser);
  const tagMangoAuth = isTagMangoAuthenticated();
  const authenticated = isAuthenticatedRealUser(currentUser);
  
  return {
    isRealUser: realUser,
    isTagMangoAuthenticated: tagMangoAuth,
    isFullyAuthenticated: authenticated,
    userId: currentUser?.userId || 'none',
    apiSource: authenticated ? 'Custom Backend APIs' : 'Local Storage'
  };
};

// --- Conversation Services ---

export const listConversations = async (currentUser: User | null): Promise<any> => {
    // Use custom backend APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using custom backend API for authenticated user - listConversations');
        
        // Get TagMango user ID from token
        const tagMangoUserId = getTagMangoUserId();
        if (!tagMangoUserId) {
            console.error('❌ No TagMango user ID found in token');
            return localConversationManager.list();
        }
        
        try {
            const response = await conversationAPI.getConversations(tagMangoUserId);
            if (response.success && response.data?.conversations) {
                // Transform to match expected format
                return {
                    data: {
                        conversations: response.data.conversations.map(conv => ({
                            id: conv.id,
                            title: conv.title,
                            created_date: conv.created_date,
                            updated_date: conv.updated_date,
                            app_user_id: conv.app_user_id
                        }))
                    }
                };
            }
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('❌ Custom backend API error, falling back to local storage:', error);
            return localConversationManager.list();
        }
    }
    console.log('📱 Using local storage - listConversations');
    return localConversationManager.list();
};

export const createConversation = async (currentUser: User | null, { title }: CreateConversationParams): Promise<any> => {
    // Use custom backend APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using custom backend API for authenticated user - createConversation');
        
        // Get TagMango user ID from token
        const tagMangoUserId = getTagMangoUserId();
        if (!tagMangoUserId) {
            console.error('❌ No TagMango user ID found in token');
            return localConversationManager.create({ title });
        }
        
        try {
            const response = await conversationAPI.createConversation(tagMangoUserId, { title });
            if (response.success && response.data?.conversation) {
                // Transform to match expected format
                const conv = response.data.conversation;
                return {
                    data: {
                        conversation: {
                            id: conv.id,
                            title: conv.title,
                            created_date: conv.created_date,
                            updated_date: conv.updated_date,
                            app_user_id: conv.app_user_id
                        }
                    }
                };
            }
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('❌ Custom backend API error, falling back to local storage:', error);
            return localConversationManager.create({ title });
        }
    }
    console.log('📱 Using local storage - createConversation');
    return localConversationManager.create({ title });
};

export const updateConversation = async (currentUser: User | null, { conversationId, updates }: UpdateConversationParams): Promise<any> => {
    // Use custom backend APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using custom backend API for authenticated user - updateConversation');
        
        // Get TagMango user ID from token
        const tagMangoUserId = getTagMangoUserId();
        if (!tagMangoUserId) {
            console.error('❌ No TagMango user ID found in token');
            return localConversationManager.update({ conversationId, updates });
        }
        
        try {
            const response = await conversationAPI.updateConversation(tagMangoUserId, conversationId, updates);
            if (response.success && response.data?.conversation) {
                // Transform to match expected format
                const conv = response.data.conversation;
                return {
                    data: {
                        conversation: {
                            id: conv.id,
                            title: conv.title,
                            created_date: conv.created_date,
                            updated_date: conv.updated_date,
                            app_user_id: conv.app_user_id
                        }
                    }
                };
            }
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('❌ Custom backend API error, falling back to local storage:', error);
            return localConversationManager.update({ conversationId, updates });
        }
    }
    console.log('📱 Using local storage - updateConversation');
    return localConversationManager.update({ conversationId, updates });
};

export const deleteConversation = async (currentUser: User | null, { conversationId }: DeleteConversationParams): Promise<any> => {
    // Use custom backend APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using custom backend API for authenticated user - deleteConversation');
        
        // Get TagMango user ID from token
        const tagMangoUserId = getTagMangoUserId();
        if (!tagMangoUserId) {
            console.error('❌ No TagMango user ID found in token');
            return localConversationManager.del({ conversationId });
        }
        
        try {
            const response = await conversationAPI.deleteConversation(tagMangoUserId, conversationId);
            if (response.success) {
                return { data: { success: true, message: response.message } };
            }
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('❌ Custom backend API error, falling back to local storage:', error);
            return localConversationManager.del({ conversationId });
        }
    }
    console.log('📱 Using local storage - deleteConversation');
    return localConversationManager.del({ conversationId });
};


// --- Message Services ---

export const listMessages = async (currentUser: User | null, { conversationId, cursor, limit }: ListMessagesParams): Promise<any> => {
    // Use custom backend APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using custom backend API for authenticated user - listMessages');
        
        // Get TagMango user ID from token
        const tagMangoUserId = getTagMangoUserId();
        if (!tagMangoUserId) {
            console.error('❌ No TagMango user ID found in token');
            return localMessageManager.list({ conversationId });
        }
        
        try {
            const response = await messageAPI.getMessages(tagMangoUserId, conversationId, cursor as string, limit);
            if (response.success && response.data?.messages) {
                // Transform to match expected format
                return {
                    data: {
                        messages: response.data.messages.map(msg => ({
                            id: msg.id,
                            conversationId: msg.conversationId,
                            text: msg.content, // Map content to text for frontend compatibility
                            sender: msg.role === 'assistant' ? 'ai' : msg.role, // Map role to sender
                            created_date: msg.created_date,
                            metadata: msg.metadata
                        })),
                        hasMore: response.data.hasMore,
                        nextCursor: response.data.nextCursor
                    }
                };
            }
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('❌ Custom backend API error, falling back to local storage:', error);
            return localMessageManager.list({ conversationId });
        }
    }
    console.log('📱 Using local storage - listMessages');
    return localMessageManager.list({ conversationId });
};

export const createMessage = async (currentUser: User | null, { conversationId, content, role, metadata }: CreateMessageParams): Promise<any> => {
    // Use custom backend APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using custom backend API for authenticated user - createMessage');
        
        // Get TagMango user ID from token
        const tagMangoUserId = getTagMangoUserId();
        if (!tagMangoUserId) {
            console.error('❌ No TagMango user ID found in token');
            return localMessageManager.create({ conversationId, text: content, sender: role === 'assistant' ? 'ai' : role, metadata });
        }
        
        try {
            const response = await messageAPI.createMessage(tagMangoUserId, { conversationId, content, role, metadata });
            if (response.success && response.data?.message) {
                // Transform to match expected format
                const msg = response.data.message;
                return {
                    data: {
                        message: {
                            id: msg.id,
                            conversationId: msg.conversationId,
                            text: msg.content, // Map content to text for frontend compatibility
                            sender: msg.role === 'assistant' ? 'ai' : msg.role, // Map role to sender
                            created_date: msg.created_date,
                            metadata: msg.metadata
                        }
                    }
                };
            }
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('❌ Custom backend API error, falling back to local storage:', error);
            return localMessageManager.create({ conversationId, text: content, sender: role === 'assistant' ? 'ai' : role, metadata });
        }
    }
    console.log('📱 Using local storage - createMessage');
    // For local storage, convert back to old format
    return localMessageManager.create({ conversationId, text: content, sender: role === 'assistant' ? 'ai' : role, metadata });
};

export const updateMessage = async (currentUser: User | null, { messageId, updates, conversationId }: UpdateMessageParams): Promise<any> => {
    // Use custom backend APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using custom backend API for authenticated user - updateMessage');
        
        // Get TagMango user ID from token
        const tagMangoUserId = getTagMangoUserId();
        if (!tagMangoUserId) {
            console.error('❌ No TagMango user ID found in token');
            return localMessageManager.update({ conversationId: conversationId || '', messageId, updates });
        }
        
        try {
            // Transform updates to match backend API expectations
            const backendUpdates = {
                ...updates,
                // Map 'text' field to 'content' for backend compatibility
                ...(updates.text !== undefined && { content: updates.text }),
            };
            // Remove 'text' field if it exists since backend expects 'content'
            if ('text' in backendUpdates) {
                delete (backendUpdates as any).text;
            }
            
            console.log('🔐 Calling backend updateMessage API:', {
                userId: tagMangoUserId,
                messageId,
                backendUpdates
            });
            
            const response = await messageAPI.updateMessage(tagMangoUserId, messageId, backendUpdates);
            console.log('📡 Backend updateMessage response:', response);
            if (response.success && response.data?.message) {
                // Transform to match expected format
                const msg = response.data.message;
                return {
                    data: {
                        message: {
                            id: msg.id,
                            conversationId: msg.conversationId,
                            text: msg.content, // Map content to text for frontend compatibility
                            sender: msg.role === 'assistant' ? 'ai' : msg.role, // Map role to sender
                            created_date: msg.created_date,
                            metadata: msg.metadata
                        }
                    }
                };
            }
            throw new Error('Invalid response format');
        } catch (error) {
            console.error('❌ Custom backend API error, falling back to local storage:', error);
            return localMessageManager.update({ conversationId: conversationId || '', messageId, updates });
        }
    }
    console.log('📱 Using local storage - updateMessage');
    // Note: localMessageManager expects conversationId for updates
    return localMessageManager.update({ conversationId: conversationId || '', messageId, updates });
};


// --- Profile/User Services ---

export const updateProfile = async (currentUser: User | null, profileData: any): Promise<any> => {
    if (isAuthenticatedRealUser(currentUser)) {
        
        const tagMangoUserId = getTagMangoUserId();
        if (!tagMangoUserId) {
            console.error('❌ No TagMango user ID found in token');
            return { data: { success: false, error: 'TagMango user ID not found' } };
        }
        
        
        try {
            const response = await updateUserProfile(tagMangoUserId, profileData);
            return { data: response };
        } catch (error) {
            console.error('Error updating profile with custom backend:', error);
            return { data: { success: false, error: 'Failed to update profile' } };
        }
    }
    // For anonymous users, profile updates are a no-op as they are not persisted.
    // The state is managed locally in Chat.js but not saved anywhere.
    return Promise.resolve({ data: { success: true, message: "Profile not persisted for anonymous user." } });
};

export const getProfile = async (currentUser: User | null): Promise<any> => {
    // Use custom backend APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using custom backend API for authenticated user - getProfile');
        
        // Get TagMango user ID from token
        const tagMangoUserId = getTagMangoUserId();
        if (!tagMangoUserId) {
            console.error('❌ No TagMango user ID found in token');
            return { data: { success: false, error: 'TagMango user ID not found' } };
        }
        
        console.log('👤 Using TagMango user ID for profile retrieval:', tagMangoUserId);
        
        try {
            const response = await getUserProfile(tagMangoUserId);
            return { data: response };
        } catch (error) {
            console.error('Error getting profile with custom backend:', error);
            return { data: { success: false, error: 'Failed to get profile' } };
        }
    }
    console.log('📱 Returning default profile for unauthenticated user');
    // For anonymous users, return a default profile structure
    return Promise.resolve({ 
        data: { 
            success: true, 
            data: {
                userId: 'anonymous',
                role: 'user',
                profile: {
                    status: 'not_started',
                    currentPhaseIndex: 0,
                    currentQuestionIndexInPhase: 0,
                    answers: {}
                }
            }
        } 
    });
};

