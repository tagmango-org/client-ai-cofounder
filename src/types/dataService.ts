// DataService types for API and local storage operations

// User types
export interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  profilePic?: string;
  profile?: any;
}

export interface UserData {
  userId: string;
  name: string;
  email: string;
  phone: string;
  profilePic: string;
}

// Conversation types
export interface Conversation {
  id: string;
  title: string;
  created_date: string;
  isTemporary?: boolean;
}

export interface ConversationUpdates {
  title?: string;
  [key: string]: any;
}

export interface CreateConversationParams {
  title: string;
}

export interface UpdateConversationParams {
  conversationId: string;
  updates: ConversationUpdates;
}

export interface DeleteConversationParams {
  conversationId: string;
}

// Message types
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'assistant';
  created_date: string;
  conversationId?: string;
  metadata?: any;
}

export interface MessageUpdates {
  text?: string;
  metadata?: any;
  [key: string]: any;
}

export interface ListMessagesParams {
  conversationId: string;
  cursor?: string | null;
  limit?: number;
}

export interface CreateMessageParams {
  conversationId: string;
  content: string;
  role: 'user' | 'assistant';
  metadata?: any;
}

export interface UpdateMessageParams {
  messageId: string;
  updates: MessageUpdates;
  conversationId?: string;
}

// API Response types
export interface ApiResponse<T = any> {
  data: {
    success: boolean;
    message?: string;
    conversation?: Conversation;
    conversations?: Conversation[];
    messageData?: Message;
    messages?: Message[];
    hasMore?: boolean;
    appUser?: User;
    [key: string]: any;
  } & T;
}

// Service function types
export type ConversationService = {
  listConversations: (currentUser: User | null) => Promise<ApiResponse>;
  createConversation: (currentUser: User | null, params: CreateConversationParams) => Promise<ApiResponse>;
  updateConversation: (currentUser: User | null, params: UpdateConversationParams) => Promise<ApiResponse>;
  deleteConversation: (currentUser: User | null, params: DeleteConversationParams) => Promise<ApiResponse>;
};

export type MessageService = {
  listMessages: (currentUser: User | null, params: ListMessagesParams) => Promise<ApiResponse>;
  createMessage: (currentUser: User | null, params: CreateMessageParams) => Promise<ApiResponse>;
  updateMessage: (currentUser: User | null, params: UpdateMessageParams) => Promise<ApiResponse>;
};

export type ProfileService = {
  updateProfile: (currentUser: User | null, profileData: any) => Promise<ApiResponse>;
  getOrCreateAppUser: (userData: UserData) => Promise<ApiResponse>;
};

