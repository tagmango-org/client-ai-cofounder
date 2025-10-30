import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2, X, Wand2, CheckCircle2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DiscoveryState,
  KnowledgeArticle as KnowledgeArticleType,
  KeyPressHandler,
  DiscoveryQuestion,
  DiscoveryPhaseOptions,
} from "@/types/chat";
import { Message, Conversation } from "@/types/dataService";
import {
  InvokeLLM,
  GenerateTitle,
  GeneratePhaseInsights,
  GenerateProfileSynthesis,
} from "@/api/openai";
import { User } from "@/types/dataService";

interface ExtendedMessage extends Message {
  isStreaming?: boolean;
  courseStructure?: Record<string, unknown>;
  couponStructure?: Record<string, unknown>;
  postStructure?: Record<string, unknown>;
  serviceStructure?: Record<string, unknown>;
  workshopStructure?: Record<string, unknown>;
}

interface PhaseInsights {
  key_discovery: string;
  coaching_recommendation: string;
  next_steps: string;
  growth_opportunity: string;
}

interface ProfileSynthesis {
  niche_clarity: string;
  personality_type: string;
  core_motivation: string;
  primary_strength: string;
  growth_edge: string;
  business_stage: string;
}

interface ExtendedMessageCache {
  [conversationId: string]: ExtendedMessage[];
}

import ConversationSidebar from "../components/conversations/ConversationSidebar";
import DiscoveryProgressTracker from "../components/chat/DiscoveryProgressTracker";
import { createPageUrl } from "@/utils";
import PhaseCompletionCelebration from "../components/chat/PhaseCompletionCelebration";
import MessageBubble from "../components/chat/MessageBubble";
import SkeletonLoader from "../components/chat/SkeletonLoader";
import PremiumLogo from "../components/PremiumLogo";
import {
  useCurrentUser,
  useAppUserLoading,
  useUserStore,
} from "../stores/userStore";
import * as dataService from "@/components/services/dataService";
import { Button } from "@/components/ui/button";
import { useConfirmationModal } from "@/contexts/ConfirmationModalContext";
import { useToast } from "@/components/ui/use-toast";
import {
  DISCOVERY_PHASES,
  placeholderIdeas,
  thinkingPhrases,
} from "@/data/chat";

const DEFAULT_DISCOVERY_STATE: DiscoveryState = {
  status: "not_started" as const,
  currentPhaseIndex: 0,
  currentQuestionIndexInPhase: 0,
  answers: {},
};

// Streaming configuration for AI responses
const STREAMING_CONFIG = {
  wordsPerChunk: 4, // Number of words to display per chunk
  chunkDelay: 40, // Delay in milliseconds between chunks (reduced from 50ms)
  enableStreaming: true, // Set to false for instant display
};

