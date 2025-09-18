const MESSAGE_KEY_PREFIX = 'anonymous_messages_';

const generateLocalId = () => `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to get messages for a conversation with comprehensive error handling
const getMessages = (conversationId) => {
  try {
    // Wrap localStorage.getItem() in try/catch to handle Error Code 5 access violations
    const rawData = localStorage.getItem(`${MESSAGE_KEY_PREFIX}${conversationId}`);
    if (!rawData) {
      return [];
    }
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`Error reading messages for conversation ${conversationId}:`, error);
    // If localStorage is completely inaccessible, return empty array to prevent crash
    return [];
  }
};

// Helper to save messages for a conversation with comprehensive error handling
const saveMessages = (conversationId, messages) => {
  try {
    // Wrap localStorage.setItem() in try/catch to handle Error Code 5 access violations
    localStorage.setItem(`${MESSAGE_KEY_PREFIX}${conversationId}`, JSON.stringify(messages));
  } catch (error) {
    console.error(`Error saving messages for conversation ${conversationId}:`, error);
    // Silently fail if localStorage is inaccessible - app continues in memory-only mode
  }
};

export const list = async ({ conversationId }) => {
  const messages = getMessages(conversationId);
  // Filter out any non-object or null entries, and ensure created_date exists before sorting
  const cleanMessages = messages.filter(m => typeof m === 'object' && m !== null && m.created_date);
  const sortedMessages = cleanMessages.sort((a, b) => {
    const dateA = new Date(a.created_date).getTime();
    const dateB = new Date(b.created_date).getTime();
    // Handle invalid dates by pushing them to the end
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateA - dateB;
  });
  // For local storage, we'll assume we load all, so hasMore is false
  return { data: { messages: sortedMessages, hasMore: false } };
};

export const create = async ({ conversationId, text, sender }) => {
  const messages = getMessages(conversationId);
  const newMessage = {
    id: generateLocalId(),
    conversation_id: conversationId,
    text,
    sender,
    created_date: new Date().toISOString(),
  };
  messages.push(newMessage);
  saveMessages(conversationId, messages);
  return { data: { message: newMessage } };
};

export const update = async ({ conversationId, messageId, updates }) => {
  let messages = getMessages(conversationId);
  const messageIndex = messages.findIndex(m => m.id === messageId);
  if (messageIndex !== -1) {
    messages[messageIndex] = { ...messages[messageIndex], ...updates };
    saveMessages(conversationId, messages);
    return { data: { success: true } };
  }
  return { data: { success: false } };
};