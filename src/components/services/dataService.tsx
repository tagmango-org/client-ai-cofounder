import { manageConversations } from '@/api/functions';
import { manageMessages } from '@/api/functions';
import * as localConversationManager from '../localStorage/conversationManager';
import * as localMessageManager from '../localStorage/messageManager';
import { appUserManager } from "@/api/functions";
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

// --- Conversation Services ---

export const listConversations = async (currentUser: User | null): Promise<ApiResponse> => {
    if (isRealUser(currentUser)) {
        return manageConversations({ action: 'list', appUserId: currentUser!.id });
    }
    return localConversationManager.list();
};

export const createConversation = async (currentUser: User | null, { title }: CreateConversationParams): Promise<ApiResponse> => {
    if (isRealUser(currentUser)) {
        return manageConversations({ action: 'create', appUserId: currentUser!.id, title });
    }
    return localConversationManager.create({ title });
};

export const updateConversation = async (currentUser: User | null, { conversationId, updates }: UpdateConversationParams): Promise<ApiResponse> => {
    if (isRealUser(currentUser)) {
        return manageConversations({ action: 'update', appUserId: currentUser!.id, conversationId, updates });
    }
    return localConversationManager.update({ conversationId, updates });
};

export const deleteConversation = async (currentUser: User | null, { conversationId }: DeleteConversationParams): Promise<ApiResponse> => {
    if (isRealUser(currentUser)) {
        return manageConversations({ action: 'delete', appUserId: currentUser!.id, conversationId });
    }
    return localConversationManager.del({ conversationId });
};


// --- Message Services ---

export const listMessages = async (currentUser: User | null, { conversationId, cursor, limit }: ListMessagesParams): Promise<ApiResponse> => {
    if (isRealUser(currentUser)) {
        return manageMessages({ action: 'list', appUserId: currentUser!.id, conversationId, cursor, limit });
    }
    return localMessageManager.list({ conversationId });
};

export const createMessage = async (currentUser: User | null, { conversationId, content, role, metadata }: CreateMessageParams): Promise<ApiResponse> => {
    if (isRealUser(currentUser)) {
        return manageMessages({ action: 'create', appUserId: currentUser!.id, conversationId, content, role, metadata });
    }
    // For local storage, convert back to old format
    return localMessageManager.create({ conversationId, text: content, sender: role === 'assistant' ? 'ai' : role, metadata });
};

export const updateMessage = async (currentUser: User | null, { messageId, updates, conversationId }: UpdateMessageParams): Promise<ApiResponse> => {
    if (isRealUser(currentUser)) {
        return manageMessages({ action: 'update', appUserId: currentUser!.id, messageId, updates });
    }
    // Note: localMessageManager expects conversationId for updates
    return localMessageManager.update({ conversationId, messageId, updates });
};


// --- Profile/User Services ---

export const updateProfile = async (currentUser: User | null, profileData: any): Promise<ApiResponse> => {
    if (isRealUser(currentUser)) {
        return appUserManager({
            action: 'updateProfile',
            appUserId: currentUser!.id,
            profileData
        });
    }
    // For anonymous users, profile updates are a no-op as they are not persisted.
    // The state is managed locally in Chat.js but not saved anywhere.
    return Promise.resolve({ data: { success: true, message: "Profile not persisted for anonymous user." } });
};

// Added function to handle fetching the dev admin user specifically for the Chat page to use.
export const getOrCreateAppUser = async (userData: UserData): Promise<ApiResponse> => {
    return appUserManager({
        action: 'getOrCreateAppUser',
        ...userData
    });
};