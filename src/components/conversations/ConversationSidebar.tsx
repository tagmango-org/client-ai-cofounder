
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Plus, Wand2, Zap, User as UserIcon, Moon, Sun, Library, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from '../ThemeProvider';
import PremiumLogo from '../PremiumLogo';
import ConversationSkeleton from './ConversationSkeleton';
import type { 
  ConversationListProps, 
  ConversationSidebarProps, 
  Conversation,
  User,
  DiscoveryState
} from '@/types/conversation';

// Define ConversationList as a sub-component
const ConversationList: React.FC<ConversationListProps> = ({ conversations, activeConversation, onSelectConversation, onDeleteConversation, onRenameConversation, isCollapsed }) => {
  if (isCollapsed) {
    return null; // Don't render conversation list when collapsed
  }

  if (conversations.length === 0) {
    return (
      <p className="text-[var(--text-muted)] text-center text-sm py-4">
        No conversations yet. Start a new chat!
      </p>
    );
  }

  return (
    <div className="space-y-0.5">
      {conversations.map((convo) => (
        <div key={convo.id} className="relative group">
          <button
            onClick={() => onSelectConversation(convo)}
            className={`w-full text-left flex items-center px-2 py-2 rounded-md sleek-transition transition-all duration-200 ${
              activeConversation?.id === convo.id
                ? 'bg-[var(--bg-active)] text-[var(--text-primary)] shadow-sm font-medium'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
            title={convo.title}
          >
            <span className="truncate flex-1 text-sm leading-relaxed">{convo.title}</span>
          </button>

          <div className="absolute top-0 bottom-0 right-1.5 flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] p-0 rounded-md sleek-transition backdrop-blur-sm"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.currentTarget.classList.add('button-press')}
                  onMouseUp={(e) => e.currentTarget.classList.remove('button-press')}
                  onMouseLeave={(e) => e.currentTarget.classList.remove('button-press')}
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="bg-[var(--bg-tertiary)] backdrop-blur-md border border-[var(--border-primary)] rounded-lg shadow-lg min-w-[140px] fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={() => onRenameConversation(convo)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer text-xs font-medium px-3 py-2 rounded-sm sleek-transition-fast flex items-center"
                >
                  <Pencil className="w-3.5 h-3.5 mr-2 opacity-70" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[var(--border-secondary)] my-0.5 mx-1" />
                <DropdownMenuItem
                  onClick={() => onDeleteConversation(convo.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer text-xs font-medium px-3 py-2 rounded-sm sleek-transition-fast flex items-center"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2 opacity-70" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
};


const ConversationSidebar: React.FC<ConversationSidebarProps | any> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  isCollapsed,
  onToggleCollapse,
  user,
  onDeleteConversation,
  onRenameConversation,
  discoveryState,
  startOrResumeDiscovery,
  onGodModeClick,
  conversationsLoading, // Added this prop
}) => {
  const { theme, toggleTheme }: any = useTheme();

  const discoveryButtonText = React.useMemo(() => {
    if (discoveryState.status === 'completed') return 'Discovery Complete';
    if (discoveryState.status === 'paused') return 'Resume Discovery';
    if (discoveryState.status === 'in_progress') return 'Discovery in Progress';
    return 'Start Discovery';
  }, [discoveryState.status]);

  return (
    <motion.div
      className={`h-full bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] flex flex-col gpu-accelerated ${isCollapsed ? 'w-16' : 'w-64'} sleek-transition`}
      initial={false}
      animate={{ width: isCollapsed ? 64 : 256 }} // Corresponds to w-16 (64px) and w-64 (256px)
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <PremiumLogo size="default" />
            <span className="text-[var(--text-primary)] font-semibold text-xl tracking-wide">AI Co-Founder</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] p-1.5 h-auto rounded-md sleek-transition-fast"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          onMouseDown={(e) => e.currentTarget.classList.add('button-press')}
          onMouseUp={(e) => e.currentTarget.classList.remove('button-press')}
          onMouseLeave={(e) => e.currentTarget.classList.remove('button-press')}
        >
          {isCollapsed ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 5l7 7-7 7M3 5l7 7-7 7"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 19l-7-7 7-7M21 19l-7-7 7-7"/>
            </svg>
          )}
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="p-2 space-y-1.5">
        <Button
          onClick={onNewConversation}
          className="w-full bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white rounded-md h-9 text-sm font-semibold flex items-center justify-center gap-2.5 sleek-transition hover-lift shadow-sm hover:shadow-md"
          title={isCollapsed ? "New Chat" : undefined}
          onMouseDown={(e) => e.currentTarget.classList.add('button-press')}
          onMouseUp={(e) => e.currentTarget.classList.remove('button-press')}
          onMouseLeave={(e) => e.currentTarget.classList.remove('button-press')}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>New Chat</span>}
        </Button>

        {!isCollapsed ? (
          <>
            <Button
              onClick={startOrResumeDiscovery}
              disabled={discoveryState.status === 'in_progress' || discoveryState.status === 'completed'}
              variant="ghost"
              className="w-full justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md h-9 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 px-2 sleek-transition-fast backdrop-blur-subtle"
              style={{ backgroundColor: 'var(--bg-discovery-button)' }}
              onMouseDown={(e) => !e.currentTarget.disabled && e.currentTarget.classList.add('button-press')}
              onMouseUp={(e) => e.currentTarget.classList.remove('button-press')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('button-press')}
            >
              <Wand2 className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{discoveryButtonText}</span>
            </Button>

            <Button
              onClick={onGodModeClick}
              variant="ghost"
              className="w-full justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md h-9 text-sm font-medium flex items-center gap-2.5 px-2 sleek-transition-fast backdrop-blur-subtle"
              style={{ backgroundColor: 'var(--bg-godmode-button)' }}
              onMouseDown={(e) => e.currentTarget.classList.add('button-press')}
              onMouseUp={(e) => e.currentTarget.classList.remove('button-press')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('button-press')}
            >
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span className="flex items-center">
                God Mode
                <span className="ml-2 text-xs bg-[var(--accent-orange)] text-white px-1.5 py-0.5 rounded font-medium animate-pulse-subtle">
                  Coming Soon
                </span>
              </span>
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={startOrResumeDiscovery}
              disabled={discoveryState.status === 'in_progress' || discoveryState.status === 'completed'}
              variant="ghost"
              className="w-full flex justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md h-9 p-0 disabled:opacity-50 disabled:cursor-not-allowed sleek-transition-fast backdrop-blur-subtle"
              style={{ backgroundColor: 'var(--bg-discovery-button)' }}
              title={discoveryState.status === 'completed' ? 'Discovery Complete' : discoveryState.status === 'paused' ? 'Resume Discovery' : discoveryState.status === 'in_progress' ? 'Discovery in Progress' : 'Start Discovery'}
              onMouseDown={(e) => !e.currentTarget.disabled && e.currentTarget.classList.add('button-press')}
              onMouseUp={(e) => e.currentTarget.classList.remove('button-press')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('button-press')}
            >
              <Wand2 className="w-4 h-4" />
            </Button>

            <Button
              onClick={onGodModeClick}
              variant="ghost"
              className="w-full flex justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md h-9 p-0 sleek-transition-fast relative backdrop-blur-subtle"
              style={{ backgroundColor: 'var(--bg-godmode-button)' }}
              title="God Mode (Coming Soon)"
              onMouseDown={(e) => e.currentTarget.classList.add('button-press')}
              onMouseUp={(e) => e.currentTarget.classList.remove('button-press')}
              onMouseLeave={(e) => e.currentTarget.classList.remove('button-press')}
            >
              <Zap className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--accent-orange)] rounded-full animate-pulse"></span>
            </Button>
          </>
        )}
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversationsLoading ? (
          <div> {/* Removed 'className="p-2"' */}
            <ConversationSkeleton />
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeConversation={activeConversation}
            onSelectConversation={onSelectConversation}
            onDeleteConversation={onDeleteConversation}
            onRenameConversation={onRenameConversation}
            isCollapsed={isCollapsed} // Pass isCollapsed to ConversationList
          />
        )}
      </div>

      {/* User & Settings Section */}
      {user && (
        <div className="p-2 border-t border-[var(--border-subtle)] space-y-1.5">
          {!isCollapsed ? (
            <>
              <Button
                onClick={toggleTheme}
                variant="ghost"
                className="w-full justify-start text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] sleek-transition rounded-md h-9 text-sm font-medium flex items-center gap-2.5 px-2 transition-all duration-200"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
              </Button>

              <Link to={createPageUrl('Profile')}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] sleek-transition rounded-md h-9 text-sm font-medium flex items-center gap-2.5 px-2 transition-all duration-200"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>My Profile</span>
                </Button>
              </Link>

              {user.role === 'admin' && (
                <Link to={createPageUrl('KnowledgeBase')}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] sleek-transition rounded-md h-9 text-sm font-medium flex items-center gap-2.5 px-2 transition-all duration-200"
                  >
                    <Library className="w-4 h-4" />
                    <span>Knowledge Base</span>
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={toggleTheme}
                variant="ghost"
                className="w-full flex justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md h-9 p-0 sleek-transition-fast"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
                onMouseDown={(e) => e.currentTarget.classList.add('button-press')}
                onMouseUp={(e) => e.currentTarget.classList.remove('button-press')}
                onMouseLeave={(e) => e.currentTarget.classList.remove('button-press')}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              <Link to={createPageUrl('Profile')}>
                <Button
                  variant="ghost"
                  className="w-full flex justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md h-9 p-0 sleek-transition-fast"
                  title="View My Profile"
                  onMouseDown={(e) => e.currentTarget.classList.add('button-press')}
                  onMouseUp={(e) => e.currentTarget.classList.remove('button-press')}
                  onMouseLeave={(e) => e.currentTarget.classList.remove('button-press')}
                >
                  <UserIcon className="w-4 h-4" />
                </Button>
              </Link>

              {user.role === 'admin' && (
                <Link to={createPageUrl('KnowledgeBase')}>
                  <Button
                    variant="ghost"
                    className="w-full flex justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md h-9 p-0 sleek-transition-fast"
                    title="Manage Knowledge Base"
                    onMouseDown={(e) => e.currentTarget.classList.add('button-press')}
                    onMouseUp={(e) => e.currentTarget.classList.remove('button-press')}
                    onMouseLeave={(e) => e.currentTarget.classList.remove('button-press')}
                  >
                    <Library className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default ConversationSidebar;
