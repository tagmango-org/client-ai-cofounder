interface Message {
  id: string;
  conversation_id: string;
  text: string;
  sender: string;
  created_date: string;
  metadata?: any;
}

interface ListParams {
  conversationId: string;
}

interface CreateParams {
  conversationId: string;
  text: string;
  sender: string;
  metadata?: any;
}

interface UpdateParams {
  conversationId: string;
  messageId: string;
  updates: Partial<Message>;
}

interface ListResponse {
  data: {
    messages: Message[];
    hasMore: boolean;
  };
}

interface CreateResponse {
  data: {
    message: Message;
  };
}

interface UpdateResponse {
  data: {
    success: boolean;
  };
}

const MESSAGE_KEY_PREFIX = 'anonymous_messages_';

const generateLocalId = (): string => `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper to get messages for a conversation with comprehensive error handling
const getMessages = (conversationId: string): Message[] => {
  try {
    // Wrap localStorage.getItem() in try/catch to handle Error Code 5 access violations
    const rawData = localStorage.getItem(`${MESSAGE_KEY_PREFIX}${conversationId}`);
    if (!rawData) {
      return [];
    }
    return JSON.parse(rawData) as Message[];
  } catch (error) {
    console.error(`Error reading messages for conversation ${conversationId}:`, error);
    // If localStorage is completely inaccessible, return empty array to prevent crash
    return [];
  }
};

// Helper to save messages for a conversation with comprehensive error handling
const saveMessages = (conversationId: string, messages: Message[]): void => {
  try {
    // Wrap localStorage.setItem() in try/catch to handle Error Code 5 access violations
    localStorage.setItem(`${MESSAGE_KEY_PREFIX}${conversationId}`, JSON.stringify(messages));
  } catch (error) {
    console.error(`Error saving messages for conversation ${conversationId}:`, error);
    // Silently fail if localStorage is inaccessible - app continues in memory-only mode
  }
};

export const list = async ({ conversationId }: ListParams): Promise<ListResponse> => {
  const messages = getMessages(conversationId);
  // Filter out any non-object or null entries, and ensure created_date exists before sorting
  const cleanMessages = messages.filter((m: any) => typeof m === 'object' && m !== null && m.created_date);
  const sortedMessages = cleanMessages.sort((a: Message, b: Message) => {
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

export const create = async ({ conversationId, text, sender, metadata }: CreateParams): Promise<CreateResponse> => {
  const messages = getMessages(conversationId);
  const newMessage: Message = {
    id: generateLocalId(),
    conversation_id: conversationId,
    text,
    sender,
    created_date: new Date().toISOString(),
    metadata
  };
  messages.push(newMessage);
  saveMessages(conversationId, messages);
  return { data: { message: newMessage } };
};

export const update = async ({ conversationId, messageId, updates }: UpdateParams): Promise<UpdateResponse> => {
  let messages = getMessages(conversationId);
  const messageIndex = messages.findIndex((m: Message) => m.id === messageId);
  if (messageIndex !== -1) {
    messages[messageIndex] = { ...messages[messageIndex], ...updates };
    saveMessages(conversationId, messages);
    return { data: { success: true } };
  }
  return { data: { success: false } };
};