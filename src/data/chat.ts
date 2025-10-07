import { DiscoveryPhaseOptions } from "@/types/chat";

export const placeholderIdeas = [
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

export const thinkingPhrases = [
  "Thinking...",
  "Formulating insights...",
  "Consulting my knowledge base...",
  "Drafting actionable steps...",
  "Putting together a strategy...",
  "Analyzing the best approach...",
];



export const DISCOVERY_PHASES: DiscoveryPhaseOptions[] = [
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