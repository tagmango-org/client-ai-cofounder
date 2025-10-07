// Chat component types
export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp?: Date;
  conversationId?: string;
  metadata?: Record<string, unknown>;
  created_date: string;
}

export interface Conversation {
  id: string;
  title?: string;
  messages?: Message[];
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
}


export interface DiscoveryQuestionOptions {
  key: string;
  question: string;
  options: string[];
  multiSelect: boolean;
}


export interface DiscoveryPhaseOptions {
  key: string;
  title: string;
  questions: DiscoveryQuestionOptions[];
}
export interface DiscoveryQuestion {
  key: string;
  question: string;
  options: string[];
  multiSelect?: boolean;
  type?: 'single' | 'multiple' | 'text';
}

export interface DiscoveryPhase {
  key: string;
  title: string;
  description: string;
  questions: DiscoveryQuestion[];
  completed?: boolean;
}

export interface DiscoveryState {
  status: "not_started" | "in_progress" | "paused" | "completed";
  currentPhaseIndex: number;
  currentQuestionIndexInPhase: number;
  answers: Record<string, string | string[]>;
}

export interface MessageCache {
  [conversationId: string]: Message[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category?: string;
  keywords?: string[];
  createdAt?: Date;
}

// Component Props Types
export interface DiscoveryQuestionOptionsProps {
  question: DiscoveryQuestion;
  onAnswer: (questionKey: string, answer: string | string[]) => void;
}

export interface MessageBubbleProps {
  message: Message;
  onRegenerate?: (message: Message) => void;
  isLast?: boolean;
}

export interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// Event Handler Types
export type MessageChangeHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
export type KeyPressHandler = (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
export type ClickHandler = () => void;
export type ConversationHandler = (conversation: Conversation) => void;
export type MessageHandler = (message: Message) => void;
