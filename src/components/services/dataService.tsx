/**
 * Data Service with TagMango Authentication Integration
 * 
 * This service layer automatically routes API calls based on authentication status:
 * - If user is authenticated with TagMango: Uses Base44 APIs (for now, until migration)
 * - If user is not authenticated: Uses local storage fallback
 * 
 * Authentication Flow:
 * 1. Check if user is real (not anonymous)
 * 2. Check if TagMango authentication is active
 * 3. Route to appropriate data source
 */

import { manageConversations } from '@/api/functions';
import { manageMessages } from '@/api/functions';
import * as localConversationManager from '../localStorage/conversationManager';
import * as localMessageManager from '../localStorage/messageManager';
import { appUserManager } from "@/api/functions";
import { User as TagMangoAuth } from '@/api/entities';
import type {
  User,
  UserData,
  ApiResponse,
  CreateConversationParams,
  UpdateConversationParams,
  DeleteConversationParams,
  ListMessagesParams,
  CreateMessageParams,
  UpdateMessageParams,
} from '@/types/dataService';

const isRealUser: any = (user: any) => user && user.id !== 'anonymous';

// Check if user is authenticated with TagMango
const isTagMangoAuthenticated = (): boolean => {
  try {
    return TagMangoAuth.isAuthenticated();
  } catch (error) {
    console.log('TagMango authentication check failed:', error);
    return false;
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
    userId: currentUser?.id || 'none',
    apiSource: authenticated ? 'Base44 APIs' : 'Local Storage'
  };
};

// --- Conversation Services ---

export const listConversations = async (currentUser: User | null): Promise<ApiResponse> => {
    // Use Base44 APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using Base44 API for authenticated user - listConversations');
        return manageConversations({ action: 'list', appUserId: currentUser!.id });
    }
    console.log('📱 Using local storage - listConversations');
    return localConversationManager.list();
};

export const createConversation = async (currentUser: User | null, { title }: CreateConversationParams): Promise<ApiResponse> => {
    // Use Base44 APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using Base44 API for authenticated user - createConversation');
        return manageConversations({ action: 'create', appUserId: currentUser!.id, title });
    }
    console.log('📱 Using local storage - createConversation');
    return localConversationManager.create({ title });
};

export const updateConversation = async (currentUser: User | null, { conversationId, updates }: UpdateConversationParams): Promise<ApiResponse> => {
    // Use Base44 APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using Base44 API for authenticated user - updateConversation');
        return manageConversations({ action: 'update', appUserId: currentUser!.id, conversationId, updates });
    }
    console.log('📱 Using local storage - updateConversation');
    return localConversationManager.update({ conversationId, updates });
};

export const deleteConversation = async (currentUser: User | null, { conversationId }: DeleteConversationParams): Promise<ApiResponse> => {
    // Use Base44 APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using Base44 API for authenticated user - deleteConversation');
        return manageConversations({ action: 'delete', appUserId: currentUser!.id, conversationId });
    }
    console.log('📱 Using local storage - deleteConversation');
    return localConversationManager.del({ conversationId });
};


// --- Message Services ---

export const listMessages = async (currentUser: User | null, { conversationId, cursor, limit }: ListMessagesParams): Promise<ApiResponse> => {
    // Use Base44 APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using Base44 API for authenticated user - listMessages');
        return manageMessages({ action: 'list', appUserId: currentUser!.id, conversationId, cursor, limit });
    }
    console.log('📱 Using local storage - listMessages');
    return localMessageManager.list({ conversationId });
};

export const createMessage = async (currentUser: User | null, { conversationId, content, role, metadata }: CreateMessageParams): Promise<ApiResponse> => {
    // Use Base44 APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using Base44 API for authenticated user - createMessage');
        return manageMessages({ action: 'create', appUserId: currentUser!.id, conversationId, content, role, metadata });
    }
    console.log('📱 Using local storage - createMessage');
    // For local storage, convert back to old format
    return localMessageManager.create({ conversationId, text: content, sender: role === 'assistant' ? 'ai' : role, metadata });
};

export const updateMessage = async (currentUser: User | null, { messageId, updates, conversationId }: UpdateMessageParams): Promise<ApiResponse> => {
    // Use Base44 APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using Base44 API for authenticated user - updateMessage');
        return manageMessages({ action: 'update', appUserId: currentUser!.id, messageId, updates });
    }
    console.log('📱 Using local storage - updateMessage');
    // Note: localMessageManager expects conversationId for updates
    return localMessageManager.update({ conversationId: conversationId || '', messageId, updates });
};


// --- Profile/User Services ---

export const updateProfile = async (currentUser: User | null, profileData: any): Promise<ApiResponse> => {
    // Use Base44 APIs if user is authenticated with TagMango
    if (isAuthenticatedRealUser(currentUser)) {
        console.log('🔐 Using Base44 API for authenticated user - updateProfile');
        return appUserManager({
            action: 'updateProfile',
            appUserId: currentUser!.id,
            profileData
        });
    }
    console.log('📱 Profile not persisted for unauthenticated user');
    // For anonymous users, profile updates are a no-op as they are not persisted.
    // The state is managed locally in Chat.js but not saved anywhere.
    return Promise.resolve({ data: { success: true, message: "Profile not persisted for anonymous user." } });
};

// Added function to handle fetching the dev admin user specifically for the Chat page to use.
// This always uses Base44 APIs as it's for user creation/management
export const getOrCreateAppUser = async (userData: UserData): Promise<ApiResponse> => {
    console.log('🔐 Using Base44 API - getOrCreateAppUser');
    return appUserManager({
        action: 'getOrCreateAppUser',
        ...userData
    });
};