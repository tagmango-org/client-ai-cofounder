const CONVERSATIONS_KEY = 'anonymous_conversations';

const generateLocalId = () => `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to get all conversations from localStorage with comprehensive error handling
const getConversations = () => {
  try {
    // Wrap localStorage.getItem() in try/catch to handle Error Code 5 access violations
    const rawData = localStorage.getItem(CONVERSATIONS_KEY);
    if (!rawData) {
      return [];
    }
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading conversations from localStorage:", error);
    // If localStorage is completely inaccessible, return empty array to prevent crash
    return [];
  }
};

// Helper to save all conversations to localStorage with comprehensive error handling
const saveConversations = (conversations) => {
  try {
    // Wrap localStorage.setItem() in try/catch to handle Error Code 5 access violations
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Error saving conversations to localStorage:", error);
    // Silently fail if localStorage is inaccessible - app continues in memory-only mode
  }
};

export const list = async () => {
  const conversations = getConversations();
  // Filter out any non-object or null entries, and ensure created_date exists before sorting
  const cleanConversations = conversations.filter(c => typeof c === 'object' && c !== null && c.created_date);
  const sortedConversations = cleanConversations.sort((a, b) => {
    const dateA = new Date(a.created_date).getTime();
    const dateB = new Date(b.created_date).getTime();
    // Handle invalid dates by pushing them to the end
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });
  return { data: { conversations: sortedConversations } };
};

export const create = async ({ title }) => {
  const conversations = getConversations();
  const newConversation = {
    id: generateLocalId(),
    title: title || "New Conversation",
    created_date: new Date().toISOString(),
  };
  conversations.push(newConversation);
  saveConversations(conversations);
  return { data: { conversation: newConversation } };
};

export const update = async ({ conversationId, updates }) => {
  let conversations = getConversations();
  const conversationIndex = conversations.findIndex(c => c.id === conversationId);
  if (conversationIndex !== -1) {
    conversations[conversationIndex] = { ...conversations[conversationIndex], ...updates };
    saveConversations(conversations);
    return { data: { success: true } };
  }
  return { data: { success: false } };
};

export const del = async ({ conversationId }) => {
  let conversations = getConversations();
  const filteredConversations = conversations.filter(c => c.id !== conversationId);
  saveConversations(filteredConversations);
  
  // Also remove associated messages with comprehensive error handling
  try {
    localStorage.removeItem(`anonymous_messages_${conversationId}`);
  } catch (error) {
    console.error(`Error removing messages for conversation ${conversationId}:`, error);
    // Continue execution even if removeItem fails
  }
  
  return { data: { success: true } };
};