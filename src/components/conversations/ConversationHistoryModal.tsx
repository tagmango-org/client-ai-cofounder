import React from 'react';
import { PlusCircle, MessageSquare } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  created_date?: string;
}

interface ConversationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

export default function ConversationHistoryModal({
  isOpen,
  onClose,
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation
}: ConversationHistoryModalProps) {
  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation);
    onClose();
  };

  const handleNewConversation = () => {
    onNewConversation();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg sm:max-w-md max-h-[80vh] flex flex-col w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Conversation History</h2>
            <button 
              onClick={handleNewConversation} 
              className="text-orange-600 hover:text-orange-700 flex items-center text-sm px-2 py-1 rounded hover:bg-gray-100"
            >
              <PlusCircle className="w-4 h-4 mr-1" />
              New Chat
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 p-4">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start chatting to create your first conversation</p>
            </div>
          ) : (
            conversations.map((convo: Conversation) => (
              <button
                key={convo.id}
                onClick={() => handleSelectConversation(convo)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  activeConversation?.id === convo.id
                    ? 'bg-orange-100 text-orange-800 font-semibold border border-orange-200'
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate flex-1">{convo.title}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}