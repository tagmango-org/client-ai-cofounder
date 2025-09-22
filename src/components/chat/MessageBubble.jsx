import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, ShoppingBag, BookOpen, Users, Zap, Loader2, ThumbsUp, ThumbsDown, RotateCcw, Share, Copy } from 'lucide-react';
import PremiumLogo from '../PremiumLogo';

export default function MessageBubble({ msg, thinkingMessage, onRegenerate, isRegenerating }) {
  const isUser = msg.sender === 'user';
  const isStreaming = msg.isStreaming;

  const [copyClicked, setCopyClicked] = useState(false);

  // Detect if message contains course content that suggests creation (not just informational)
  const hasCourseContent = msg.text && (
    // Look for course creation indicators, not just mentions
    /(?:create|design|build|develop|make|suggested?|outline|structure).*(?:course|curriculum|training|program)/i.test(msg.text) ||
    /(?:course|curriculum|training|program).*(?:create|design|build|develop|make|suggested?|outline|structure)/i.test(msg.text) ||
    // Look for structured course content with multiple modules/chapters
    (/(?:course title|title:)/i.test(msg.text) && /module\s*\d+/i.test(msg.text)) ||
    // Look for course description followed by modules
    (/course description/i.test(msg.text) && /modules? outline/i.test(msg.text)) ||
    // Avoid showing button for questions about existing courses
    (!/(?:what|which|how many|tell me about|explain|describe).*(?:course|module|chapter)/i.test(msg.text) &&
     /(?:module \d+:|chapter \d+:|lesson \d+:)/i.test(msg.text))
  );

  // Parse course structure from message text when courseStructure is missing
  const parseCourseFromText = (text) => {
    if (!text) return null;

    // Extract course title - enhanced for various formats
    // First try to find a quoted title
    let titleMatch = text.match(/"([^"]*(?:course|training|basics|essentials|diving|programming|cooking|fitness)[^"]*)"/i);
    
    // If no quoted title, try other patterns
    if (!titleMatch) {
      titleMatch = text.match(/(?:course title:|title:)\s*(.+?)(?:\n|\.)/i) ||
                   text.match(/(?:course|training|program)(?:\s+(?:on|for|about))?\s*([^.!?\n]+?(?:course|training|basics|essentials)[^.!?\n]*)/i) ||
                   text.match(/([^.!?\n]*(?:course|training|basics|essentials)[^.!?\n]*)/i);
    }
    
    let title = titleMatch ? titleMatch[1].trim().replace(/["""]/g, '') : 'Custom Course';
    
    // Clean up the title if it contains extra instruction text
    if (title.includes('like ')) {
      const likeMatch = title.match(/like\s+"([^"]+)"/i);
      if (likeMatch) {
        title = likeMatch[1];
      }
    }
    
    // If we found a basic match, enhance it for common topics
    if (title === 'Custom Course' && /scuba diving/i.test(text)) {
      title = 'Scuba Diving Basics for Beginners';
    } else if (title.toLowerCase().includes('scuba diving') && !title.toLowerCase().includes('basics')) {
      title = title.includes('for') ? title : title + ' for Beginners';
    }

    // Extract description - enhanced for various formats
    let descMatch = text.match(/(?:description:|briefly describe|learners will achieve?)\s*[^"]*"([^"]+)"/i) ||
                   text.match(/(?:for example,?\s*)"([^"]+)"/i) ||
                   text.match(/(?:description:|briefly describe|learners will achieve?|learn)\s*(.+?)(?:\n|modules?:|want me|$)/i);
    
    let description = descMatch ? descMatch[1].trim().replace(/["""]/g, '').replace(/\.$/, '') : 'Course content extracted from conversation';
    
    // Enhanced description for scuba diving
    if (/scuba diving/i.test(text) && description === 'Course content extracted from conversation') {
      description = 'Learn the essentials of scuba diving, from gear setup to underwater safety';
    }

    // Extract modules
    const modules = [];
    const moduleMatches = text.match(/module \d+:?\s*([^.\n]+)/gi) || [];
    
    moduleMatches.forEach((match, index) => {
      const moduleTitle = match.replace(/module \d+:?\s*/i, '').trim();
      modules.push({
        title: moduleTitle,
        chapters: [
          {
            title: `Introduction to ${moduleTitle}`,
            description: `Learn the fundamentals of ${moduleTitle.toLowerCase()}`,
            content: `This chapter covers the essential concepts and practices related to ${moduleTitle.toLowerCase()}.`,
            totalDuration: 30,
            contentType: 'article'
          }
        ]
      });
    });

    // If no modules found, create generic ones based on content
    if (modules.length === 0) {
      const topics = text.match(/(?:•\s*|-)?\s*([^.\n!?]+(?:essentials?|basics?|skills?|safety|equipment|introduction|procedures?))/gi) || [];
      
      if (topics.length > 0) {
        topics.slice(0, 5).forEach((topic, index) => {
          const cleanTopic = topic.replace(/^[•\-\s]*/, '').trim();
          modules.push({
            title: cleanTopic,
            chapters: [
              {
                title: `Understanding ${cleanTopic}`,
                description: `Comprehensive overview of ${cleanTopic.toLowerCase()}`,
                content: `This chapter provides detailed information about ${cleanTopic.toLowerCase()}.`,
                totalDuration: 25,
                contentType: 'article'
              }
            ]
          });
        });
      } else {
        // Fallback modules
        modules.push({
          title: 'Getting Started',
          chapters: [
            {
              title: 'Introduction',
              description: 'Course introduction and overview',
              content: 'Welcome to this comprehensive course.',
              totalDuration: 20,
              contentType: 'article'
            }
          ]
        });
      }
    }

    const result = {
      title,
      description,
      modules
    };
    
    // Debug log to see what we parsed
    console.log('📚 Parsed course structure:', result);
    
    return result;
  };

  const renderCreateButton = (type, data, icon, label, postMessageType) => {
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
        {isStreaming ? (
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
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap gap-3">
                {/* Course button - prioritize courseStructure from LLM, fallback to text detection */}
                {(msg.courseStructure || (hasCourseContent && !msg.courseStructure)) && (() => {
                  const courseData = msg.courseStructure || parseCourseFromText(msg.text);
                  return renderCreateButton('course', courseData, <BookOpen className="w-4 h-4" />, 'Create Course', 'AI_ASSISTANT_CREATE_COURSE');
                })()}
                
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
}