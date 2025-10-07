type UserStatus = "not_started" | "in_progress" | "completed";
type UserRole = "user" | "admin";

export interface UserProfile {
  status: UserStatus;
  currentPhaseIndex: number;
  currentQuestionIndexInPhase: number;
  answers: Record<string, string | string[]>;
}

export interface User {
  id: string;
  tagMangoUserId: string;
  name: string;
  email: string;
  phone: number;
  profilePic: string;
  role: UserRole;
  profile: UserProfile;
}

export interface UserData {
  userId: string;
  email: string;
  full_name: string;
  name?: string;
  phone?: string;
  profilePic?: string;
  disabled?: boolean | null;
  is_verified: boolean;
  app_id: string;
  is_service: boolean;
  _app_role: string;
  role?: string;
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
  [key: string]: unknown;
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
  metadata?: Record<string, unknown>;
}

export interface MessageUpdates {
  text?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
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
  metadata?: Record<string, unknown>;
}

export interface UpdateMessageParams {
  messageId: string;
  updates: MessageUpdates;
  conversationId?: string;
}

// API Response types
export interface ApiResponse<T = Record<string, unknown>> {
  data: {
    success: boolean;
    message?: string;
    conversation?: Conversation;
    conversations?: Conversation[];
    messageData?: Message;
    messages?: Message[];
    hasMore?: boolean;
    appUser?: User;
    [key: string]: unknown;
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
  updateProfile: (currentUser: User | null, profileData: Record<string, unknown>) => Promise<ApiResponse>;
  getOrCreateAppUser: (userData: UserData) => Promise<ApiResponse>;
};

