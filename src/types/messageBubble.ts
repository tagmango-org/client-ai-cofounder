export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  created_date: string;
  isStreaming?: boolean;
  courseStructure?: any;
  couponStructure?: any;
  postStructure?: any;
  serviceStructure?: any;
  workshopStructure?: any;
}

export interface MessageBubbleProps {
  msg: Message;
  thinkingMessage: string;
  onRegenerate?: (message: Message) => void;
  isRegenerating?: boolean;
}
