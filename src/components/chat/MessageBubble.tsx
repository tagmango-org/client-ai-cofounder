import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, ShoppingBag, BookOpen, Users, Zap, Loader2, ThumbsUp, ThumbsDown, RotateCcw, Share, Copy } from 'lucide-react';
import PremiumLogo from '../PremiumLogo';
// Define types locally for now
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

interface MessageBubbleProps {
  msg: Message;
  thinkingMessage: string;
  onRegenerate?: (message: Message) => void;
  isRegenerating?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps | any> = ({ msg, thinkingMessage, onRegenerate, isRegenerating }) => {
  const isUser = msg.sender === 'user';
  const isStreaming = msg.isStreaming;

  const [copyClicked, setCopyClicked] = useState<boolean>(false);

  const renderCreateButton = (type: string, data: any, icon: React.ReactNode, label: string, postMessageType: string) => {
    if (!data) return null;

    const handleClick = () => {
      if (window.parent) {
        console.log(`Sending postMessage: ${postMessageType} with data:`, data);
        window.parent.postMessage({
          type: postMessageType,
          data: data,
        }, '*');
      }
    };

    return (
      <Button 
        onClick={handleClick} 
        className="bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white rounded-lg text-sm px-4 py-2 h-auto sleek-transition font-medium flex items-center gap-2"
      >
        {icon}
        <span>{label || `Create ${type}`}</span>
      </Button>
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.text);
    setCopyClicked(true);
    setTimeout(() => {
      setCopyClicked(false);
    }, 400);
  };

  const handleRegenerate = () => {
    if (onRegenerate && !isRegenerating) {
      onRegenerate(msg);
    }
  };

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end mb-4"
      >
        <div className="max-w-[80%] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-2xl px-4 py-2.5">
          <p className="text-[var(--text-primary)] whitespace-pre-wrap">{msg.text}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 mb-6 group"
    >
      {/* AI Avatar */}
      <div className="flex-shrink-0 mt-1">
        <PremiumLogo size="small" />
      </div>

      {/* AI Message Content */}
      <div className="flex-1 max-w-none">
        {isStreaming && !msg.text ? (
          // Only show loader if streaming and no text yet
          <div className="flex items-center text-[var(--text-primary)] gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-5 h-5" />
            </motion.div>
            <ReactMarkdown>{thinkingMessage}</ReactMarkdown>
          </div>
        ) : (
          <>
            <div className="text-[var(--text-primary)] prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-medium prose-a:text-[var(--accent-orange)]">
              <ReactMarkdown
                components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" /> }}
              >
                {msg.text}
              </ReactMarkdown>
              {/* Show cursor when streaming */}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-1.5 h-4 bg-[var(--accent-orange)] ml-0.5"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-3">
                {msg.courseStructure?.title && renderCreateButton('course', msg.courseStructure, <BookOpen className="w-4 h-4" />, 'Create Course', 'AI_ASSISTANT_CREATE_COURSE')}
                {msg.couponStructure && renderCreateButton('coupon', msg.couponStructure, <ShoppingBag className="w-4 h-4" />, 'Create Coupon', 'AI_ASSISTANT_CREATE_COUPON')}
                {msg.postStructure && renderCreateButton('post', msg.postStructure, <Zap className="w-4 h-4" />, 'Create Post', 'AI_ASSISTANT_CREATE_FEED_POST')}
                {msg.serviceStructure && renderCreateButton('service', msg.serviceStructure, <Users className="w-4 h-4" />, 'Create Service', 'AI_ASSISTANT_CREATE_MANGO')}
                {msg.workshopStructure && renderCreateButton('workshop', msg.workshopStructure, <Calendar className="w-4 h-4" />, 'Create Workshop', 'AI_ASSISTANT_CREATE_WORKSHOP')}
            </div>
            
            {/* Message Actions */}
            <div className={`mt-4 flex items-center gap-1 sleek-transition ${copyClicked ? '!opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                <div className="group/tooltip relative">
                    <motion.button
                        className="text-[var(--text-primary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md p-1.5 h-auto bg-transparent border-0 cursor-pointer"
                        onClick={handleCopy}
                        whileTap={{ scale: 0.8, y: 4 }}
                        animate={copyClicked ? {
                          scale: [1, 1.2, 1],
                          backgroundColor: ['var(--bg-hover)', 'var(--accent-orange)', 'var(--bg-hover)']
                        } : {}}
                        transition={{
                          duration: 0.4,
                          ease: "easeOut",
                          scale: { type: "spring", stiffness: 400, damping: 10 }
                        }}
                    >
                        <Copy className="w-4 h-4" />
                    </motion.button>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md px-2 py-1 text-sm text-[var(--text-primary)] shadow-lg whitespace-nowrap z-50 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200">
                        Copy response
                    </div>
                </div>
                
                <div className="group/tooltip relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--text-primary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md p-1.5 h-auto disabled:opacity-50"
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                    >
                        {isRegenerating ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                <RotateCcw className="w-4 h-4" />
                            </motion.div>
                        ) : (
                            <RotateCcw className="w-4 h-4" />
                        )}
                    </Button>
                     <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md px-2 py-1 text-sm text-[var(--text-primary)] shadow-lg whitespace-nowrap z-50 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200">
                        {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                    </div>
                </div>
                <div className="group/tooltip relative">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-[var(--text-primary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md p-1.5 h-auto"
                    >
                        <Share className="w-4 h-4" />
                    </Button>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-md px-2 py-1 text-sm text-[var(--text-primary)] shadow-lg whitespace-nowrap z-50 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200">
                        Share
                    </div>
                </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MessageBubble;