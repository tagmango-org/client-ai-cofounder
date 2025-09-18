import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare } from 'lucide-react';

export default function ConversationHistoryModal({
  isOpen,
  onClose,
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation
}) {
  const handleSelectConversation = (conversation) => {
    onSelectConversation(conversation);
    onClose();
  };

  const handleNewConversation = () => {
    onNewConversation();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Conversation History</span>
            <Button size="sm" variant="ghost" onClick={handleNewConversation} className="text-orange-600 hover:text-orange-700">
              <PlusCircle className="w-4 h-4 mr-1" />
              New Chat
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm">Start chatting to create your first conversation</p>
            </div>
          ) : (
            conversations.map((convo) => (
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
      </DialogContent>
    </Dialog>
  );
}