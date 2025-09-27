import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  title: string;
  created_date?: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
}

export default function ConversationList({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation
}: ConversationListProps) {
  return (
    <div className="w-80 h-full bg-orange-50/50 border-r border-orange-200/50 flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">History</h2>
        <Button  size="sm" variant="ghost" onClick={onNewConversation} className="text-orange-600 hover:text-orange-700">
          <PlusCircle className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-2">
        {conversations.map((convo: Conversation) => (
          <button
            key={convo.id}
            onClick={() => onSelectConversation(convo)}
            className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors ${
              activeConversation?.id === convo.id
                ? 'bg-orange-100 text-orange-800 font-semibold'
                : 'text-gray-600 hover:bg-orange-100/50'
            }`}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="truncate flex-1">{convo.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}