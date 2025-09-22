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

    // Clean up markdown formatting from text
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');

    // Extract course title - enhanced for various formats
    let title = 'Custom Course';
    
    // Look for quoted titles first
    let titleMatch = cleanText.match(/"([^"]*(?:course|training|guide|recycling|plastic)[^"]*)"/i);
    
    // If no quoted title, try other patterns
    if (!titleMatch) {
      titleMatch = cleanText.match(/(?:title:\s*|course\s+title:\s*)"?([^"\n]+)"?/i) ||
                   cleanText.match(/(?:course\s+overview:\s*title:\s*)"?([^"\n]+)"?/i) ||
                   cleanText.match(/(?:the\s+complete\s+guide\s+to\s+)([^.\n]+)/i) ||
                   cleanText.match(/(?:comprehensive\s+course\s+on\s+)([^.\n]+)/i);
    }
    
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/["""]/g, '');
      // Clean up any extra text
      title = title.replace(/\s*course$/i, '').trim();
      if (!title.toLowerCase().includes('course') && !title.toLowerCase().includes('guide')) {
        title = `The Complete Guide to ${title}`;
      }
    }

    // Extract description
    let description = 'Course content extracted from conversation';
    
    let descMatch = cleanText.match(/(?:description:\s*)"?([^"\n]+?)"?(?:\n|$)/i) ||
                   cleanText.match(/(?:this\s+course\s+will\s+)([^.\n]+)/i) ||
                   cleanText.match(/(?:participants\s+(?:will\s+)?(?:learn|understand|discover)\s+)([^.\n]+)/i);
    
    if (descMatch) {
      description = descMatch[1].trim().replace(/["""]/g, '');
      if (!description.endsWith('.')) {
        description += '.';
      }
    }

    // Extract modules - look for various patterns
    const modules = [];
    
    // First try to find numbered modules
    const numberedModules = cleanText.match(/(?:modules?:\s*\n?)((?:(?:\d+\.?\s*|\-\s*|•\s*)[^\n]+\n?)+)/i);
    
    if (numberedModules) {
      const moduleLines = numberedModules[1].match(/(?:\d+\.?\s*|\-\s*|•\s*)([^\n]+)/g) || [];
      
      moduleLines.forEach((line, index) => {
        const moduleTitle = line.replace(/^\d+\.?\s*|\-\s*|•\s*/, '').trim();
        if (moduleTitle && moduleTitle.length > 0) {
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
        }
      });
    }

    // If no numbered modules found, look for topic-based content
    if (modules.length === 0) {
      // Look for any bullet points or topics in the text
      const topics = cleanText.match(/(?:(?:\-\s*|•\s*|\d+\.\s*)([^\n]+(?:recycling|plastic|process|initiative|future|challenge|overview|introduction)[^\n]*))/gi) || 
                    cleanText.match(/([^\n]*(?:recycling|plastic|process|initiative|future|challenge|overview|introduction)[^\n]*)/gi) || [];
      
      const uniqueTopics = [...new Set(topics.slice(0, 5))];
      
      if (uniqueTopics.length > 0) {
        uniqueTopics.forEach((topic, index) => {
          const cleanTopic = topic.replace(/^[\-•\d\.\s]*/, '').trim();
          if (cleanTopic && cleanTopic.length > 5) { // Filter out very short topics
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
          }
        });
      }
    }

    // Fallback if still no modules
    if (modules.length === 0) {
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