const generateLocalId = () =>
  `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface DiscoveryQuestionOptionsProps {
  question: {
    key: string;
    question: string;
    options: string[];
    multiSelect: boolean;
  };
  onAnswer: (key: string, answer: string | string[]) => void;
}

const DiscoveryQuestionOptions = ({
  question,
  onAnswer,
}: DiscoveryQuestionOptionsProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  useEffect(() => {
    setSelectedOptions([]);
  }, [question.key]);

  const handleOptionClick = (option: string) => {
    if (question.multiSelect) {
      setSelectedOptions((prev) =>
        prev.includes(option)
          ? prev.filter((o) => o !== option)
          : [...prev, option]
      );
    } else {
      onAnswer(question.key, option);
    }
  };

  const handleConfirmSelection = () => {
    if (question.multiSelect && selectedOptions.length > 0) {
      onAnswer(question.key, selectedOptions);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {question.options.map((option) => (
        <Button
          key={option}
          className={`
                        bg-[var(--bg-tertiary)] border border-[var(--border-secondary)] text-[var(--text-primary)]
                        hover:bg-[var(--bg-hover)] hover:border-[var(--border-primary)] 
                        sleek-transition rounded-lg text-sm px-3 py-2 h-auto
                        ${
                          question.multiSelect &&
                          selectedOptions.includes(option)
                            ? "bg-[var(--accent-orange)] text-white border-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)]"
                            : ""
                        }
                    `}
          onClick={() => handleOptionClick(option)}
        >
          {option}
        </Button>
      ))}
      {question.multiSelect && selectedOptions.length > 0 && (
        <Button
          className="bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white rounded-lg text-sm px-4 py-2 h-auto sleek-transition font-medium"
          onClick={handleConfirmSelection}
        >
          {`Confirm Selection (${selectedOptions.length})`}
        </Button>
      )}
    </div>
  );
};

const isRealUser = (user: User | null): user is User =>
  user !== null && user._id !== "anonymous";

export default function Chat() {
  console.log("test :_>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState<string>(
    placeholderIdeas[0]
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const currentAppUser = useCurrentUser();
  const appUserLoading = useAppUserLoading();
  const { setCurrentAppUser } = useUserStore();

  // Debug authentication status
  useEffect(() => {
    if (!appUserLoading && currentAppUser) {
      const authStatus = dataService.getAuthenticationStatus(currentAppUser);
    }
  }, [currentAppUser, appUserLoading]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [thinkingMessage, setThinkingMessage] = useState<string>(
    thinkingPhrases[0]
  );

  const [renamingConversation, setRenamingConversation] =
    useState<Conversation | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");

  const [showGodModeOverlay, setShowGodModeOverlay] = useState<boolean>(false);

  const [appReady, setAppReady] = useState<boolean>(false);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [conversationsLoading, setConversationsLoading] =
    useState<boolean>(true);

  const [messageCache, setMessageCache] = useState<ExtendedMessageCache>({});
  const [messagesPage, setMessagesPage] = useState<number>(0);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const [knowledgeArticleCache, setKnowledgeArticleCache] = useState<
    KnowledgeArticleType[]
  >([]);
  const [knowledgeArticlesCached, setKnowledgeArticlesCached] =
    useState<boolean>(false);

  const [discoveryState, setDiscoveryState] = useState<DiscoveryState>(() => ({
    ...DEFAULT_DISCOVERY_STATE,
    answers: DEFAULT_DISCOVERY_STATE.answers || {},
  }));
  const [showPhaseCompletion, setShowPhaseCompletion] =
    useState<boolean>(false);
  const [completedPhaseTitle, setCompletedPhaseTitle] = useState<string>("");

  const [showProgressNotification, setShowProgressNotification] =
    useState<boolean>(false);

  const [isRegenerating, setIsRegenerating] = useState<ExtendedMessage | null>(
    null
  );

  // Confirmation modal for various actions (global)
  const { showConfirmation } = useConfirmationModal();
  
  // Toast notifications
  const { toast } = useToast();

  // Utility function for auto-dismissing toasts
  const showAutoDismissToast = (toastConfig: any, duration: number = 3000) => {
    const toastResult = toast(toastConfig);
    
    // Use setTimeout to dismiss after the specified duration
    const timeoutId = setTimeout(() => {
      toastResult.dismiss();
    }, duration);
    
    // Store the timeout ID so we can clear it if needed
    toastResult.timeoutId = timeoutId;
    
    return toastResult;
  };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const placeholderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState<boolean>(true);
  const shouldAutoScrollRef = useRef<boolean>(true);
  const isScrollingProgrammaticallyRef = useRef<boolean>(false);
  const userScrolledAwayRef = useRef<boolean>(false);
  const lastScrollTopRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = (smooth: boolean = false) => {
    if (messagesEndRef.current && chatContainerRef.current) {
      isScrollingProgrammaticallyRef.current = true;

      // Direct scroll for more reliable behavior during streaming
      const container = chatContainerRef.current;
      const targetScrollTop = container.scrollHeight - container.clientHeight;

      if (smooth) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      } else {
        // Instant scroll for streaming
        container.scrollTop = targetScrollTop;
      }

      // Reset the flag after a short delay
      setTimeout(() => {
        isScrollingProgrammaticallyRef.current = false;
        lastScrollTopRef.current = container.scrollTop;
      }, 150);
    }
  };

  const checkIfUserIsAtBottom = () => {
    if (!chatContainerRef.current) return true;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Consider "at bottom" if within 100px of the bottom
    return distanceFromBottom < 100;
  };

  useEffect(() => {
    // Only auto-scroll if user hasn't manually scrolled away and not loading more
    if (!isLoadingMore && !userScrolledAwayRef.current) {
      // Debounce the scroll to avoid conflicts
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (!userScrolledAwayRef.current) {
          const isAtBottom = checkIfUserIsAtBottom();
          if (isAtBottom) {
            // Always use instant scroll during streaming to prevent jank
            scrollToBottom(false);
          }
        }
      }, 50);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages, discoveryState.status, showPhaseCompletion, isLoadingMore]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isTyping) {
      setThinkingMessage(thinkingPhrases[0]);
      intervalId = setInterval(() => {
        setThinkingMessage((prev) => {
          const currentIndex = thinkingPhrases.indexOf(prev);
          const nextIndex = (currentIndex + 1) % thinkingPhrases.length;
          return thinkingPhrases[nextIndex];
        });
      }, 2500);
    }
    return () => clearInterval(intervalId);
  }, [isTyping]);

  useEffect(() => {
    if (activeConversation && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [activeConversation]);

  // Add wheel event listener to detect scroll intent immediately
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (isScrollingProgrammaticallyRef.current) return;

      const atBottom = checkIfUserIsAtBottom();

      // If user is scrolling up (negative deltaY), mark them as scrolled away
      if (e.deltaY < 0) {
        if (!atBottom) {
          userScrolledAwayRef.current = true;
        }
      } else if (e.deltaY > 0) {
        // If scrolling down and now at bottom, re-enable auto-scroll
        // Use setTimeout to check after scroll completes
        setTimeout(() => {
          if (checkIfUserIsAtBottom()) {
            userScrolledAwayRef.current = false;
          }
        }, 50);
      }
    };

    const handleTouchStart = () => {
      // On touch start, check if we're not at bottom and mark as potentially scrolling
      if (!isScrollingProgrammaticallyRef.current) {
        const atBottom = checkIfUserIsAtBottom();
        if (!atBottom) {
          userScrolledAwayRef.current = true;
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: true });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
    };
  }, []);

  const formatAIResponse = (text: string): string => {
    if (!text) return "";
    const processedText = text.replace(
      /(?<!\n)\n(?!\n|\s*[-#]|\s*\d+\.|\s*\*)/g,
      "\n\n"
    );
    return processedText;
  };

  const handleNewConversation = async (): Promise<void> => {
    setMessages([]);

    const tempConversation = {
      id: generateLocalId(),
      title: "New Conversation",
      created_date: new Date().toISOString(),
      isTemporary: true,
    };
    setActiveConversation(tempConversation);
  };

  const pauseDiscoveryIfNeeded = async (): Promise<boolean> => {
    if (discoveryState.status === "in_progress") {
      await persistDiscoveryState({ ...discoveryState, status: "paused" });
      setShowProgressNotification(true);
      setTimeout(() => {
        setShowProgressNotification(false);
      }, 3000);
      return true;
    }
    return false;
  };

  const handleNewConversationClick = async (): Promise<void> => {
    setShowGodModeOverlay(false);
    await pauseDiscoveryIfNeeded();
    await handleNewConversation();
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const loadMessages = async (
    conversationId: string,
    loadOlder: boolean = false
  ): Promise<void> => {
    if (!isRealUser(currentAppUser) && loadOlder) return;

    setIsLoadingMore(true);
    try {
      const response = await dataService.listMessages(currentAppUser, {
        conversationId: conversationId,
        cursor:
          loadOlder && messages.length > 0 ? messages[0].created_date : null,
        limit: 30,
      });

      const { messages: newMessages, hasMore } = response.data;
      const sortedNewMessages = (newMessages || []).sort(
        (a: Message, b: Message) =>
          new Date(a.created_date).getTime() -
          new Date(b.created_date).getTime()
      );

      const processedMessages: ExtendedMessage[] = sortedNewMessages.map(
        (msg: Message) => ({
          ...msg,
          courseStructure:
            (msg.metadata?.courseStructure as Record<string, unknown>) ||
            undefined,
          couponStructure:
            (msg.metadata?.couponStructure as Record<string, unknown>) ||
            undefined,
          postStructure:
            (msg.metadata?.postStructure as Record<string, unknown>) ||
            undefined,
          serviceStructure:
            (msg.metadata?.serviceStructure as Record<string, unknown>) ||
            undefined,
          workshopStructure:
            (msg.metadata?.workshopStructure as Record<string, unknown>) ||
            undefined,
        })
      );

      if (!loadOlder) {
        setMessages(processedMessages);
      } else {
        const oldScrollHeight = chatContainerRef.current?.scrollHeight || 0;
        setMessages((prev) => [...processedMessages, ...prev]);
        requestAnimationFrame(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
              chatContainerRef.current.scrollHeight - oldScrollHeight;
          }
        });
      }
      setHasMoreMessages(hasMore || false);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const initApp = async () => {
      setAppReady(true);

      if (appUserLoading) {
        return;
      }

      setInitialLoading(true);
      setConversationsLoading(true);

      // Clear messages and active conversation when user state changes, especially from anonymous to real
      // This ensures a clean slate for the newly authenticated user.
      setMessages([]);
      setActiveConversation(null); // Clear active conversation to ensure correct fetching

      try {
        const convResponse = await dataService.listConversations(
          currentAppUser
        );
        const fetchedConversations = convResponse?.data?.conversations || [];

        if (isRealUser(currentAppUser)) {
          const userProfile = currentAppUser?.profile || {};
          setDiscoveryState({
            ...DEFAULT_DISCOVERY_STATE,
            ...userProfile,
            answers: userProfile?.answers || {},
          });
          // if (!knowledgeArticlesCached) {
          //   const articles = (await KnowledgeArticle.list()) || [];
          //   setKnowledgeArticleCache(articles as KnowledgeArticleType[]);
          //   setKnowledgeArticlesCached(true);
          // }
        } else {
          setDiscoveryState({ ...DEFAULT_DISCOVERY_STATE }); // Reset for anonymous
        }

        setConversations(fetchedConversations);
        // If there are no conversations, or if switching to an authenticated user, create a new one.
        // Or if we just authenticated and there are no existing convos for this user.
        if (
          fetchedConversations.length === 0 ||
          (isRealUser(currentAppUser) && !activeConversation)
        ) {
          await handleNewConversation();
        } else if (!activeConversation && fetchedConversations.length > 0) {
          // If no active conversation but some exist, pick the first one
          await handleSelectConversation(fetchedConversations[0]);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setInitialLoading(false);
        setConversationsLoading(false);
        setUserLoading(false);
      }
    };

    initApp();
  }, [currentAppUser, appUserLoading, knowledgeArticlesCached]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (
      !isInputFocused &&
      messages.length === 0 &&
      !isTyping &&
      !message &&
      discoveryState.status !== "in_progress"
    ) {
      placeholderIntervalRef.current = setInterval(() => {
        setCurrentPlaceholder((prev) => {
          const currentIndex = placeholderIdeas.indexOf(prev);
          const nextIndex = (currentIndex + 1) % placeholderIdeas.length;
          return placeholderIdeas[nextIndex];
        });
      }, 3000);
    } else {
      if (placeholderIntervalRef.current) {
        clearInterval(placeholderIntervalRef.current);
      }
    }

    return () => {
      if (placeholderIntervalRef.current) {
        clearInterval(placeholderIntervalRef.current);
      }
    };
  }, [
    isInputFocused,
    messages.length,
    isTyping,
    message,
    discoveryState.status,
  ]);

  const generateConversationTitle = async (
    userText: string,
    aiText: string,
    conversationId: string
  ): Promise<void> => {
    try {
      const newTitle = await GenerateTitle({ userText, aiText });

      if (newTitle && conversationId) {
        await dataService.updateConversation(currentAppUser, {
          conversationId: conversationId,
          updates: { title: newTitle },
        });
        setActiveConversation((prev) =>
          prev?.id === conversationId ? { ...prev, title: newTitle } : prev
        );
        setConversations((prev: Conversation[]) =>
          (Array.isArray(prev) ? prev : []).map((c: Conversation) =>
            c.id === conversationId ? { ...c, title: newTitle } : c
          )
        );
      }
    } catch (error) {
      console.error("Failed to generate conversation title:", error);
    }
  };

  const handleSendMessage = async (
    userMessageOverride: string | null = null
  ): Promise<void> => {
    const content = String(userMessageOverride || message || "");
    if (!content.trim() || !activeConversation || isTyping) return;

    if (!currentAppUser) {
      showConfirmation({
        title: "App Not Ready",
        description:
          "Please wait for the app to initialize before sending messages.",
        variant: "info",
        confirmText: "OK",
        onConfirm: () => {},
      });
      return;
    }

    const userMessageContent = content;

    if (!userMessageOverride) {
      setMessage("");
    }

    // When user sends a message, ensure auto-scroll is enabled
    setIsUserAtBottom(true);
    shouldAutoScrollRef.current = true;
    userScrolledAwayRef.current = false;

    setIsTyping(true);

    const userMessageText = userMessageContent;

    let currentConv = { ...activeConversation };
    let shouldGenerateTitle = false;

    if (currentConv.isTemporary) {
      shouldGenerateTitle = true;
      const createConvResponse = await dataService.createConversation(
        currentAppUser,
        { title: "New Conversation" }
      );
      const newConversationRecord = createConvResponse.data.conversation;

      setConversations((prev: Conversation[]) => [
        newConversationRecord || currentConv,
        ...(Array.isArray(prev) ? prev : []),
      ]);
      setActiveConversation(newConversationRecord || currentConv);
      currentConv = newConversationRecord || currentConv;
    }

    const userMessageForDb: ExtendedMessage = {
      id: generateLocalId(),
      text: userMessageText,
      sender: "user",
      created_date: new Date().toISOString(),
    };

    const createUserMsgResponse = await dataService.createMessage(
      currentAppUser,
      {
        conversationId: currentConv.id,
        content: userMessageText,
        role: "user",
      }
    );
    if (createUserMsgResponse.data.message) {
      userMessageForDb.id = createUserMsgResponse.data.message.id;
    }

    const currentMessages = Array.isArray(messages) ? messages : [];
    setMessages([...currentMessages, userMessageForDb]);

    const tempAiMessageId = `temp-ai-${Date.now()}`;
    const thinkingAiMessage: ExtendedMessage = {
      id: tempAiMessageId,
      sender: "assistant",
      text: "",
      isStreaming: true,
      created_date: new Date().toISOString(),
    };
    setMessages((prev) => {
      const safeMessages = Array.isArray(prev) ? prev : [];
      return [...safeMessages, thinkingAiMessage];
    });

    try {
      const historyForPrompt = [...currentMessages, userMessageForDb];
      const llmPayload = {
        userMessage: userMessageContent,
        conversationHistory: historyForPrompt,
        discoveryAnswers: discoveryState.answers || {},
      };

      // Real-time streaming from backend
      let accumulatedRawText = "";
      let hasStartedDisplaying = false;

      const response = await InvokeLLM({
        ...llmPayload,
        stream: true,
        onChunk: (chunk: string) => {
          // Accumulate raw text for JSON parsing
          accumulatedRawText += chunk;

          // Try to extract ai_response_text from accumulated JSON
          try {
            // Look for ai_response_text in the partial JSON - match everything including incomplete strings
            const match = accumulatedRawText.match(
              /"ai_response_text"\s*:\s*"([^"]*)"/
            );
            if (!match) {
              // Try to match even if closing quote isn't there yet (for actively streaming text)
              const partialMatch = accumulatedRawText.match(
                /"ai_response_text"\s*:\s*"(.*?)(?:"|$)/s
              );
              if (partialMatch && partialMatch[1]) {
                const decodedText = partialMatch[1]
                  .replace(/\\n/g, "\n")
                  .replace(/\\t/g, "\t")
                  .replace(/\\r/g, "\r")
                  .replace(/\\"/g, '"')
                  .replace(/\\\\/g, "\\");

                hasStartedDisplaying = true;
                setMessages((prev) =>
                  (Array.isArray(prev) ? prev : []).map((m) =>
                    m.id === tempAiMessageId
                      ? { ...m, text: decodedText, isStreaming: true }
                      : m
                  )
                );
              }
            } else if (match[1]) {
              // Complete match with closing quote
              const decodedText = match[1]
                .replace(/\\n/g, "\n")
                .replace(/\\t/g, "\t")
                .replace(/\\r/g, "\r")
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, "\\");

              hasStartedDisplaying = true;
              setMessages((prev) =>
                (Array.isArray(prev) ? prev : []).map((m) =>
                  m.id === tempAiMessageId
                    ? { ...m, text: decodedText, isStreaming: true }
                    : m
                )
              );
            }
          } catch (e) {
            // Ignore parsing errors during streaming
            console.debug("Streaming parse error:", e);
          }
        },
      });

      if (response.action === "redirect_to_profile") {
        const redirectMessage =
          response.ai_response_text || "Redirecting to your profile...";
        setMessages((prev) =>
          (Array.isArray(prev) ? prev : []).map((m) =>
            m.id === tempAiMessageId
              ? { ...m, text: redirectMessage, isStreaming: false }
              : m
          )
        );
        setIsTyping(false);
        setTimeout(() => {
          window.location.href = createPageUrl("Profile");
        }, 1500);
        return;
      }

      const aiMessageText =
        response.ai_response_text || "I'm not sure how to respond to that.";
      const courseStructure = response.course_creation_data;
      const couponStructure = response.coupon_creation_data;
      const postStructure = response.post_creation_data;
      const serviceStructure = response.service_creation_data;
      const workshopStructure = response.workshop_creation_data;

      const formattedResponse = formatAIResponse(aiMessageText);

      // Update with final formatted response
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((m) =>
          m.id === tempAiMessageId
            ? { ...m, text: formattedResponse, isStreaming: false }
            : m
        )
      );

      const createAiMsgResponse = await dataService.createMessage(
        currentAppUser,
        {
          conversationId: currentConv.id,
          content: formattedResponse,
          role: "assistant",
          metadata: {
            courseStructure: courseStructure,
            couponStructure: couponStructure,
            postStructure: postStructure,
            serviceStructure: serviceStructure,
            workshopStructure: workshopStructure,
          },
        }
      );
      const finalAiMessage = createAiMsgResponse.data.message;

      const finalMessageObject: ExtendedMessage = {
        ...(finalAiMessage || {
          id: tempAiMessageId,
          text: formattedResponse,
          sender: "assistant",
          created_date: new Date().toISOString(),
        }),
        isStreaming: false,
        courseStructure:
          finalAiMessage?.metadata?.courseStructure || courseStructure,
        couponStructure:
          finalAiMessage?.metadata?.couponStructure || couponStructure,
        postStructure: finalAiMessage?.metadata?.postStructure || postStructure,
        serviceStructure:
          finalAiMessage?.metadata?.serviceStructure || serviceStructure,
        workshopStructure:
          finalAiMessage?.metadata?.workshopStructure || workshopStructure,
      };

      setMessages((prev) => {
        const safeMessages = Array.isArray(prev) ? prev : [];
        return safeMessages.map((m) =>
          m.id === tempAiMessageId ? finalMessageObject : m
        );
      });
      setMessageCache((prev) => {
        const currentCache = Array.isArray(prev[currentConv.id])
          ? prev[currentConv.id]
          : [];
        return {
          ...prev,
          [currentConv.id]: currentCache.map((m) =>
            m.id === tempAiMessageId ? finalMessageObject : m
          ),
        };
      });

      if (shouldGenerateTitle) {
        generateConversationTitle(
          userMessageContent,
          aiMessageText,
          currentConv.id
        );
      }
    } catch (error) {
      console.error("Error calling LLM:", error);
      const errorText = "Sorry, I encountered an error. Please try again.";
      setMessages((prev) => {
        const safeMessages = Array.isArray(prev) ? prev : [];
        return safeMessages.map((m) =>
          m.id === tempAiMessageId
            ? { ...m, text: errorText, isStreaming: false }
            : m
        );
      });
      setMessageCache((prev) => {
        const currentCache = Array.isArray(prev[currentConv.id])
          ? prev[currentConv.id]
          : [];
        return {
          ...prev,
          [currentConv.id]: currentCache.map((m) =>
            m.id === tempAiMessageId
              ? { ...m, text: errorText, isStreaming: false }
              : m
          ),
        };
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleRegenerateMessage = async (
    messageToRegenerate: ExtendedMessage
  ): Promise<void> => {
    if (isTyping || !activeConversation || isRegenerating) return;

    // When regenerating, ensure auto-scroll is enabled
    setIsUserAtBottom(true);
    shouldAutoScrollRef.current = true;
    userScrolledAwayRef.current = false;

    setIsRegenerating(messageToRegenerate);

    try {
      const messageIndex = messages.findIndex(
        (m: ExtendedMessage) => m.id === messageToRegenerate.id
      );
      if (messageIndex === -1) return;

      const conversationHistory = messages.slice(0, messageIndex);

      const lastUserMessage = [...conversationHistory]
        .reverse()
        .find((m: ExtendedMessage) => m.sender === "user");
      if (!lastUserMessage) {
        console.warn(
          "Could not find a preceding user message for regeneration."
        );
        return;
      }

      const llmPayload = {
        userMessage: lastUserMessage.text,
        conversationHistory: conversationHistory,
        discoveryAnswers: discoveryState.answers || {},
      };

      // Real-time streaming for regeneration
      let accumulatedRawText = "";

      const response = await InvokeLLM({
        ...llmPayload,
        stream: true,
        onChunk: (chunk: string) => {
          // Accumulate raw text for JSON parsing
          accumulatedRawText += chunk;

          // Try to extract ai_response_text from accumulated JSON
          try {
            // Look for ai_response_text in the partial JSON - match everything including incomplete strings
            const match = accumulatedRawText.match(
              /"ai_response_text"\s*:\s*"([^"]*)"/
            );
            if (!match) {
              // Try to match even if closing quote isn't there yet (for actively streaming text)
              const partialMatch = accumulatedRawText.match(
                /"ai_response_text"\s*:\s*"(.*?)(?:"|$)/s
              );
              if (partialMatch && partialMatch[1]) {
                const decodedText = partialMatch[1]
                  .replace(/\\n/g, "\n")
                  .replace(/\\t/g, "\t")
                  .replace(/\\r/g, "\r")
                  .replace(/\\"/g, '"')
                  .replace(/\\\\/g, "\\");

                setMessages((prev) =>
                  (Array.isArray(prev) ? prev : []).map((m) =>
                    m.id === messageToRegenerate.id
                      ? { ...m, text: decodedText, isStreaming: true }
                      : m
                  )
                );
              }
            } else if (match[1]) {
              // Complete match with closing quote
              const decodedText = match[1]
                .replace(/\\n/g, "\n")
                .replace(/\\t/g, "\t")
                .replace(/\\r/g, "\r")
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, "\\");

              setMessages((prev) =>
                (Array.isArray(prev) ? prev : []).map((m) =>
                  m.id === messageToRegenerate.id
                    ? { ...m, text: decodedText, isStreaming: true }
                    : m
                )
              );
            }
          } catch (e) {
            // Ignore parsing errors during streaming
            console.debug("Streaming parse error:", e);
          }
        },
      });

      if (response.action === "redirect_to_profile") {
        const redirectMessage =
          response.ai_response_text || "Redirecting to your profile...";
        setMessages((prev) =>
          (Array.isArray(prev) ? prev : []).map((m) =>
            m.id === messageToRegenerate.id
              ? { ...m, text: redirectMessage, isStreaming: false }
              : m
          )
        );
        setTimeout(() => {
          window.location.href = createPageUrl("Profile");
        }, 1500);
        return;
      }

      const aiMessageText =
        response.ai_response_text || "I'm not sure how to respond to that.";
      const courseStructure = response.course_creation_data;
      const couponStructure = response.coupon_creation_data;
      const postStructure = response.post_creation_data;
      const serviceStructure = response.service_creation_data;
      const workshopStructure = response.workshop_creation_data;

      const formattedResponse = formatAIResponse(aiMessageText);

      // Update with final formatted response
      setMessages((prev) => {
        const safeMessages = Array.isArray(prev) ? prev : [];
        return safeMessages.map((msg: ExtendedMessage) =>
          msg.id === messageToRegenerate.id
            ? { ...msg, text: formattedResponse, isStreaming: false }
            : msg
        );
      });

      // Update the message in the database
      console.log("🔄 Updating message in database:", {
        messageId: messageToRegenerate.id,
        updates: { text: formattedResponse },
        conversationId: activeConversation.id,
      });

      try {
        const updateResult = await dataService.updateMessage(currentAppUser, {
          messageId: messageToRegenerate.id,
          updates: {
            text: formattedResponse,
            metadata: {
              courseStructure: courseStructure || null,
              couponStructure: couponStructure || null,
              postStructure: postStructure || null,
              serviceStructure: serviceStructure || null,
              workshopStructure: workshopStructure || null,
            },
          },
          conversationId: activeConversation.id,
        });

        if (updateResult?.data?.message) {
          console.log(
            "✅ Message successfully updated in database:",
            updateResult.data.message
          );
        } else {
          console.warn(
            "⚠️ Message update returned unexpected format:",
            updateResult
          );
        }
      } catch (updateError) {
        console.error("❌ Failed to update message in database:", updateError);
        // Continue anyway - the UI is already updated
      }

      const updatedMessage: ExtendedMessage = {
        ...messageToRegenerate,
        text: formattedResponse,
        courseStructure: courseStructure,
        couponStructure: couponStructure,
        postStructure: postStructure,
        serviceStructure: serviceStructure,
        workshopStructure: workshopStructure,
        isStreaming: false,
      };

      setMessages((prev) => {
        const safeMessages = Array.isArray(prev) ? prev : [];
        return safeMessages.map((msg: ExtendedMessage) =>
          msg.id === messageToRegenerate.id ? updatedMessage : msg
        );
      });

      setMessageCache((prev: ExtendedMessageCache) => {
        const currentCache = Array.isArray(prev[activeConversation.id])
          ? prev[activeConversation.id]
          : [];
        return {
          ...prev,
          [activeConversation.id]: currentCache.map((msg: ExtendedMessage) =>
            msg.id === messageToRegenerate.id ? updatedMessage : msg
          ),
        };
      });
    } catch (error) {
      console.error("Error regenerating message:", error);
      const errorText =
        "Sorry, I encountered an error during regeneration. Please try again.";
      setMessages((prev) => {
        const safeMessages = Array.isArray(prev) ? prev : [];
        return safeMessages.map((m: ExtendedMessage) =>
          m.id === messageToRegenerate.id
            ? { ...m, text: errorText, isStreaming: false }
            : m
        );
      });
      setMessageCache((prev) => {
        const currentCache = Array.isArray(prev[activeConversation.id])
          ? prev[activeConversation.id]
          : [];
        return {
          ...prev,
          [activeConversation.id]: currentCache.map((m: ExtendedMessage) =>
            m.id === messageToRegenerate.id
              ? { ...m, text: errorText, isStreaming: false }
              : m
          ),
        };
      });
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleSelectConversation = async (
    conversation: Conversation
  ): Promise<void> => {
    setShowGodModeOverlay(false);
    await pauseDiscoveryIfNeeded();

    if (isTyping || activeConversation?.id === conversation.id) return;

    setActiveConversation(conversation);
    setMessages([]);
    setMessagesPage(0);
    setHasMoreMessages(true);

    // Reset scroll state when switching conversations
    setIsUserAtBottom(true);
    shouldAutoScrollRef.current = true;
    userScrolledAwayRef.current = false;

    setDiscoveryState((prev: DiscoveryState) => ({
      ...prev,
      status: "not_started",
      answers: prev.answers || {},
    }));

    await loadMessages(conversation.id, false);
  };

  const handleDeleteConversation = async (
    conversationId: string
  ): Promise<void> => {
    showConfirmation({
      title: "Delete Conversation",
      description:
        "Are you sure you want to delete this conversation and all its messages? This action cannot be undone.",
      variant: "destructive",
      confirmText: "Delete",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await dataService.deleteConversation(currentAppUser, {
            conversationId,
          });

          const newCache = { ...messageCache };
          delete newCache[conversationId];
          setMessageCache(newCache);

          const remainingConversations = conversations.filter(
            (c: Conversation) => c.id !== conversationId
          );
          setConversations(remainingConversations);

          if (activeConversation?.id === conversationId) {
            if (remainingConversations.length > 0) {
              await handleSelectConversation(remainingConversations[0]);
            } else {
              await handleNewConversation();
            }
          }

          // Show success toast with auto-dismiss
          showAutoDismissToast({
            title: "Conversation Deleted",
            description: "The conversation has been successfully deleted.",
            variant: "success",
          }, 3000);
        } catch (error) {
          console.error("Failed to delete conversation:", error);
          showConfirmation({
            title: "Delete Failed",
            description: "Failed to delete conversation. Please try again.",
            variant: "warning",
            confirmText: "OK",
            onConfirm: () => {},
          });
        }
      },
    });
  };

  const handleStartRename = (conversation: Conversation) => {
    setRenamingConversation(conversation);
    setNewTitle(conversation.title || "");
  };

  const handleCancelRename = () => {
    setRenamingConversation(null);
    setNewTitle("");
  };

  const handleConfirmRename = async () => {
    if (!renamingConversation || !newTitle.trim()) return;

    const { id } = renamingConversation;
    const trimmedTitle = newTitle.trim();

    try {
      await dataService.updateConversation(currentAppUser, {
        conversationId: id,
        updates: { title: trimmedTitle },
      });

      const updatedConversations = Array.isArray(conversations)
        ? conversations.map((c: Conversation) =>
            c.id === id ? { ...c, title: trimmedTitle } : c
          )
        : [];
      setConversations(updatedConversations);

      if (activeConversation?.id === id) {
        setActiveConversation((prev: Conversation | null) =>
          prev
            ? {
                ...prev,
                title: trimmedTitle,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to rename conversation:", error);
      showConfirmation({
        title: "Rename Failed",
        description: "Failed to rename conversation. Please try again.",
        variant: "warning",
        confirmText: "OK",
        onConfirm: () => {},
      });
    } finally {
      handleCancelRename();
    }
  };

  const handleGodModeClick = async () => {
    await pauseDiscoveryIfNeeded();
    setShowGodModeOverlay(true);
  };

  const persistDiscoveryState = async (
    newState: DiscoveryState
  ): Promise<void> => {
    const stateWithAnswers = {
      ...newState,
      answers: newState.answers || {},
    };
    setDiscoveryState(stateWithAnswers);

    if (isRealUser(currentAppUser)) {
      await dataService.updateProfile(currentAppUser, stateWithAnswers);
    }
  };

  const generatePhaseInsights = async (
    phaseKey: string,
    answers: Record<string, string | string[]>
  ): Promise<PhaseInsights | null> => {
    const phaseData = DISCOVERY_PHASES.find(
      (p: DiscoveryPhaseOptions) => p.key === phaseKey
    );
    if (!phaseData) return null;

    const phaseQuestions = Array.isArray(phaseData.questions)
      ? phaseData.questions
      : [];
    const filteredAnswers = Object.fromEntries(
      Object.entries(answers || {}).filter(([key]) =>
        phaseQuestions.some((q: DiscoveryQuestion) => q.key === key)
      )
    );

    const phaseAnswers = Object.entries(filteredAnswers)
      .map(([key, value]) => {
        const question = phaseQuestions.find(
          (q: DiscoveryQuestion) => q.key === key
        );
        return question
          ? `${question.question}: ${
              Array.isArray(value) ? value.join(", ") : value
            }`
          : "";
      })
      .filter(Boolean)
      .join("\n");

    const insightPrompt = `Based on the following discovery answers from ${phaseData.title}, provide strategic insights in the exact JSON format specified:

