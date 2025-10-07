interface Conversation {
  id: string;
  title: string;
  created_date: string;
}

interface CreateParams {
  title?: string;
}

interface UpdateParams {
  conversationId: string;
  updates: Partial<Conversation>;
}

interface DeleteParams {
  conversationId: string;
}

interface ListResponse {
  data: {
    conversations: Conversation[];
  };
}

interface CreateResponse {
  data: {
    conversation: Conversation;
  };
}

interface UpdateResponse {
  data: {
    success: boolean;
  };
}

interface DeleteResponse {
  data: {
    success: boolean;
  };
}

const CONVERSATIONS_KEY = 'anonymous_conversations';

const generateLocalId = (): string => `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getConversations = (): Conversation[] => {
  try {
    const rawData = localStorage.getItem(CONVERSATIONS_KEY);
    if (!rawData) {
      return [];
    }
    return JSON.parse(rawData) as Conversation[];
  } catch (error) {
    return [];
  }
};

const saveConversations = (conversations: Conversation[]): void => {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (error) {
  }
};

export const list = async (): Promise<ListResponse> => {
  const conversations = getConversations();
  const cleanConversations = conversations.filter((c: any) => typeof c === 'object' && c !== null && c.created_date);
  const sortedConversations = cleanConversations.sort((a: Conversation, b: Conversation) => {
    const dateA = new Date(a.created_date).getTime();
    const dateB = new Date(b.created_date).getTime();
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;
    return dateB - dateA;
  });
  return { data: { conversations: sortedConversations } };
};

export const create = async ({ title }: CreateParams): Promise<CreateResponse> => {
  const conversations = getConversations();
  const newConversation: Conversation = {
    id: generateLocalId(),
    title: title || "New Conversation",
    created_date: new Date().toISOString(),
  };
  conversations.push(newConversation);
  saveConversations(conversations);
  return { data: { conversation: newConversation } };
};

export const update = async ({ conversationId, updates }: UpdateParams): Promise<UpdateResponse> => {
  let conversations = getConversations();
  const conversationIndex = conversations.findIndex((c: Conversation) => c.id === conversationId);
  if (conversationIndex !== -1) {
    conversations[conversationIndex] = { ...conversations[conversationIndex], ...updates };
    saveConversations(conversations);
    return { data: { success: true } };
  }
  return { data: { success: false } };
};

export const del = async ({ conversationId }: DeleteParams): Promise<DeleteResponse> => {
  let conversations = getConversations();
  const filteredConversations = conversations.filter((c: Conversation) => c.id !== conversationId);
  saveConversations(filteredConversations);
  
  try {
    localStorage.removeItem(`anonymous_messages_${conversationId}`);
  } catch (error) {
    // Continue execution even if removeItem fails
  }
  
  return { data: { success: true } };
};