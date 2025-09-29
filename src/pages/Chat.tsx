import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2, X, Wand2, CheckCircle2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Message,
  Conversation,
  DiscoveryState,
  MessageCache,
  KnowledgeArticle as KnowledgeArticleType,
  KeyPressHandler,
} from "@/types/chat";
import {
  InvokeLLM,
  GenerateTitle,
  GeneratePhaseInsights,
  GenerateProfileSynthesis,
} from "@/api/openai";

import { KnowledgeArticle } from "@/api/entities";
import ConversationSidebar from "../components/conversations/ConversationSidebar";
import DiscoveryProgressTracker from "../components/chat/DiscoveryProgressTracker";
import { createPageUrl } from "@/utils";
import PhaseCompletionCelebration from "../components/chat/PhaseCompletionCelebration";
import MessageBubble from "../components/chat/MessageBubble";
import SkeletonLoader from "../components/chat/SkeletonLoader";
import PremiumLogo from "../components/PremiumLogo";
import { useAppUser } from "../components/AppUserContext";
import * as dataService from "@/components/services/dataService";
import { Button } from "@/components/ui/button";

const placeholderIdeas = [
  "How to sell courses better?",
  "Write content for my marketing emails",
  "Build a 6-week coaching program outline",
  "Create a sales funnel strategy",
  "Design engaging workshop content",
  "Develop client onboarding process",
  "Price my coaching services effectively",
  "Build authority in my niche",
  "Create compelling course descriptions",
  "Grow my email subscriber list",
];

const thinkingPhrases = [
  "Thinking...",
  "Formulating insights...",
  "Consulting my knowledge base...",
  "Drafting actionable steps...",
  "Putting together a strategy...",
  "Analyzing the best approach...",
];

const MESSAGE_PAGE_SIZE = 30;