${phaseAnswers}

Respond with ONLY a JSON object in this exact format:
{
    "key_discovery": "Main insight about their personality/business/goals (1-2 sentences)",
    "coaching_recommendation": "Specific advice based on their responses (1-2 sentences)",
    "next_steps": "Immediate actions they can take (1-2 sentences)",
    "growth_opportunity": "Area for development identified (1-2 sentences)"
}`;

    try {
      const response = await GeneratePhaseInsights({ phaseAnswers });
      return response;
    } catch (error) {
      console.error("Error generating phase insights:", error);
      return null;
    }
  };

  const generateProfileSynthesis = async (
    answers: Record<string, string | string[]>
  ): Promise<ProfileSynthesis | null> => {
    const answeredQuestions = Object.entries(answers || {})
      .map(
        ([key, value]) =>
          `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
      )
      .join("\n");


    try {
      const response = await GenerateProfileSynthesis({ answers });
      return response;
    } catch (error) {
      console.error("Error generating profile synthesis:", error);
      return null;
    }
  };

  const startOrResumeDiscovery = () => {
    setShowGodModeOverlay(false);

    // Enable auto-scroll for discovery mode
    setIsUserAtBottom(true);
    shouldAutoScrollRef.current = true;
    userScrolledAwayRef.current = false;

    const totalQuestions = DISCOVERY_PHASES.reduce(
      (acc, phase) =>
        acc + (Array.isArray(phase.questions) ? phase.questions.length : 0),
      0
    );
    const answersCount = Object.keys(discoveryState.answers || {}).length;
    const completionPercentage = Math.round(
      (answersCount / totalQuestions) * 100
    );

    const welcomeMessageText =
      discoveryState.status === "paused"
        ? `Welcome back to Discovery Mode! You've completed ${completionPercentage}% of your discovery journey. Let's pick up where we left off!`
        : `🎯 **Welcome to Discovery Mode!**

I've designed a comprehensive discovery process covering 7 key areas:
✨ Your niche and expertise
✨ Your personality and motivations
✨✨ Your fears and challenges
✨ Your goals and vision
✨ Your strengths and superpowers
✨ Your growth areas
✨ Your business context

This takes about 15-20 minutes, but you can pause anytime and resume later. Plus, I'll provide valuable insights along the way!

Ready to unlock your unique coaching blueprint?`;

    const welcomeMessage: ExtendedMessage = {
      id: `discovery-welcome-${Date.now()}`,
      sender: "assistant",
      text: welcomeMessageText,
      created_date: new Date().toISOString(),
    };
    setMessages((prev) => {
      const safeMessages = Array.isArray(prev) ? prev : [];
      return [...safeMessages, welcomeMessage];
    });

    persistDiscoveryState({ ...discoveryState, status: "in_progress" });
  };

  const handleDiscoveryAnswer = async (
    questionKey: string,
    answer: string | string[]
  ): Promise<void> => {
    const { currentPhaseIndex, currentQuestionIndexInPhase, answers } =
      discoveryState;

    // Enable auto-scroll for discovery answers
    setIsUserAtBottom(true);
    shouldAutoScrollRef.current = true;
    userScrolledAwayRef.current = false;

    const displayAnswer = Array.isArray(answer) ? answer.join(", ") : answer;
    const userAnswerMessage: ExtendedMessage = {
      id: `discovery-ans-${Date.now()}`,
      sender: "user",
      text: displayAnswer,
      created_date: new Date().toISOString(),
    };
    setMessages((prev) => {
      const safeMessages = Array.isArray(prev) ? prev : [];
      return [...safeMessages, userAnswerMessage];
    });

    const newAnswers = { ...(answers || {}), [questionKey]: answer };
    let nextPhaseIndex = currentPhaseIndex;
    let nextQuestionIndex = currentQuestionIndexInPhase + 1;
    let newStatus = "in_progress";

    const currentPhase = DISCOVERY_PHASES[currentPhaseIndex];

    if (
      nextQuestionIndex >=
      (Array.isArray(currentPhase.questions)
        ? currentPhase.questions.length
        : 0)
    ) {
      setCompletedPhaseTitle(currentPhase.title);
      setShowPhaseCompletion(true);

      nextPhaseIndex++;
      nextQuestionIndex = 0;
    }

    if (nextPhaseIndex >= DISCOVERY_PHASES.length) {
      newStatus = "completed";
    }

    const totalQuestions = DISCOVERY_PHASES.reduce(
      (acc, phase) =>
        acc + (Array.isArray(phase.questions) ? phase.questions.length : 0),
      0
    );
    const answersCount = Object.keys(newAnswers).length;
    const completionPercentage = Math.round(
      (answersCount / totalQuestions) * 100
    );

    const oldAnswersCount = answers ? Object.keys(answers).length : 0;
    if (
      completionPercentage >= 50 &&
      completionPercentage < 55 &&
      oldAnswersCount < Object.keys(newAnswers).length &&
      nextPhaseIndex < DISCOVERY_PHASES.length
    ) {
      setTimeout(async () => {
        const profileSynthesis = await generateProfileSynthesis(newAnswers);

        if (profileSynthesis) {
          const midpointMessage: ExtendedMessage = {
            id: `discovery-midpoint-${Date.now()}`,
            sender: "assistant",
            text: `🌟 **Your Emerging Coaching Profile (50% Complete):**

🎯 **Key Discovery:** ${profileSynthesis.niche_clarity}
👤 **Personality Type:** ${profileSynthesis.niche_clarity}
💪 **Core Motivation:** ${profileSynthesis.core_motivation}
⭐ **Primary Strength:** ${profileSynthesis.primary_strength}
🏢 **Business Stage:** ${profileSynthesis.business_stage}

Ready to dive deeper? The remaining discovery will reveal your complete success blueprint!`,
            created_date: new Date().toISOString(),
          };
          setMessages((prev) => {
            const safeMessages = Array.isArray(prev) ? prev : [];
            return [...safeMessages, midpointMessage];
          });
        }
      }, 1000);
    }

    persistDiscoveryState({
      ...discoveryState,
      status: newStatus as DiscoveryState["status"],
      currentPhaseIndex: nextPhaseIndex,
      currentQuestionIndexInPhase: nextQuestionIndex,
      answers: newAnswers,
    });
  };

  const handlePhaseCompletionFinish = async () => {
    setShowPhaseCompletion(false);

    const completedPhaseIndex = discoveryState.currentPhaseIndex - 1;
    const completedPhase =
      Array.isArray(DISCOVERY_PHASES) &&
      completedPhaseIndex >= 0 &&
      completedPhaseIndex < DISCOVERY_PHASES.length
        ? DISCOVERY_PHASES[completedPhaseIndex]
        : null;

    if (completedPhase) {
      const phaseInsights = await generatePhaseInsights(
        completedPhase.key,
        discoveryState.answers || {}
      );

      if (phaseInsights) {
        const answersCount = discoveryState.answers
          ? Object.keys(discoveryState.answers).length
          : 0;
        const totalQuestions = DISCOVERY_PHASES.reduce(
          (acc, phase) =>
            acc + (Array.isArray(phase.questions) ? phase.questions.length : 0),
          0
        );
        const progressPercentage = Math.round(
          (answersCount / totalQuestions) * 100
        );

        const insightMessage: ExtendedMessage = {
          id: `discovery-phase-insights-${Date.now()}`,
          sender: "assistant",
          text: `✨ **${completedPhase.title} Complete!**

🎯 **Key Discovery:** ${phaseInsights.key_discovery}

💡 **Coaching Recommendation:** ${phaseInsights.coaching_recommendation}

🚀 **Next Steps:** ${phaseInsights.next_steps}

📈 **Growth Opportunity:** ${phaseInsights.growth_opportunity}

**Progress Update:** ${progressPercentage}% complete!`,
          created_date: new Date().toISOString(),
        };
        setMessages((prev) => {
          const safeMessages = Array.isArray(prev) ? prev : [];
          return [...safeMessages, insightMessage];
        });
      }
    }

    if (discoveryState.currentPhaseIndex >= DISCOVERY_PHASES.length) {
      const profileSynthesis = await generateProfileSynthesis(
        discoveryState.answers || {}
      );

      if (profileSynthesis) {
        const synthesisMessage: ExtendedMessage = {
          id: `discovery-synthesis-${Date.now()}`,
          sender: "assistant",
          text: `🚀 **Discovery Complete! Your Coaching Profile:**

**🎯 Niche Clarity:** ${profileSynthesis.niche_clarity}

**👤 Personality Type:** ${profileSynthesis.personality_type}

**💪 Core Motivation:** ${profileSynthesis.core_motivation}

**⭐ Primary Strength:** ${profileSynthesis.primary_strength}

**📈 Growth Edge:** ${profileSynthesis.growth_edge}

**🏢 Business Stage:** ${profileSynthesis.business_stage}

I now have your complete coaching blueprint and will use it to provide deeply personalized guidance for your journey. What would you like to work on first?`,
          created_date: new Date().toISOString(),
        };
        setMessages((prev) => {
          const safeMessages = Array.isArray(prev) ? prev : [];
          return [...safeMessages, synthesisMessage];
        });

        const redirectMessage: ExtendedMessage = {
          id: `discovery-redirect-${Date.now()}`,
          sender: "assistant",
          text: "I'm taking you to your full Coaching Profile now so you can review everything...",
          created_date: new Date().toISOString(),
        };
        setMessages((prev) => {
          const safeMessages = Array.isArray(prev) ? prev : [];
          return [...safeMessages, redirectMessage];
        });

        setTimeout(() => {
          window.location.href = createPageUrl("Profile");
        }, 3000);
      } else {
        const fallbackMessage: ExtendedMessage = {
          id: `discovery-complete-${Date.now()}`,
          sender: "assistant",
          text: "🚀 **Discovery Complete!** Thank you for sharing so much valuable information. I now have your complete coaching profile and will use it to provide deeply personalized guidance. What would you like to work on first?",
          created_date: new Date().toISOString(),
        };
        setMessages((prev) => {
          const safeMessages = Array.isArray(prev) ? prev : [];
          return [...safeMessages, fallbackMessage];
        });
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const currentScrollTop = target.scrollTop;

    // Check if user is at the bottom
    const atBottom = checkIfUserIsAtBottom();
    setIsUserAtBottom(atBottom);

    // Detect scroll direction and user intent
    if (!isScrollingProgrammaticallyRef.current) {
      const scrollingUp = currentScrollTop < lastScrollTopRef.current;

      if (scrollingUp && !atBottom) {
        // User is actively scrolling up - STOP auto-scroll immediately
        userScrolledAwayRef.current = true;
      } else if (atBottom) {
        // User has scrolled back to the bottom - resume auto-scroll
        userScrolledAwayRef.current = false;
      }

      lastScrollTopRef.current = currentScrollTop;
    }

    // Load older messages if scrolled to top
    if (
      target.scrollTop === 0 &&
      hasMoreMessages &&
      !isLoadingMore &&
      activeConversation &&
      isRealUser(currentAppUser)
    ) {
      loadMessages(activeConversation.id, true);
    }
  };

  const handleKeyPress: KeyPressHandler = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  if (!appReady || appUserLoading || conversationsLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border border-[var(--border-subtle)] border-t-[var(--accent-orange)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex h-screen overflow-hidden">
      <AnimatePresence>
        {showProgressNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-[var(--bg-tertiary)] backdrop-blur-sm border border-[var(--border-primary)] rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-[var(--text-primary)] text-sm">
              Progress Saved!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <PhaseCompletionCelebration
        isVisible={showPhaseCompletion}
        onComplete={handlePhaseCompletionFinish}
        phaseTitle={completedPhaseTitle}
      />

      <ConversationSidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversationClick}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        user={currentAppUser}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleStartRename}
        discoveryState={discoveryState}
        startOrResumeDiscovery={startOrResumeDiscovery}
        onGodModeClick={handleGodModeClick}
        conversationsLoading={conversationsLoading}
      />

      {renamingConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-tertiary)] border-[var(--border-primary)] rounded-lg p-6 max-w-md w-full mx-4">
            <div>
              <h2 className="text-[var(--text-primary)] text-lg font-semibold mb-4">
                Rename Conversation
              </h2>
            </div>
            <div className="py-4">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Enter new conversation title"
                onKeyPress={(e) => e.key === "Enter" && handleConfirmRename()}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--text-muted)] text-[var(--text-primary)] rounded-md px-3 py-2 focus:border-[var(--accent-orange)] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={handleCancelRename}
                className="bg-[var(--bg-secondary)] border border-[var(--text-muted)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--text-secondary)] rounded-md px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRename}
                className="bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white rounded-md px-4 py-2"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col h-full relative overflow-hidden`}>
        <AnimatePresence>
          {discoveryState.status === "in_progress" && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="bg-[var(--accent-orange)] text-white px-4 py-2 text-center text-sm font-medium relative z-40"
            >
              <div className="flex items-center justify-center gap-2">
                <Wand2 className="w-4 h-4" />
                <span>Discovery Mode Active - Building Your Profile</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showGodModeOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="text-center bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-lg p-8 max-w-md mx-4"
            >
              <div className="mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-[var(--accent-orange)] rounded-lg flex items-center justify-center mx-auto mb-4"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  God Mode
                </h2>
                <motion.p
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[var(--accent-orange)] mb-4 font-medium"
                >
                  Coming Soon!
                </motion.p>
                <p className="text-[var(--text-secondary)] max-w-sm mx-auto leading-relaxed">
                  We're working on something incredible. God Mode will unlock
                  advanced AI capabilities beyond your imagination.
                </p>
              </div>
              <motion.button
                onClick={handleNewConversationClick}
                className="bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] text-white rounded-md px-6 py-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        <div
          className={`h-full relative ${
            messages.length === 0
              ? "flex flex-col items-center justify-center"
              : "flex flex-col"
          }`}
        >
          {messages.length > 0 ? (
            <div
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto group"
            >
              <div className="max-w-4xl mx-auto p-6">
                {isLoadingMore && (
                  <div className="flex justify-center py-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="animate-spin rounded-full h-6 w-6 border border-[var(--border-secondary)] border-t-[var(--accent-orange)]"
                    ></motion.div>
                  </div>
                )}
                {(Array.isArray(messages) ? messages : []).map(
                  (msg: ExtendedMessage) => (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      thinkingMessage={thinkingPhrases[0]}
                      onRegenerate={handleRegenerateMessage}
                      isRegenerating={isRegenerating?.id === msg.id}
                    />
                  )
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <PremiumLogo size="large" className="mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  Hey there! How can I help you today?
                </h1>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                  I'm your AI co-founder, ready to help you build and grow your
                  coaching business.
                </p>
              </motion.div>
            </div>
          )}

          <AnimatePresence>
            {discoveryState.status === "in_progress" &&
              discoveryState.currentPhaseIndex < DISCOVERY_PHASES.length && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="w-full max-w-4xl mb-6 mx-auto px-6"
                >
                  <div className="bg-[var(--bg-secondary)] backdrop-blur-sm border border-[var(--border-primary)] rounded-lg p-6 overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1">
                        <DiscoveryProgressTracker
                          phases={DISCOVERY_PHASES}
                          answers={discoveryState.answers}
                          currentPhaseIndex={discoveryState.currentPhaseIndex}
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
                              {
                                DISCOVERY_PHASES[
                                  discoveryState.currentPhaseIndex
                                ].title
                              }
                            </h3>
                            <div className="w-12 h-1 bg-[var(--accent-orange)] rounded-full"></div>
                          </div>
                          <Button
                            onClick={handleNewConversationClick}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md px-2 py-1 text-sm flex items-center"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Pause & Exit
                          </Button>
                        </div>

                        <h4 className="text-[var(--text-primary)] mb-4 leading-relaxed">
                          {
                            DISCOVERY_PHASES[discoveryState.currentPhaseIndex]
                              .questions[
                              discoveryState.currentQuestionIndexInPhase
                            ].question
                          }
                        </h4>

                        <DiscoveryQuestionOptions
                          question={
                            DISCOVERY_PHASES[discoveryState.currentPhaseIndex]
                              .questions[
                              discoveryState.currentQuestionIndexInPhase
                            ]
                          }
                          onAnswer={handleDiscoveryAnswer}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className={`w-full px-6 pb-6 ${
              messages.length === 0 ? "flex-shrink-0" : ""
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="bg-[var(--bg-secondary)] backdrop-blur-sm rounded-3xl px-2 py-2 flex items-end gap-2 shadow-lg relative overflow-hidden"
                initial={{
                  boxShadow:
                    "0 0 20px 2px rgba(251, 146, 60, 0.08), 0 0 40px 4px rgba(147, 51, 234, 0.04)",
                  borderWidth: "1px",
                  borderColor: "var(--border-subtle)",
                }}
                animate={{
                  boxShadow: isInputFocused
                    ? "0 0 0 0 rgba(251, 146, 60, 0), 0 0 0 0 rgba(147, 51, 234, 0)"
                    : [
                        "0 0 15px 2px rgba(251, 146, 60, 0.06), 0 0 30px 4px rgba(147, 51, 234, 0.03)",
                        "0 0 25px 3px rgba(251, 146, 60, 0.10), 0 0 50px 6px rgba(147, 51, 234, 0.05)",
                      ],
                  borderColor: isInputFocused
                    ? "var(--accent-orange)"
                    : "var(--border-subtle)",
                }}
                transition={{
                  duration: isInputFocused ? 0.3 : 1.8,
                  ease: isInputFocused ? "easeOut" : "easeInOut",
                  repeat: isInputFocused ? 0 : Infinity,
                  repeatType: "reverse",
                }}
                style={{ borderStyle: "solid" }}
              >
                <motion.div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  initial={{
                    opacity: 0.8,
                    background:
                      "linear-gradient(45deg, rgba(251, 146, 60, 0.02) 0%, rgba(147, 51, 234, 0.01) 100%)",
                  }}
                  animate={{
                    opacity: isInputFocused ? 0 : [0.6, 1],
                    background: isInputFocused
                      ? "linear-gradient(45deg, rgba(251, 146, 60, 0) 0%, rgba(147, 51, 234, 0) 100%)"
                      : [
                          "linear-gradient(45deg, rgba(251, 146, 60, 0.015) 0%, rgba(147, 51, 234, 0.008) 100%)",
                          "linear-gradient(45deg, rgba(251, 146, 60, 0.03) 0%, rgba(147, 51, 234, 0.015) 100%)",
                        ],
                  }}
                  transition={{
                    duration: isInputFocused ? 0.3 : 1.8,
                    ease: isInputFocused ? "easeOut" : "easeInOut",
                    repeat: isInputFocused ? 0 : Infinity,
                    repeatType: "reverse",
                  }}
                />

                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setMessage(e.target.value)
                  }
                  onKeyPress={handleKeyPress}
                  onBlur={() => setIsInputFocused(false)}
                  onFocus={() => setIsInputFocused(true)}
                  placeholder={
                    discoveryState.status === "in_progress"
                      ? "Answer above or chat freely..."
                      : messages.length === 0
                      ? currentPlaceholder
                      : "Ask me anything..."
                  }
                  className="flex-1 min-h-[24px] max-h-[120px] resize-none bg-transparent border-0 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none px-3 py-2 text-base leading-relaxed"
                  rows={1}
                  disabled={isTyping || !currentAppUser}
                />

                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isTyping || !message.trim() || !currentAppUser}
                  className="bg-[var(--accent-orange)] hover:bg-[var(--accent-orange-hover)] disabled:opacity-50 disabled:hover:bg-[var(--accent-orange)] text-white h-10 w-10 p-0 rounded-full flex-shrink-0 flex items-center justify-center"
                >
                  <AnimatePresence mode="wait">
                    {isTyping ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        >
                          <Loader2 className="w-5 h-5" />
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="arrow"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        <ArrowUp className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
