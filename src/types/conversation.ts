import { User } from "./dataService";

export interface Conversation {
  id: string;
  title: string;
  created_date?: string;
}



export interface DiscoveryState {
  status: 'not_started' | 'in_progress' | 'paused' | 'completed';
  currentPhaseIndex: number;
  currentQuestionIndexInPhase: number;
  answers: Record<string, any>;
}

export interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversation: Conversation) => void;
  isCollapsed: boolean;
}

export interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  user: User | null;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversation: Conversation) => void;
  discoveryState: DiscoveryState;
  startOrResumeDiscovery: () => void;
  onGodModeClick: () => void;
  conversationsLoading: boolean;
}