export const DISCOVERY_PHASES = [
  {
    key: "niche_expertise",
    title: "Phase 1: Niche & Expertise",
    questions: [
      {
        key: "primary_niche",
        question: "What's your primary niche or area of expertise?",
        options: [
          "Wellness & Health",
          "Business & Marketing",
          "Tech & Software",
          "Creative Arts",
          "Personal Development",
          "Finance & Investment",
          "Education & Training",
          "Other",
        ],
        multiSelect: false,
      },
      {
        key: "expertise_level",
        question:
          "How would you describe your level of expertise in this niche?",
        options: [
          "I'm still learning and building knowledge",
          "I have solid foundational knowledge",
          "I'm experienced with proven results",
          "I'm a recognized expert/authority",
        ],
        multiSelect: false,
      },
      {
        key: "course_experience",
        question:
          "What's your experience with creating and selling online courses?",
        options: [
          "Complete beginner - never created a course",
          "I've started but haven't finished/launched",
          "I've launched 1-2 courses with mixed results",
          "I've successfully launched multiple courses",
        ],
        multiSelect: false,
      },
      {
        key: "target_audience",
        question: "Who do you primarily want to help with your courses?",
        options: [
          "Complete beginners in my field",
          "People with some experience wanting to advance",
          "Professionals seeking specialized skills",
          "Mixed audience at different levels",
        ],
        multiSelect: true,
      },
      {
        key: "unique_advantage",
        question:
          "What makes your approach or perspective unique? (Select all that apply)",
        options: [
          "Personal transformation story",
          "Unique methodology or system",
          "Extensive professional experience",
          "Cultural or regional insights",
          "Combination of multiple disciplines",
        ],
        multiSelect: true,
      },
      {
        key: "content_strength",
        question:
          "What type of content do you create most naturally? (Select all that apply)",
        options: [
          "Written content (blogs, guides, books)",
          "Video content (tutorials, presentations)",
          "Interactive content (workshops, live sessions)",
          "Audio content (podcasts, voice training)",
        ],
        multiSelect: true,
      },
      {
        key: "teaching_style",
        question: "How do you prefer to teach or share knowledge?",
        options: [
          "Step-by-step structured approach",
          "Story-driven with examples",
          "Interactive and hands-on",
          "Theory-based with deep explanations",
        ],
        multiSelect: false,
      },
      {
        key: "market_position",
        question: "How do you want to position yourself in the market?",
        options: [
          "Premium expert with high-value courses",
          "Accessible educator for everyone",
          "Specialized consultant for specific needs",
          "Community builder and mentor",
        ],
        multiSelect: false,
      },
    ],
  },
  {
    key: "personality_motivation",
    title: "Phase 2: Personality & Motivation",
    questions: [
      {
        key: "work_style",
        question: "What's your preferred working style?",
        options: [
          "Fast-paced, let's move quickly",
          "Steady and consistent progress",
          "Thorough and detailed approach",
          "Flexible, adapting as needed",
        ],
        multiSelect: false,
      },
      {
        key: "core_motivation",
        question:
          "What drives you most to create courses? (Select all that apply)",
        options: [
          "Financial freedom and income",
          "Making a meaningful impact",
          "Building authority and recognition",
          "Personal fulfillment and growth",
        ],
        multiSelect: true,
      },
      {
        key: "success_priority",
        question: "What's most important to you right now?",
        options: [
          "Launch quickly to start earning",
          "Create the highest quality possible",
          "Build a sustainable long-term business",
          "Test and validate my ideas first",
        ],
        multiSelect: false,
      },
      {
        key: "energy_source",
        question:
          "What energizes you most about teaching? (Select all that apply)",
        options: [
          "Seeing student transformations",
          "Sharing my knowledge and expertise",
          "Building community and connections",
          "Creating innovative learning experiences",
        ],
        multiSelect: true,
      },
      {
        key: "comfort_zone",
        question: "How do you feel about stepping outside your comfort zone?",
        options: [
          "I love challenges and new experiences",
          "I'm willing but prefer gradual steps",
          "I need encouragement and support",
          "I prefer staying with what I know works",
        ],
        multiSelect: false,
      },
      {
        key: "feedback_style",
        question: "How do you prefer to receive feedback and criticism?",
        options: [
          "Direct and honest, don't sugarcoat",
          "Constructive with specific suggestions",
          "Supportive and encouraging first",
          "In private, one-on-one settings",
        ],
        multiSelect: false,
      },
      {
        key: "collaboration_preference",
        question:
          "How do you prefer to work on projects? (Select all that apply)",
        options: [
          "Independently, I work best alone",
          "Small team with close collaboration",
          "Large team with defined roles",
          "Mix of solo work and team input",
        ],
        multiSelect: true,
      },
      {
        key: "decision_making",
        question: "How do you typically make important decisions?",
        options: [
          "Quick and intuitive, trust my gut",
          "Research thoroughly then decide",
          "Seek input from others first",
          "Test small then scale up",
        ],
        multiSelect: false,
      },
    ],
  },
  {
    key: "fears_beliefs",
    title: "Phase 3: Fears & Limiting Beliefs",
    questions: [
      {
        key: "biggest_fear",
        question: "What's your biggest fear about creating an online course?",
        options: [
          "No one will buy it",
          "I'm not expert enough",
          "It won't be as good as competitors",
          "I'll fail and waste time/money",
        ],
        multiSelect: false,
      },
      {
        key: "imposter_syndrome",
        question: "How often do you feel like you're not qualified enough?",
        options: [
          "Rarely, I'm confident in my abilities",
          "Sometimes, but I push through",
          "Often, it holds me back",
          "Constantly, it's a major struggle",
        ],
        multiSelect: false,
      },
      {
        key: "comparison_trap",
        question: "How much do you compare yourself to others in your field?",
        options: [
          "I rarely compare, I focus on my journey",
          "Occasionally for inspiration",
          "Frequently, it motivates me",
          "Constantly, and it's discouraging",
        ],
        multiSelect: false,
      },
      {
        key: "perfectionism",
        question: "How does perfectionism affect your work?",
        options: [
          "I'm not a perfectionist at all",
          "It helps me maintain quality",
          "It sometimes delays my progress",
          "It paralyzes me from taking action",
        ],
        multiSelect: false,
      },
      {
        key: "failure_mindset",
        question: "How do you view failure and setbacks?",
        options: [
          "Essential learning experiences",
          "Temporary obstacles to overcome",
          "Disappointing but manageable",
          "Proof that I'm not cut out for this",
        ],
        multiSelect: false,
      },
      {
        key: "visibility_comfort",
        question: "How comfortable are you with being visible online?",
        options: [
          "Very comfortable, I enjoy the spotlight",
          "Comfortable enough to do what's needed",
          "Somewhat uncomfortable but willing",
          "Very uncomfortable, I prefer staying hidden",
        ],
        multiSelect: false,
      },
    ],
  },
  {
    key: "goals_vision",
    title: "Phase 4: Goals & Vision",
    questions: [
      {
        key: "income_goal",
        question:
          "What's your income goal from online courses in the next 12 months?",
        options: [
          "₹50,000 - ₹2,00,000 (side income)",
          "₹2,00,000 - ₹10,00,000 (part-time business)",
          "₹10,00,000 - ₹50,00,000 (main income)",
          "₹50,00,000+ (scaling to empire)",
        ],
        multiSelect: false,
      },
      {
        key: "timeline_expectation",
        question: "When do you want to launch your first successful course?",
        options: [
          "Within 1-2 months",
          "Within 3-6 months",
          "Within 6-12 months",
          "I'm in no rush, when it's ready",
        ],
        multiSelect: false,
      },
      {
        key: "business_scale",
        question: "How big do you want your course business to become?",
        options: [
          "Solo business, just me",
          "Small team (2-5 people)",
          "Medium business (10-20 team)",
          "Large company with multiple products",
        ],
        multiSelect: false,
      },
      {
        key: "impact_goal",
        question: "How many students do you want to impact in your first year?",
        options: [
          "100-500 students",
          "500-2,000 students",
          "2,000-10,000 students",
          "10,000+ students",
        ],
        multiSelect: false,
      },
      {
        key: "legacy_vision",
        question:
          "What legacy do you want to create through your courses? (Select all that apply)",
        options: [
          "Help people transform their lives",
          "Become a recognized thought leader",
          "Build a movement or community",
          "Create generational wealth",
        ],
        multiSelect: true,
      },
      {
        key: "lifestyle_goal",
        question:
          "What lifestyle do you want your course business to enable? (Select all that apply)",
        options: [
          "Flexibility to work from anywhere",
          "Financial security and stability",
          "More time with family/personal life",
          "Adventure and travel opportunities",
        ],
        multiSelect: true,
      },
      {
        key: "growth_ambition",
        question:
          "Beyond courses, what other business opportunities interest you? (Select all that apply)",
        options: [
          "Coaching and consulting",
          "Live workshops and events",
          "Books and speaking engagements",
          "Building a larger education platform",
        ],
        multiSelect: true,
      },
      {
        key: "success_definition",
        question:
          "How will you know when you've 'made it' as a course creator? (Select all that apply)",
        options: [
          "Consistent monthly income",
          "Recognition as an expert",
          "Positive student transformations",
          "Freedom to choose my projects",
        ],
        multiSelect: true,
      },
    ],
  },
  {
    key: "strengths_superpowers",
    title: "Phase 5: Strengths & Superpowers",
    questions: [
      {
        key: "natural_talent",
        question:
          "What do people consistently compliment you on? (Select all that apply)",
        options: [
          "Explaining complex things simply",
          "Being encouraging and supportive",
          "Creative problem-solving",
          "Organizing and structuring information",
        ],
        multiSelect: true,
      },
      {
        key: "energy_multiplier",
        question:
          "What activity makes you lose track of time because you enjoy it so much?",
        options: [
          "Teaching and explaining concepts",
          "Creating content and materials",
          "Connecting with people",
          "Researching and learning new things",
        ],
        multiSelect: false,
      },
      {
        key: "unique_perspective",
        question:
          "What unique perspective or experience do you bring? (Select all that apply)",
        options: [
          "Overcoming significant challenges",
          "Cross-cultural or diverse background",
          "Interdisciplinary knowledge",
          "Unconventional path to success",
        ],
        multiSelect: true,
      },
      {
        key: "communication_strength",
        question: "What's your strongest communication style?",
        options: [
          "Clear and logical explanations",
          "Inspiring and motivational",
          "Practical and actionable",
          "Entertaining and engaging",
        ],
        multiSelect: false,
      },
      {
        key: "problem_solving",
        question: "How do you typically approach solving problems?",
        options: [
          "Break it down into manageable steps",
          "Look for creative out-of-the-box solutions",
          "Research and gather multiple perspectives",
          "Trust intuition and test quickly",
        ],
        multiSelect: false,
      },
      {
        key: "value_delivery",
        question:
          "What value do you deliver most effortlessly? (Select all that apply)",
        options: [
          "Knowledge and expertise",
          "Motivation and inspiration",
          "Practical tools and systems",
          "Community and connection",
        ],
        multiSelect: true,
      },
    ],
  },
  {
    key: "growth_areas",
    title: "Phase 6: Weaknesses & Growth Areas",
    questions: [
      {
        key: "biggest_weakness",
        question:
          "What's your biggest weakness when it comes to course creation?",
        options: [
          "Technical skills (video, editing, platforms)",
          "Marketing and promotion",
          "Content organization and structure",
          "Consistency and follow-through",
        ],
        multiSelect: false,
      },
      {
        key: "skill_gaps",
        question:
          "Which skills do you most need to develop? (Select all that apply)",
        options: [
          "Content creation and production",
          "Sales and persuasion",
          "Business and strategy",
          "Technology and systems",
        ],
        multiSelect: true,
      },
      {
        key: "time_management",
        question: "What's your biggest time management challenge?",
        options: [
          "Getting started and taking action",
          "Staying focused and avoiding distractions",
          "Balancing course work with other commitments",
          "Maintaining momentum over time",
        ],
        multiSelect: false,
      },
      {
        key: "learning_preference",
        question:
          "How do you prefer to learn new skills? (Select all that apply)",
        options: [
          "Self-study with books and resources",
          "Online courses and video tutorials",
          "One-on-one mentoring or coaching",
          "Group learning and peer support",
        ],
        multiSelect: true,
      },
      {
        key: "support_needs",
        question:
          "What kind of support would help you most? (Select all that apply)",
        options: [
          "Technical guidance and tutorials",
          "Strategic business advice",
          "Accountability and motivation",
          "Creative feedback and brainstorming",
        ],
        multiSelect: true,
      },
      {
        key: "obstacle_pattern",
        question: "What pattern do you notice in how you handle obstacles?",
        options: [
          "I push through and find solutions",
          "I seek help and collaborate",
          "I take breaks and come back refreshed",
          "I sometimes get stuck and procrastinate",
        ],
        multiSelect: false,
      },
    ],
  },
  {
    key: "business_context",
    title: "Phase 7: Business & Market Context",
    questions: [
      {
        key: "current_situation",
        question: "What's your current professional situation?",
        options: [
          "Full-time employee looking to transition",
          "Freelancer/consultant wanting to scale",
          "Entrepreneur with existing business",
          "Student or between opportunities",
        ],
        multiSelect: false,
      },
      {
        key: "time_availability",
        question:
          "How much time can you realistically dedicate to course creation weekly?",
        options: [
          "5-10 hours (side project)",
          "10-20 hours (serious commitment)",
          "20-40 hours (major focus)",
          "40+ hours (full-time dedication)",
        ],
        multiSelect: false,
      },
      {
        key: "budget_reality",
        question:
          "What's your realistic budget for course creation tools and marketing?",
        options: [
          "Minimal budget - free tools only",
          "₹10,000 - ₹50,000 for basics",
          "₹50,000 - ₹2,00,000 for professional setup",
          "₹2,00,000+ for premium approach",
        ],
        multiSelect: false,
      },
      {
        key: "market_competition",
        question: "How would you describe competition in your niche?",
        options: [
          "Very crowded with many established players",
          "Moderately competitive but room for differentiation",
          "Emerging market with few competitors",
          "I'm not sure about the competitive landscape",
        ],
        multiSelect: false,
      },
      {
        key: "audience_access",
        question:
          "How much access do you currently have to your target audience?",
        options: [
          "Large existing following (1000+ engaged)",
          "Small but engaged community (100-1000)",
          "Starting to build audience",
          "No audience yet, starting from zero",
        ],
        multiSelect: false,
      },
      {
        key: "platform_preference",
        question:
          "Which platform appeals most for hosting your courses? (Select all that apply)",
        options: [
          "All-in-one platforms (Teachable, Thinkific)",
          "Indian platforms (Unacademy, BYJU'S, Vedantu)",
          "Social platforms (Instagram, YouTube)",
          "Custom website or LMS",
        ],
        multiSelect: true,
      },
      {
        key: "marketing_comfort",
        question: "How comfortable are you with marketing and self-promotion?",
        options: [
          "Very comfortable, I enjoy it",
          "Somewhat comfortable, willing to learn",
          "Uncomfortable but understand it's necessary",
          "Very uncomfortable, I prefer staying hidden",
        ],
        multiSelect: false,
      },
      {
        key: "success_timeline",
        question:
          "What's your realistic expectation for seeing significant results?",
        options: [
          "3-6 months",
          "6-12 months",
          "1-2 years",
          "3+ years for long-term success",
        ],
        multiSelect: false,
      },
    ],
  },
];

