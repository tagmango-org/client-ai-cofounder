import { manageConversations } from '@/api/functions';
import { manageMessages } from '@/api/functions';
import * as localConversationManager from '../localStorage/conversationManager';
import * as localMessageManager from '../localStorage/messageManager';
import { appUserManager } from "@/api/functions";

const isRealUser = (user) => user && user.id !== 'anonymous';

// --- Conversation Services ---

export const listConversations = async (currentUser) => {
    if (isRealUser(currentUser)) {
        return manageConversations({ action: 'list', appUserId: currentUser.id });
    }
    return localConversationManager.list();
};

export const createConversation = async (currentUser, { title }) => {
    if (isRealUser(currentUser)) {
        return manageConversations({ action: 'create', appUserId: currentUser.id, title });
    }
    return localConversationManager.create({ title });
};

export const updateConversation = async (currentUser, { conversationId, updates }) => {
    if (isRealUser(currentUser)) {
        return manageConversations({ action: 'update', appUserId: currentUser.id, conversationId, updates });
    }
    return localConversationManager.update({ conversationId, updates });
};

export const deleteConversation = async (currentUser, { conversationId }) => {
    if (isRealUser(currentUser)) {
        return manageConversations({ action: 'delete', appUserId: currentUser.id, conversationId });
    }
    return localConversationManager.del({ conversationId });
};


// --- Message Services ---

export const listMessages = async (currentUser, { conversationId, cursor, limit }) => {
    if (isRealUser(currentUser)) {
        return manageMessages({ action: 'list', appUserId: currentUser.id, conversationId, cursor, limit });
    }
    return localMessageManager.list({ conversationId });
};

export const createMessage = async (currentUser, { conversationId, text, sender }) => {
    if (isRealUser(currentUser)) {
        return manageMessages({ action: 'create', appUserId: currentUser.id, conversationId, text, sender });
    }
    return localMessageManager.create({ conversationId, text, sender });
};

export const updateMessage = async (currentUser, { messageId, updates, conversationId }) => {
    if (isRealUser(currentUser)) {
        return manageMessages({ action: 'update', appUserId: currentUser.id, messageId, updates });
    }
    // Note: localMessageManager expects conversationId for updates
    return localMessageManager.update({ conversationId, messageId, updates });
};


// --- Profile/User Services ---

export const updateProfile = async (currentUser, profileData) => {
    if (isRealUser(currentUser)) {
        return appUserManager({
            action: 'updateProfile',
            appUserId: currentUser.id,
            profileData
        });
    }
    // For anonymous users, profile updates are a no-op as they are not persisted.
    // The state is managed locally in Chat.js but not saved anywhere.
    return Promise.resolve({ data: { success: true, message: "Profile not persisted for anonymous user." } });
};

// Added function to handle fetching the dev admin user specifically for the Chat page to use.
export const getOrCreateAppUser = async (userData) => {
    return appUserManager({
        action: 'getOrCreateAppUser',
        ...userData
    });
};