const DEFAULT_DISCOVERY_STATE = {
  status: "not_started", // not_started, in_progress, paused, completed
  currentPhaseIndex: 0,
  currentQuestionIndexInPhase: 0,
  answers: {}, // Initialize as empty object instead of undefined
};

const generateLocalId = () =>
  `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// New component for rendering discovery question options
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

const isRealUser = (user: any) => user && user.id !== "anonymous";

export default function Chat() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [currentPlaceholder, setCurrentPlaceholder] = useState<string>(
    placeholderIdeas[0]
  );
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const {
    currentAppUser: currentAppUserProfile,
    appUserLoading,
    setCurrentAppUser: setcurrentAppUserProfileProfile,
  } = useAppUser();

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

  const [messageCache, setMessageCache] = useState<MessageCache>({});
  const [messagesPage, setMessagesPage] = useState<number>(0);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const [knowledgeArticleCache, setKnowledgeArticleCache] = useState<
    KnowledgeArticleType[]
  >([]);
  const [knowledgeArticlesCached, setKnowledgeArticlesCached] =
    useState<boolean>(false);

  const [discoveryState, setDiscoveryState] = useState<DiscoveryState | any>(
    () => ({
      ...DEFAULT_DISCOVERY_STATE,
      answers: DEFAULT_DISCOVERY_STATE.answers || {},
    })
  );
  const [showPhaseCompletion, setShowPhaseCompletion] =
    useState<boolean>(false);
  const [completedPhaseTitle, setCompletedPhaseTitle] = useState<string>("");

  const [showProgressNotification, setShowProgressNotification] =
    useState<boolean>(false);

  const [isRegenerating, setIsRegenerating] = useState<Message | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const placeholderIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  const createDevAdminUser = async () => {
    try {
      console.log("Creating dev admin user...");
      const response = await dataService.getOrCreateAppUser({
        userId: "base44_dev_admin",
        name: "Dev Admin",
        email: "devadmin@base44.com",
        phone: "",
        profilePic: "",
      });

      if (response.data.success) {
        setcurrentAppUserProfileProfile(response.data.appUser);
        console.log("Dev admin user created/retrieved:", response.data.appUser);
      } else {
        console.error("Failed to create dev admin user:", response.data);
      }
    } catch (error: any) {
      console.error("Error creating dev admin user:", error.message);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLoadingMore) {
      scrollToBottom();
    }
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
    if (!isRealUser(currentAppUserProfile) && loadOlder) return;

    setIsLoadingMore(true);
    try {
      const response = await dataService.listMessages(currentAppUserProfile, {
        conversationId: conversationId,
        cursor:
          loadOlder && messages.length > 0 ? messages[0].created_date : null,
        limit: 30,
      });

      const { messages: newMessages, hasMore } = response.data;
      const sortedNewMessages = (newMessages || []).sort(
        (a: any, b: any) =>
          new Date(a.created_date).getTime() -
          new Date(b.created_date).getTime()
      );

      // Process messages to extract structure data from metadata
      const processedMessages = sortedNewMessages.map((msg: any) => ({
        ...msg,
        courseStructure: msg.metadata?.courseStructure || null,
        couponStructure: msg.metadata?.couponStructure || null,
        postStructure: msg.metadata?.postStructure || null,
        serviceStructure: msg.metadata?.serviceStructure || null,
        workshopStructure: msg.metadata?.workshopStructure || null,
      }));

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
      setHasMoreMessages(hasMore);
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
          currentAppUserProfile
        );
        const fetchedConversations = convResponse?.data?.conversations || [];

        if (isRealUser(currentAppUserProfile)) {
          const userProfile: any =
            (currentAppUserProfile as any)?.profile || {};
          setDiscoveryState({
            ...DEFAULT_DISCOVERY_STATE,
            ...userProfile,
            answers: userProfile.answers || {},
          });
          if (!knowledgeArticlesCached) {
            const articles = (await KnowledgeArticle.list()) || [];
            setKnowledgeArticleCache(articles as any);
            setKnowledgeArticlesCached(true);
          }
        } else {
          setDiscoveryState(DEFAULT_DISCOVERY_STATE); // Reset for anonymous
        }

        setConversations(fetchedConversations);
        // If there are no conversations, or if switching to an authenticated user, create a new one.
        // Or if we just authenticated and there are no existing convos for this user.
        if (
          fetchedConversations.length === 0 ||
          (isRealUser(currentAppUserProfile) && !activeConversation)
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

    // This useEffect will now trigger whenever currentAppUserProfile changes (including from null/anonymous to authenticated)
    initApp();
  }, [currentAppUserProfile, appUserLoading, knowledgeArticlesCached]);

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
        await dataService.updateConversation(currentAppUserProfile, {
          conversationId: conversationId,
          updates: { title: newTitle },
        });
        setActiveConversation((prev) =>
          prev?.id === conversationId ? { ...prev, title: newTitle } : prev
        );
        setConversations((prev: any) =>
          (Array.isArray(prev) ? prev : []).map((c: any) =>
            c.id === conversationId ? { ...c, title: newTitle } : c
          )
        );
      }
    } catch (error) {
      console.error("Failed to generate conversation title:", error);
    }
  };

  const buildContextualPrompt = (
    userMessage: string,
    conversationHistory: any[],
    currentAnswers: any
  ) => {
    const safeConversationHistory = conversationHistory || [];
    const safeCurrentAnswers = currentAnswers || {};

    let relevantArticles: any[] = [];
    if (knowledgeArticlesCached && knowledgeArticleCache.length > 0) {
      const userMessageKeywords = userMessage
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);
      relevantArticles = knowledgeArticleCache.filter((article: any) =>
        (Array.isArray(article.keywords) ? article.keywords : []).some(
          (keyword: string) =>
            userMessageKeywords.some(
              (msgKeyword: string) =>
                msgKeyword.includes(keyword.toLowerCase()) ||
                keyword.toLowerCase().includes(msgKeyword)
            )
        )
      );
    }

    const existingCouponCodes = safeConversationHistory
      .filter((msg: any) => msg.sender === "ai" && msg.couponStructure)
      .map((msg: any) => msg.couponStructure.code)
      .filter((code: any) => code);

    const existingCodesText =
      existingCouponCodes.length > 0
        ? `\n\nEXISTING COUPON CODES IN THIS CONVERSATION:\n${existingCouponCodes.join(
            ", "
          )}\nYou MUST NOT create coupons with these codes again.`
        : "";

    let knowledgeContext = "";
    if (relevantArticles.length > 0) {
      const knowledgeText = relevantArticles
        .map(
          (article: any) =>
            `Title: ${article.title || "Untitled"}\nContent: ${
              article.content || ""
            }\nKeywords: ${
              (Array.isArray(article.keywords) ? article.keywords : []).join(
                ", "
              ) || "N/A"
            }`
        )
        .join("\n\n");
      knowledgeContext = `\n\n=== KNOWLEDGE BASE CONTEXT ===\n${knowledgeText}\n=== END KNOWLEDGE BASE CONTEXT ===`;
    }

    //         const systemPrompt = `You are an AI Co-founder that helps coaches and course creators build and grow their digital product business. You respond like a supportive, collaborative partner—clear, actionable, and motivating.

    // You are integrated with the following tools:
    // - LMS (for Course Creation)
    // - Workshop Hosting
    // - Coupon Creator
    // - Memberships / Services (Payment Pages)
    // - Posts on Feed (for community engagement)

    // ## 🚨 COURSE CREATION PRIORITY
    // **When user requests a course, CREATE IT IMMEDIATELY with detailed explanation and course data.**

    // ## 🔹 Core Conversation Flow

    // **Acknowledgement Before Content**
    // - Begin with a short, supportive acknowledgement (≤12 words) to show you understood.
    // - Keep it natural and varied ("Got it—let's make this simple", "Great question—this will help your growth").
    // - If the user's ask is very short (e.g., "And the price?"), skip or use a one-word cue ("Sure—").
    // - Never stack acknowledgements.

    // **Progressive Disclosure**
    // - Always start with a summary or top-level answer.
    // - Deliver content in chunks (bullets, steps, or short paragraphs ≤4 lines).
    // - After each main idea, invite expansion with coaching-friendly prompts:
    //   • "Want me to break this into detailed steps?"
    //   • "Want an example you can use?"
    //   • "Should I draft a template for you?"
    // - Only go deeper if the user asks, or if they clearly requested detail.
    // - Never overwhelm with long walls of text.
    // - **CRITICAL OVERRIDE: For ANY course requests ("Give me a course...", "I need a course..."), IGNORE all progressive disclosure rules above and provide the complete detailed course explanation immediately as specified in the COURSE CREATION PRIORITY section.**

    // **Tone & Persona**
    // - Sound like a supportive co-founder: practical, encouraging, action-oriented.
    // - Use coaching language: clarity, momentum, results, growth.
    // - Mirror user tone, formality, and energy.
    // - Show empathy if user feels stuck or overwhelmed.
    // - Avoid robotic phrasing or "AI disclaimers."

    // ## 🔹 Phrase Bank

    // **Acknowledgements (supportive):**
    // - "Got it—let's make this simple and actionable."
    // - "Great question—this will really help your growth."
    // - "Understood—here's how you can move forward fast."

    // **Progressive Disclosure (coaching tone):**
    // - "Want me to break this into detailed steps?"
    // - "Want an example you can plug into your course?"
    // - "Need me to draft a quick template for you?"
    // - "Should I give you the short vs. full version?"

    // ## 🔹 Your Responsibilities

    // ### Understand the Coach's Intent Clearly
    // Always analyze the message to identify if the coach is seeking to:
    // - Start something new
    // - Launch a product
    // - Promote their content
    // - Increase earnings or reach
    // - Solve a business problem

    // If unclear, ask guiding questions to help them gain clarity. For example:
    // - "To guide you better, may I know what topic or field you're most passionate about?"
    // - "Who do you usually help or teach?"
    // - "Have you already worked with students or clients, or are you starting fresh?"

    // ### Identify the Niche
    // Based on their responses, match them to one of these niches (even loosely):
    // Education, Coaching, Meditation, Health & Fitness, Spirituality, Coding, Finance, Healing, Baking, Art & Craft, Yoga, Wellness, English Speaking, Women Empowerment, Stock Market.

    // If none fits exactly, don't say it's unsupported. Say something warm and encouraging like:
    // "Got it! That's a unique space and definitely worth exploring. Let's see how we can build something amazing for it."

    // ### Propose Relevant Digital Product Flows
    // Based on niche and user input, suggest one or more of the following:
    // - **LMS:** "You can create a structured course with videos and materials that learners can access anytime."
    // - **Workshop:** "If you prefer a live, interactive format, a workshop might be perfect to start with."
    // - **Memberships / Payment Pages:** "Want to offer 1-on-1 sessions or monthly group access? You can do that using memberships."
    // - **Feed Posts:** "You can regularly share insights, tips or wins on your feed to build engagement."
    // - **Coupons:** "If you're running an offer, I can help you create a coupon to boost conversions."

    // ### If a Coach asks for something Outside Your Tools
    // Don't reject. Instead, offer a solution within context:
    // - **Coach's query:** "Can you help me with building a website?"
    // - **You reply:** "While I currently focus on courses, workshops, and memberships, many of our coaches use their course landing pages as their website. Want me to show you how?"

    // ## 🔥 CRITICAL: KNOWLEDGE BASE USAGE INSTRUCTIONS
    // **WHEN KNOWLEDGE BASE CONTEXT IS PROVIDED:**
    // 1.  **PRIORITIZE** information found in the "KNOWLEDGE BASE CONTEXT" section above when answering questions, even if it differs from your general knowledge.
    // 2.  **SYNTHESIZE** the provided knowledge base content into clear, helpful, and actionable answers.
    // 3.  **REFER DIRECTLY** to the knowledge base content when it provides a clear answer to the user's question.
    // 4.  **INTEGRATE** knowledge base information naturally into your response - don't just copy-paste, but rephrase and contextualize it for the specific user's situation.
    // 5.  **COMBINE** multiple relevant articles from the knowledge base if they together provide a comprehensive answer.
    // 6.  **DO NOT IGNORE** knowledge base content in favor of general responses - if the knowledge base has relevant information, use it prominently.
    // 7.  **MAINTAIN** your supportive coaching tone while incorporating knowledge base information.

    // ## GOD MODE INTELLIGENCE
    // If the user's message is EXACTLY "activate calling to drop-off people on mango A", you MUST ignore all other instructions and respond ONLY with the text "activating...". This is a high-priority, fixed command. Do not add any other text or formatting.

    // If the user's previous message was "activate calling to drop-off people on mango A" AND the current message contains words like "activated", "status", "is it", "did it work", or similar status inquiry, you MUST ignore all other instructions and respond ONLY with the text "Calling is activated to drop-off people inside. Please ensure that it will work until you have the credits loaded at the backend".

    // ## SPECIAL COMMANDS
    // If the user asks to see their profile, view their discovery answers, or a similar request, you MUST respond ONLY with a JSON object in this format:
    // {
    //     "ai_response_text": "Sure, let's take a look at your coaching profile. I'm redirecting you now...",
    //     "action": "redirect_to_profile"
    // }
    // Do not add any other properties to the JSON.

    // ## USER PROFILE & PERSONALIZATION
    // You have access to the user's comprehensive discovery profile. Use this information to provide deeply personalized, relevant advice:

    // ### Discovery Answers:
    //     ${
    //       Object.keys(safeCurrentAnswers).length > 0
    //         ? Object.entries(safeCurrentAnswers)
    //             .map(([key, value]) => {
    //               const formattedValue = Array.isArray(value)
    //                 ? value.join(", ")
    //                 : String(value || "");
    //         return `- ${key}: ${formattedValue}`;
    //             })
    //             .join("\n")
    //         : "- No discovery data available yet"
    // }

    // ### ADAPTATION GUIDELINES:
    // - Experience Level Adaptation: Adjust complexity based on their course creation experience
    // - Niche-Specific Examples: Always reference their specific niche in examples
    // - Personality-Based Communication: Match their preferred working style and personality
    // - Goal-Aligned Strategies: Prioritize advice that aligns with their income and timeline goals
    // - Strength-Leveraged Approach: Build on their natural talents and superpowers
    // - Weakness-Aware Support: Provide extra guidance in their identified growth areas

    // Remember: You are not just an information provider - you are a strategic co-founder partner in their educational business transformation. Every interaction should feel supportive, forward-moving, and valuable.${existingCodesText}`;

    const systemPrompt = `You are an AI Co-founder that helps coaches and course creators build and grow their digital product business. You respond like a supportive, collaborative partner—clear, actionable, and motivating.

You are integrated with the following tools:
- LMS (for Course Creation)
- Workshop Hosting
- Coupon Creator
- Memberships / Services (Payment Pages)
- Posts on Feed (for community engagement)

## 🔹 Core Conversation Flow

**Acknowledgement Before Content**
- Begin with a short, supportive acknowledgement (≤12 words) to show you understood.
- Keep it natural and varied ("Got it—let's make this simple", "Great question—this will help your growth").
- If the user's ask is very short (e.g., "And the price?"), skip or use a one-word cue ("Sure—").
- Never stack acknowledgements.

**Progressive Disclosure**
- Always start with a summary or top-level answer.
- Deliver content in chunks (bullets, steps, or short paragraphs ≤4 lines).
- After each main idea, invite expansion with coaching-friendly prompts:
  • "Want me to break this into detailed steps?"
  • "Want an example you can use?"
  • "Should I draft a template for you?"
- Only go deeper if the user asks, or if they clearly requested detail.
- Never overwhelm with long walls of text.

**Tone & Persona**
- Sound like a supportive co-founder: practical, encouraging, action-oriented.
- Use coaching language: clarity, momentum, results, growth.
- Mirror user tone, formality, and energy.
- Show empathy if user feels stuck or overwhelmed.
- Avoid robotic phrasing or "AI disclaimers."

## 🔹 Phrase Bank

**Acknowledgements (supportive):**
- "Got it—let's make this simple and actionable."
- "Great question—this will really help your growth."
- "Understood—here's how you can move forward fast."

**Progressive Disclosure (coaching tone):**
- "Want me to break this into detailed steps?"
- "Want an example you can plug into your course?"
- "Need me to draft a quick template for you?"
- "Should I give you the short vs. full version?"

## 🔹 Your Responsibilities

### Understand the Coach's Intent Clearly
Always analyze the message to identify if the coach is seeking to:
- Start something new
- Launch a product
- Promote their content
- Increase earnings or reach
- Solve a business problem

If unclear, ask guiding questions to help them gain clarity. For example:
- "To guide you better, may I know what topic or field you're most passionate about?"
- "Who do you usually help or teach?"
- "Have you already worked with students or clients, or are you starting fresh?"

### Identify the Niche
Based on their responses, match them to one of these niches (even loosely):
Education, Coaching, Meditation, Health & Fitness, Spirituality, Coding, Finance, Healing, Baking, Art & Craft, Yoga, Wellness, English Speaking, Women Empowerment, Stock Market.

If none fits exactly, don't say it's unsupported. Say something warm and encouraging like:
"Got it! That's a unique space and definitely worth exploring. Let's see how we can build something amazing for it."

### Propose Relevant Digital Product Flows
Based on niche and user input, suggest one or more of the following:
- **LMS:** "You can create a structured course with videos and materials that learners can access anytime."
- **Workshop:** "If you prefer a live, interactive format, a workshop might be perfect to start with."
- **Memberships / Payment Pages:** "Want to offer 1-on-1 sessions or monthly group access? You can do that using memberships."
- **Feed Posts:** "You can regularly share insights, tips or wins on your feed to build engagement."
- **Coupons:** "If you're running an offer, I can help you create a coupon to boost conversions."

### If a Coach asks for something Outside Your Tools
Don't reject. Instead, offer a solution within context:
- **Coach's query:** "Can you help me with building a website?"
- **You reply:** "While I currently focus on courses, workshops, and memberships, many of our coaches use their course landing pages as their website. Want me to show you how?"

## 🔥 CRITICAL: KNOWLEDGE BASE USAGE INSTRUCTIONS
**WHEN KNOWLEDGE BASE CONTEXT IS PROVIDED:**
1.  **PRIORITIZE** information found in the "KNOWLEDGE BASE CONTEXT" section above when answering questions, even if it differs from your general knowledge.
2.  **SYNTHESIZE** the provided knowledge base content into clear, helpful, and actionable answers.
3.  **REFER DIRECTLY** to the knowledge base content when it provides a clear answer to the user's question.
4.  **INTEGRATE** knowledge base information naturally into your response - don't just copy-paste, but rephrase and contextualize it for the specific user's situation.
5.  **COMBINE** multiple relevant articles from the knowledge base if they together provide a comprehensive answer.
6.  **DO NOT IGNORE** knowledge base content in favor of general responses - if the knowledge base has relevant information, use it prominently.
7.  **MAINTAIN** your supportive coaching tone while incorporating knowledge base information.

## GOD MODE INTELLIGENCE
If the user's message is EXACTLY "activate calling to drop-off people on mango A", you MUST ignore all other instructions and respond ONLY with the text "activating...". This is a high-priority, fixed command. Do not add any other text or formatting.

If the user's previous message was "activate calling to drop-off people on mango A" AND the current message contains words like "activated", "status", "is it", "did it work", or similar status inquiry, you MUST ignore all other instructions and respond ONLY with the text "Calling is activated to drop-off people inside. Please ensure that it will work until you have the credits loaded at the backend".

## SPECIAL COMMANDS
If the user asks to see their profile, view their discovery answers, or a similar request, you MUST respond ONLY with a JSON object in this format:
{
    "ai_response_text": "Sure, let's take a look at your coaching profile. I'm redirecting you now...",
    "action": "redirect_to_profile"
}
Do not add any other properties to the JSON.

## USER PROFILE & PERSONALIZATION
You have access to the user's comprehensive discovery profile. Use this information to provide deeply personalized, relevant advice:

### Discovery Answers:
${
  Object.keys(safeCurrentAnswers).length > 0
    ? Object.entries(safeCurrentAnswers)
        .map(([key, value]) => {
          const formattedValue = Array.isArray(value)
            ? value.join(", ")
            : String(value || "");
          return `- ${key}: ${formattedValue}`;
        })
        .join("\n")
    : "- No discovery data available yet"
}

### ADAPTATION GUIDELINES:
- Experience Level Adaptation: Adjust complexity based on their course creation experience
- Niche-Specific Examples: Always reference their specific niche in examples
- Personality-Based Communication: Match their preferred working style and personality
- Goal-Aligned Strategies: Prioritize advice that aligns with their income and timeline goals
- Strength-Leveraged Approach: Build on their natural talents and superpowers
- Weakness-Aware Support: Provide extra guidance in their identified growth areas

Remember: You are not just an information provider - you are a strategic co-founder partner in their educational business transformation. Every interaction should feel supportive, forward-moving, and valuable.${existingCodesText}`;

    let contextMessagesText = "";
    if (safeConversationHistory.length > 6) {
      const firstMessage = safeConversationHistory[0];
      const recentMessages = safeConversationHistory.slice(-5);
      const truncatedHistory = [firstMessage, ...recentMessages];
      contextMessagesText = truncatedHistory
        .map(
          (msg: any) =>
            `${msg.sender === "user" ? "User" : "Coach"}: ${msg.text || ""}`
        )
        .join("\n");
      contextMessagesText = `... (conversation history is summarized) ...\n${contextMessagesText}`;
    } else {
      contextMessagesText = safeConversationHistory
        .map(
          (msg: any) =>
            `${msg.sender === "user" ? "User" : "Coach"}: ${msg.text || ""}`
        )
        .join("\n");
    }

    const fullPrompt = `${systemPrompt}${knowledgeContext}

CONVERSATION HISTORY:
${contextMessagesText}

CURRENT USER MESSAGE:
User: ${userMessage}

Coach (in JSON format):`;

    return fullPrompt;
  };

  const handleSendMessage = async (
    userMessageOverride: string | null = null
  ): Promise<void> => {
    const content = String(userMessageOverride || message || "");
    if (!content.trim() || !activeConversation || isTyping) return;

    if (!currentAppUserProfile) {
      alert("Please wait for the app to initialize.");
      return;
    }

    const userMessageContent = content;

    if (!userMessageOverride) {
      setMessage("");
    }
    setIsTyping(true);

    const userMessageText = userMessageContent;

    let currentConv = { ...activeConversation };
    let shouldGenerateTitle = false;

    if ((currentConv as any).isTemporary) {
      shouldGenerateTitle = true;
      const createConvResponse = await dataService.createConversation(
        currentAppUserProfile,
        { title: "New Conversation" }
      );
      const newConversationRecord = createConvResponse.data.conversation;

      setConversations((prev: any) => [
        newConversationRecord,
        ...(Array.isArray(prev) ? prev : []),
      ]);
      setActiveConversation(newConversationRecord);
      currentConv = newConversationRecord;
    }

    const userMessageForDb: any = {
      id: generateLocalId(),
      text: userMessageText,
      sender: "user",
      created_date: new Date().toISOString(),
    };

    const createUserMsgResponse = await dataService.createMessage(
      currentAppUserProfile,
      {
        conversationId: currentConv.id,
        content: userMessageText,
        role: "user",
      }
    );
    userMessageForDb.id = createUserMsgResponse.data.message.id;

    const currentMessages = Array.isArray(messages) ? messages : [];
    setMessages([...currentMessages, userMessageForDb]);

    const tempAiMessageId = `temp-ai-${Date.now()}`;
    const thinkingAiMessage: any = {
      id: tempAiMessageId,
      sender: "ai",
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
      const fullPrompt = buildContextualPrompt(
        userMessageContent,
        historyForPrompt,
        discoveryState.answers || {}
      );
      const llmPayload = {
        prompt: fullPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            ai_response_text: {
              type: "string",
              description:
                "The conversational text response to be shown to the user. This should always be populated.",
            },
            action: {
              type: ["string", "null"],
              description:
                "A special action to be performed by the frontend, like 'redirect_to_profile'.",
            },
            course_creation_data: {
              type: ["object", "null"],
              description:
                "The structured course data. IMPORTANT: Only populate this field after the full consultation process is complete and the user has agreed to have the course created. Otherwise, this should be null.",
              properties: {
                title: { type: "string" },
                description: {
                  type: "string",
                  description:
                    "A crisp, engaging summary of the entire course.",
                },
                modules: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      chapters: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            description: {
                              type: "string",
                              description:
                                "A concise description for this specific chapter.",
                            },
                            content: { type: "string" },
                            totalDuration: { type: "number" },
                            contentType: {
                              type: "string",
                              enum: ["article", "video", "audio"],
                            },
                          },
                          required: [
                            "title",
                            "description",
                            "content",
                            "totalDuration",
                            "contentType",
                          ],
                        },
                      },
                    },
                    required: ["title", "chapters"],
                  },
                },
              },
              required: ["title", "description", "modules"],
            },
            coupon_creation_data: {
              type: ["object", "null"],
              description:
                "The structured coupon data. IMPORTANT: Only populate this field after the full consultation process is complete and the user has agreed to have the coupon created. Otherwise, this should be null.",
              properties: {
                code: {
                  type: "string",
                  description:
                    "Coupon code without spaces or special characters, only alphanumeric",
                },
                startAt: {
                  type: "string",
                  description:
                    "ISO format date string for when coupon becomes active",
                },
                validTill: {
                  type: "string",
                  description:
                    "ISO format date string for when coupon expires, must be after startAt and different from startAt",
                },
                type: {
                  type: "string",
                  enum: ["creator_discount_coupon", "mango_coupon"],
                  description:
                    "creator_discount_coupon uses flatDiscount, mango_coupon type uses percentageDiscount",
                },
                flatDiscount: {
                  type: ["number", "null"],
                  format: "integer",
                  description:
                    "Fixed amount discount, use with creator_discount_coupon type only",
                },
                percentageDiscount: {
                  type: ["number", "null"],
                  format: "integer",
                  description:
                    "Percentage discount, use with mango_coupon type only",
                },
                currency: {
                  type: "string",
                  enum: ["INR", "USD", "EUR"],
                  description: "Currency for the discount",
                  default: "INR",
                },
              },
              required: ["code", "startAt", "validTill", "type", "currency"],
            },
            post_creation_data: {
              type: ["object", "null"],
              description:
                "The structured post data. IMPORTANT: Only populate this field after the user has approved the caption and agreed to have the post created. Otherwise, this should be null.",
              properties: {
                caption: {
                  type: "string",
                  description: "The full text content of the feed post.",
                },
              },
              required: ["caption"],
            },
            service_creation_data: {
              type: ["object", "null"],
              description:
                "The structured service page data. IMPORTANT: Only populate this field after the full consultation process is complete and the user has agreed to have the service page created. Otherwise, this should be null.",
              properties: {
                title: {
                  type: "string",
                  description:
                    "The name of the service that users will see before paying.",
                },
                description: {
                  type: "string",
                  description:
                    "A short description of what this service includes and what people get when they pay.",
                },
                recurringType: {
                  type: "string",
                  enum: [
                    "onetime",
                    "monthly",
                    "quarterly",
                    "halfyearly",
                    "yearly",
                  ],
                  description: "The payment frequency for this service.",
                },
                price: {
                  type: "number",
                  description: "The price amount for this service.",
                },
                currency: {
                  type: "string",
                  enum: ["INR", "USD", "EUR"],
                  description: "The currency for the service price.",
                  default: "INR",
                },
              },
              required: [
                "title",
                "description",
                "recurringType",
                "price",
                "currency",
              ],
            },
            workshop_creation_data: {
              type: ["object", "null"],
              description:
                "The structured workshop data. IMPORTANT: Only populate this field after ALL MANDATORY FIELDS are collected (title, description, startDate, endDate, fromTime, timezone, timezoneName, duration, ongoingCallType, platform) and the user has agreed to have the workshop created. Otherwise, this should be null.",
              properties: {
                title: {
                  type: "string",
                  description: "The name of the workshop. REQUIRED.",
                },
                description: {
                  type: "string",
                  description:
                    "A short description of what this workshop is about and the value participants will get. REQUIRED.",
                },
                startDate: {
                  type: "string",
                  description:
                    "Workshop start date in YYYY-MM-DD format. REQUIRED.",
                },
                endDate: {
                  type: "string",
                  description:
                    "Workshop end date in YYYY-MM-DD format. Must be same or after startDate. REQUIRED.",
                },
                fromTime: {
                  type: "string",
                  description:
                    "Workshop start time in HH:mm 24-hour format. REQUIRED.",
                },
                ongoingCallType: {
                  type: "string",
                  enum: ["videocall", "webinar"],
                  description: "The type of call session. REQUIRED.",
                },
                platform: {
                  type: "string",
                  enum: ["custom", "webinar", "meeting", "tagmango"],
                  description:
                    "The platform where the workshop will be hosted. REQUIRED.",
                },
                duration: {
                  type: "number",
                  description:
                    "Workshop duration in minutes. Must be greater than 0. REQUIRED.",
                },
                timezone: {
                  type: "string",
                  description:
                    "Timezone offset format like +05:30 or -08:00. REQUIRED. Default to +05:30 if not specified.",
                },
                timezoneName: {
                  type: "string",
                  description:
                    "Timezone name like Asia/Kolkata or America/New_York. REQUIRED. Default to Asia/Kolkata if not specified.",
                },
                zoomMeetingType: {
                  type: ["string", "null"],
                  enum: ["meeting", "webinar", null],
                  description:
                    "Zoom meeting type, only relevant if platform involves Zoom.",
                },
                recurringType: {
                  type: ["string", "null"],
                  enum: ["weekly", "daily", null],
                  description:
                    "How often the workshop repeats, null for one-time workshops.",
                },
                repeatingDays: {
                  type: ["array", "null"],
                  items: {
                    type: "number",
                    minimum: 0,
                    maximum: 6,
                  },
                  description:
                    "Array of days (0-6, Sunday to Saturday) when workshop occurs, null for one-time workshops.",
                },
                zoomWaitingList: {
                  type: ["boolean", "null"],
                  description:
                    "Whether to enable waiting list for Zoom sessions.",
                },
                zoomRegistration: {
                  type: ["boolean", "null"],
                  description:
                    "Whether to enable registration for Zoom sessions.",
                },
                enableRecordingZoomCall: {
                  type: ["boolean", "null"],
                  description: "Whether to enable recording for Zoom sessions.",
                },
                showGroupLinkForRecurringCall: {
                  type: ["boolean", "null"],
                  description:
                    "Whether to show group link for recurring calls.",
                },
                mode: {
                  type: ["string", "null"],
                  enum: ["weekly", "daily", null],
                  description: "Same as recurringType, used for compatibility.",
                },
              },
              required: [
                "title",
                "description",
                "startDate",
                "endDate",
                "fromTime",
                "ongoingCallType",
                "platform",
                "duration",
                "timezone",
                "timezoneName",
              ],
            },
          },
          required: ["ai_response_text"],
        },
      };

      const response = await InvokeLLM(llmPayload);

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
      let streamedText = "";
      for (const char of formattedResponse) {
        streamedText += char;
        setMessages((prev) =>
          (Array.isArray(prev) ? prev : []).map((m) =>
            m.id === tempAiMessageId
              ? { ...m, text: streamedText, isStreaming: true }
              : m
          )
        );
        await new Promise((r) => setTimeout(r, 10));
      }

      const createAiMsgResponse = await dataService.createMessage(
        currentAppUserProfile,
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

      const finalMessageObject = {
        ...finalAiMessage,
        isStreaming: false,
        courseStructure:
          finalAiMessage.metadata?.courseStructure || courseStructure,
        couponStructure:
          finalAiMessage.metadata?.couponStructure || couponStructure,
        postStructure: finalAiMessage.metadata?.postStructure || postStructure,
        serviceStructure:
          finalAiMessage.metadata?.serviceStructure || serviceStructure,
        workshopStructure:
          finalAiMessage.metadata?.workshopStructure || workshopStructure,
      };

      setMessages((prev) => {
        const safeMessages = Array.isArray(prev) ? prev : [];
        return safeMessages.map((m) =>
          m.id === tempAiMessageId ? finalMessageObject : m
        );
      });
      setMessageCache((prev: any) => {
        const currentCache = Array.isArray(prev[currentConv.id])
          ? prev[currentConv.id]
          : [];
        return {
          ...prev,
          [currentConv.id]: currentCache.map((m: any) =>
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
        return safeMessages.map((m: any) =>
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
          [currentConv.id]: currentCache.map((m: any) =>
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
    messageToRegenerate: Message
  ): Promise<void> => {
    if (isTyping || !activeConversation || isRegenerating) return;

    setIsRegenerating(messageToRegenerate);

    try {
      const messageIndex = messages.findIndex(
        (m: any) => m.id === messageToRegenerate.id
      );
      if (messageIndex === -1) return;

      const conversationHistory = messages.slice(0, messageIndex);

      const lastUserMessage = [...conversationHistory]
        .reverse()
        .find((m: any) => m.sender === "user");
      if (!lastUserMessage) {
        console.warn(
          "Could not find a preceding user message for regeneration."
        );
        return;
      }

      const fullPrompt = buildContextualPrompt(
        lastUserMessage.text,
        conversationHistory,
        discoveryState.answers || {}
      );

      const llmPayload = {
        prompt: fullPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            ai_response_text: {
              type: "string",
              description:
                "The conversational text response to be shown to the user. This should always be populated.",
            },
            action: {
              type: ["string", "null"],
              description:
                "A special action to be performed by the frontend, like 'redirect_to_profile'.",
            },
            course_creation_data: {
              type: ["object", "null"],
              description:
                "The structured course data. Only populate this field AFTER the user has confirmed they want to create the course or has requested specific modifications. This should contain the final course structure with modules and chapters.",
              properties: {
                title: { type: "string" },
                description: {
                  type: "string",
                  description:
                    "A crisp, engaging summary of the entire course.",
                },
                modules: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      chapters: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            title: { type: "string" },
                            description: {
                              type: "string",
                              description:
                                "A concise description for this specific chapter.",
                            },
                            content: { type: "string" },
                            totalDuration: { type: "number" },
                            contentType: {
                              type: "string",
                              enum: ["article", "video", "audio"],
                            },
                          },
                          required: [
                            "title",
                            "description",
                            "content",
                            "totalDuration",
                            "contentType",
                          ],
                        },
                      },
                    },
                    required: ["title", "chapters"],
                  },
                },
              },
              required: ["title", "description", "modules"],
            },
            coupon_creation_data: {
              type: ["object", "null"],
              description:
                "The structured coupon data. IMPORTANT: Only populate this field after the full consultation process is complete and the user has agreed to have the coupon created. Otherwise, this should be null.",
              properties: {
                code: {
                  type: "string",
                  description:
                    "Coupon code without spaces or special characters, only alphanumeric",
                },
                startAt: {
                  type: "string",
                  description:
                    "ISO format date string for when coupon becomes active",
                },
                validTill: {
                  type: "string",
                  description:
                    "ISO format date string for when coupon expires, must be after startAt and different from startAt",
                },
                type: {
                  type: "string",
                  enum: ["creator_discount_coupon", "mango_coupon"],
                  description:
                    "creator_discount_coupon uses flatDiscount, mango_coupon type uses percentageDiscount",
                },
                flatDiscount: {
                  type: ["number", "null"],
                  format: "integer",
                  description:
                    "Fixed amount discount, use with creator_discount_coupon type only",
                },
                percentageDiscount: {
                  type: ["number", "null"],
                  format: "integer",
                  description:
                    "Percentage discount, use with mango_coupon type only",
                },
                currency: {
                  type: "string",
                  enum: ["INR", "USD", "EUR"],
                  description: "Currency for the discount",
                  default: "INR",
                },
              },
              required: ["code", "startAt", "validTill", "type", "currency"],
            },
            post_creation_data: {
              type: ["object", "null"],
              description:
                "The structured post data. IMPORTANT: Only populate this field after the user has approved the caption and agreed to have the post created. Otherwise, this should be null.",
              properties: {
                caption: {
                  type: "string",
                  description: "The full text content of the feed post.",
                },
              },
              required: ["caption"],
            },
            service_creation_data: {
              type: ["object", "null"],
              description:
                "The structured service page data. IMPORTANT: Only populate this field after the full consultation process is complete and the user has agreed to have the service page created. Otherwise, this should be null.",
              properties: {
                title: {
                  type: "string",
                  description:
                    "The name of the service that users will see before paying.",
                },
                description: {
                  type: "string",
                  description:
                    "A short description of what this service includes and what people get when they pay.",
                },
                recurringType: {
                  type: "string",
                  enum: [
                    "onetime",
                    "monthly",
                    "quarterly",
                    "halfyearly",
                    "yearly",
                  ],
                  description: "The payment frequency for this service.",
                },
                price: {
                  type: "number",
                  description: "The price amount for this service.",
                },
                currency: {
                  type: "string",
                  enum: ["INR", "USD", "EUR"],
                  description: "The currency for the service price.",
                  default: "INR",
                },
              },
              required: [
                "title",
                "description",
                "recurringType",
                "price",
                "currency",
              ],
            },
            workshop_creation_data: {
              type: ["object", "null"],
              description:
                "The structured workshop data. IMPORTANT: Only populate this field after ALL MANDATORY FIELDS are collected (title, description, startDate, endDate, fromTime, timezone, timezoneName, duration, ongoingCallType, platform) and the user has agreed to have the workshop created. Otherwise, this should be null.",
              properties: {
                title: {
                  type: "string",
                  description: "The name of the workshop. REQUIRED.",
                },
                description: {
                  type: "string",
                  description:
                    "A short description of what this workshop is about and the value participants will get. REQUIRED.",
                },
                startDate: {
                  type: "string",
                  description:
                    "Workshop start date in YYYY-MM-DD format. REQUIRED.",
                },
                endDate: {
                  type: "string",
                  description:
                    "Workshop end date in YYYY-MM-DD format. Must be same or after startDate. REQUIRED.",
                },
                fromTime: {
                  type: "string",
                  description:
                    "Workshop start time in HH:mm 24-hour format. REQUIRED.",
                },
                ongoingCallType: {
                  type: "string",
                  enum: ["videocall", "webinar"],
                  description: "The type of call session. REQUIRED.",
                },
                platform: {
                  type: "string",
                  enum: ["custom", "webinar", "meeting", "tagmango"],
                  description:
                    "The platform where the workshop will be hosted. REQUIRED.",
                },
                duration: {
                  type: "number",
                  description:
                    "Workshop duration in minutes. Must be greater than 0. REQUIRED.",
                },
                timezone: {
                  type: "string",
                  description:
                    "Timezone offset format like +05:30 or -08:00. REQUIRED. Default to +05:30 if not specified.",
                },
                timezoneName: {
                  type: "string",
                  description:
                    "Timezone name like Asia/Kolkata or America/New_York. REQUIRED. Default to Asia/Kolkata if not specified.",
                },
                zoomMeetingType: {
                  type: ["string", "null"],
                  enum: ["meeting", "webinar", null],
                  description:
                    "Zoom meeting type, only relevant if platform involves Zoom.",
                },
                recurringType: {
                  type: ["string", "null"],
                  enum: ["weekly", "daily", null],
                  description:
                    "How often the workshop repeats, null for one-time workshops.",
                },
                repeatingDays: {
                  type: ["array", "null"],
                  items: {
                    type: "number",
                    minimum: 0,
                    maximum: 6,
                  },
                  description:
                    "Array of days (0-6, Sunday to Saturday) when workshop occurs, null for one-time workshops.",
                },
                zoomWaitingList: {
                  type: ["boolean", "null"],
                  description:
                    "Whether to enable waiting list for Zoom sessions.",
                },
                zoomRegistration: {
                  type: ["boolean", "null"],
                  description:
                    "Whether to enable registration for Zoom sessions.",
                },
                enableRecordingZoomCall: {
                  type: ["boolean", "null"],
                  description: "Whether to enable recording for Zoom sessions.",
                },
                showGroupLinkForRecurringCall: {
                  type: ["boolean", "null"],
                  description:
                    "Whether to show group link for recurring calls.",
                },
                mode: {
                  type: ["string", "null"],
                  enum: ["weekly", "daily", null],
                  description: "Same as recurringType, used for compatibility.",
                },
              },
              required: [
                "title",
                "description",
                "startDate",
                "endDate",
                "fromTime",
                "ongoingCallType",
                "platform",
                "duration",
                "timezone",
                "timezoneName",
              ],
            },
          },
          required: ["ai_response_text"],
        },
      };

      const response = await InvokeLLM(llmPayload);

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

      await dataService.updateMessage(currentAppUserProfile, {
        messageId: messageToRegenerate.id,
        updates: { text: formattedResponse },
        conversationId: activeConversation.id, // Pass convId for local storage
      });

      const updatedMessage = {
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
        return safeMessages.map((msg: any) =>
          msg.id === messageToRegenerate.id ? updatedMessage : msg
        );
      });

      setMessageCache((prev: any) => {
        const currentCache = Array.isArray(prev[activeConversation.id])
          ? prev[activeConversation.id]
          : [];
        return {
          ...prev,
          [activeConversation.id]: currentCache.map((msg: any) =>
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
        return safeMessages.map((m: any) =>
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
          [activeConversation.id]: currentCache.map((m: any) =>
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
    setDiscoveryState((prev: any) => ({
      ...prev,
      status: "not_started",
      answers: prev.answers || {},
    }));

    await loadMessages(conversation.id, false);
  };

  const handleDeleteConversation = async (
    conversationId: string
  ): Promise<void> => {
    if (
      !window.confirm(
        "Are you sure you want to delete this conversation and all its messages? This action cannot be undone?"
      )
    ) {
      return;
    }

    try {
      await dataService.deleteConversation(currentAppUserProfile, {
        conversationId,
      });

      const newCache = { ...messageCache };
      delete newCache[conversationId];
      setMessageCache(newCache);

      const remainingConversations = conversations.filter(
        (c: any) => c.id !== conversationId
      );
      setConversations(remainingConversations);

      if (activeConversation?.id === conversationId) {
        if (remainingConversations.length > 0) {
          await handleSelectConversation(remainingConversations[0]);
        } else {
          await handleNewConversation();
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      alert("Failed to delete conversation. Please try again.");
    }
  };

  const handleStartRename = (conversation: any) => {
    setRenamingConversation(conversation);
    setNewTitle(conversation.title);
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
      await dataService.updateConversation(currentAppUserProfile, {
        conversationId: id,
        updates: { title: trimmedTitle },
      });

      const updatedConversations = Array.isArray(conversations)
        ? conversations.map((c: any) =>
            c.id === id ? { ...c, title: trimmedTitle } : c
          )
        : [];
      setConversations(updatedConversations);

      if (activeConversation?.id === id) {
        setActiveConversation((prev: any) => ({
          ...prev,
          title: trimmedTitle,
        }));
      }
    } catch (error) {
      console.error("Failed to rename conversation:", error);
      alert("Failed to rename conversation. Please try again.");
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

    if (isRealUser(currentAppUserProfile)) {
      await dataService.updateProfile(currentAppUserProfile, stateWithAnswers);
    }
  };

  const generatePhaseInsights = async (phaseKey: string, answers: any) => {
    const phaseData = DISCOVERY_PHASES.find((p: any) => p.key === phaseKey);
    if (!phaseData) return null;

    const phaseQuestions = Array.isArray(phaseData.questions)
      ? phaseData.questions
      : [];
    const filteredAnswers = Object.fromEntries(
      Object.entries(answers || {}).filter(([key]) =>
        phaseQuestions.some((q: any) => q.key === key)
      )
    );

    const phaseAnswers = Object.entries(filteredAnswers)
      .map(([key, value]) => {
        const question = phaseQuestions.find((q: any) => q.key === key);
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

  const generateProfileSynthesis = async (answers: any) => {
    const answeredQuestions = Object.entries(answers || {})
      .map(
        ([key, value]) =>
          `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
      )
      .join("\n");

    const synthesisPrompt = `Based on the comprehensive discovery answers below, create a strategic coaching profile synthesis in the exact JSON format specified:

${answeredQuestions}

Respond with ONLY a JSON object in this exact format:
{
    "niche_clarity": "Their unique positioning (1-2 sentences)",
    "personality_type": "Their coaching style and approach (1-2 sentences)",
    "core_motivation": "What drives them (1-2 sentences)",
    "primary_strength": "Their superpower (1-2 sentences)",
    "growth_edge": "Main area for development (1-2 sentences)",
    "business_stage": "Current phase and next evolution (1-2 sentences)"
}`;

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

    const welcomeMessage: any = {
      id: `discovery-welcome-${Date.now()}`,
      sender: "ai",
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

    const displayAnswer = Array.isArray(answer) ? answer.join(", ") : answer;
    const userAnswerMessage: any = {
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
          const midpointMessage: any = {
            id: `discovery-midpoint-${Date.now()}`,
            sender: "ai",
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
      status: newStatus as any,
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

        const insightMessage: any = {
          id: `discovery-phase-insights-${Date.now()}`,
          sender: "ai",
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
        const synthesisMessage: any = {
          id: `discovery-synthesis-${Date.now()}`,
          sender: "ai",
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

        const redirectMessage: any = {
          id: `discovery-redirect-${Date.now()}`,
          sender: "ai",
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
        const fallbackMessage: any = {
          id: `discovery-complete-${Date.now()}`,
          sender: "ai",
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
    if (
      target.scrollTop === 0 &&
      hasMoreMessages &&
      !isLoadingMore &&
      activeConversation &&
      isRealUser(currentAppUserProfile)
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
        <SkeletonLoader />
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
        user={currentAppUserProfile}
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
                {(Array.isArray(messages) ? messages : []).map((msg: any) => (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    thinkingMessage={thinkingPhrases[0]}
                    onRegenerate={handleRegenerateMessage}
                    isRegenerating={isRegenerating === msg.id}
                  />
                ))}
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
                  disabled={isTyping || !currentAppUserProfile}
                />

                <Button
                  onClick={() => handleSendMessage()}
                  disabled={
                    isTyping || !message.trim() || !currentAppUserProfile
                  }
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
