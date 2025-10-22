# AI Co-Founder Frontend

An intelligent AI-powered coaching platform that helps coaches and entrepreneurs build and grow their business through personalized guidance, strategic insights, and interactive discovery processes.

## 🌟 Overview

AI Co-Founder is a modern web application that serves as your AI business partner for coaching professionals. It provides an intelligent chat interface powered by advanced AI to help you:

- **Build Your Coaching Profile**: Complete a comprehensive discovery process to understand your unique strengths, motivations, and business goals
- **Get Personalized Guidance**: Receive tailored advice based on your specific coaching style and business stage
- **Manage Conversations**: Organize and revisit your strategic discussions
- **Access Knowledge Base**: Leverage curated coaching resources and best practices
- **Track Your Journey**: Monitor your progress through different business phases

## 🚀 Features

### 💬 Intelligent Chat Interface
- **Real-time AI Streaming**: Experience natural, flowing conversations with instant AI responses
- **Context-Aware Responses**: AI remembers your profile and previous conversations
- **Message Regeneration**: Refine AI responses to get exactly what you need
- **Markdown Support**: Rich text formatting for better readability
- **Conversation History**: Access and manage all your previous conversations

### 🎯 Discovery Mode
- **7-Phase Discovery Process**: Systematic exploration of your coaching business
  - Your niche and expertise
  - Personality and motivations
  - Fears and challenges
  - Goals and vision
  - Strengths and superpowers
  - Growth areas
  - Business context
- **Progress Tracking**: Visual progress indicators with pause/resume functionality
- **Phase Completion Insights**: Receive strategic insights after completing each phase
- **Profile Synthesis**: AI-generated comprehensive coaching profile

### 👤 Profile Management
- **Coaching Synthesis**: View your personalized coaching profile with 6 key dimensions
  - Niche Clarity
  - Personality Type
  - Core Motivation
  - Primary Strength
  - Growth Edge
  - Business Stage
- **Discovery Answers**: Review all your responses organized by phase
- **Profile Customization**: Edit your name and profile information

### 📚 Knowledge Base
- **Article Management**: Create, edit, and delete knowledge articles
- **PDF Upload**: Extract content automatically from PDF documents
- **Category Organization**: Organize articles by categories
- **Keyword Tagging**: Tag articles for easy AI retrieval
- **Rich Content**: Support for detailed coaching methodologies and best practices

### 🎨 Modern UI/UX
- **Beautiful Design**: Sleek, modern interface with smooth animations
- **Dark/Light Theme**: Adaptive color scheme for comfortable viewing
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Accessible Components**: Built with accessibility best practices
- **Loading States**: Skeleton loaders and progress indicators

## 🛠️ Tech Stack

### Core Technologies
- **React 18.2**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development experience
- **Vite 6**: Lightning-fast build tool and dev server
- **React Router 7**: Client-side routing

### UI Framework
- **Tailwind CSS 3**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible component primitives
- **Framer Motion 12**: Production-ready animation library
- **Lucide React**: Beautiful, consistent icon set

### Form & Validation
- **React Hook Form**: Performant form validation
- **Zod**: TypeScript-first schema validation
- **@hookform/resolvers**: Validation resolvers for form schemas

### State Management
- **Zustand**: Lightweight state management
- **React Context**: For theme and user state

### Additional Libraries
- **React Markdown**: Render markdown in chat messages
- **Recharts**: Charting library for data visualization
- **date-fns**: Modern date utility library
- **Sonner**: Toast notifications

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Setup

1. **Clone the repository**
```bash
cd ai-cofounder-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=AI Co-Founder
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── api/                    # API service layer
│   ├── auth.ts            # Authentication services
│   ├── conversations.ts   # Conversation management
│   ├── messages.ts        # Message CRUD operations
│   ├── openai.ts          # AI/LLM integration
│   ├── profile.ts         # User profile services
│   ├── knowledgeArticle.ts # Knowledge base APIs
│   └── integrations.ts    # Third-party integrations
│
├── components/            # Reusable components
│   ├── chat/             # Chat-specific components
│   │   ├── MessageBubble.tsx
│   │   ├── DiscoveryProgressTracker.tsx
│   │   ├── PhaseCompletionCelebration.tsx
│   │   └── SkeletonLoader.tsx
│   ├── conversations/    # Conversation management
│   │   ├── ConversationList.tsx
│   │   ├── ConversationSidebar.tsx
│   │   └── ConversationHistoryModal.tsx
│   ├── ui/              # Shadcn/UI components (49 files)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── services/        # Service layer components
│   └── ThemeProvider.tsx
│
├── pages/               # Application pages
│   ├── Chat.tsx        # Main chat interface
│   ├── Profile.tsx     # User profile page
│   ├── KnowledgeBase.tsx # Knowledge management
│   └── Layout.tsx      # App layout wrapper
│
├── stores/             # State management
│   └── userStore.ts   # User state (Zustand)
│
├── types/              # TypeScript type definitions
│   ├── chat.ts
│   ├── conversation.ts
│   ├── dataService.ts
│   ├── knowledgeBase.ts
│   └── messageBubble.ts
│
├── utils/              # Utility functions
│   ├── helper.ts
│   ├── tokenUtil.ts
│   └── index.ts
│
├── data/               # Static data and constants
│   └── chat.ts        # Discovery phases, placeholders
│
├── hooks/              # Custom React hooks
│   └── use-mobile.tsx
│
├── lib/                # Library configurations
│   └── utils.ts       # Utility functions (cn, etc.)
│
├── App.tsx            # Root component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## 🎯 Key Features Deep Dive

### Real-Time AI Streaming

The application implements real-time streaming of AI responses for a natural conversation experience:

```typescript
// Streams responses from the backend in real-time
const response = await InvokeLLM({
  userMessage: content,
  conversationHistory: messages,
  discoveryAnswers: discoveryState.answers,
  stream: true,
  onChunk: (chunk: string) => {
    // Updates UI as text streams in
    setMessages(prev => /* update with new chunk */);
  }
});
```

### Discovery Mode

A 7-phase guided process that builds a comprehensive coaching profile:

1. **Phase Structure**: Each phase contains multiple questions
2. **Progress Tracking**: Real-time progress indicators
3. **Pause & Resume**: Save progress and continue later
4. **Phase Insights**: AI-generated insights after each phase
5. **Final Synthesis**: Complete coaching profile upon completion

### State Management

Uses Zustand for lightweight, efficient state management:

```typescript
// User store with persistent state
const useUserStore = create(persist(
  (set) => ({
    currentAppUser: null,
    setCurrentAppUser: (user) => set({ currentAppUser: user }),
    // ...
  }),
  { name: 'user-storage' }
));
```

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

### Code Style

The project uses:
- **ESLint**: Code linting with React-specific rules
- **TypeScript**: Strict mode enabled
- **Prettier**: Automatic code formatting (configure as needed)

### Component Development

Components follow these conventions:

1. **Functional Components**: Use React hooks
2. **TypeScript**: All components are typed
3. **Props Interface**: Define explicit prop types
4. **Composition**: Leverage component composition
5. **Accessibility**: Use Radix UI for accessible primitives

Example:

```typescript
interface MessageBubbleProps {
  msg: ExtendedMessage;
  thinkingMessage: string;
  onRegenerate: (msg: ExtendedMessage) => void;
  isRegenerating: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  thinkingMessage,
  onRegenerate,
  isRegenerating
}) => {
  // Component logic
  return (/* JSX */);
};
```

## 🎨 Styling

### Tailwind CSS

The project uses Tailwind CSS with custom CSS variables for theming:

```css
/* CSS Variables for dynamic theming */
--bg-primary: #0a0a0a;
--bg-secondary: #1a1a1a;
--text-primary: #ffffff;
--accent-orange: #fb923c;
/* ... more variables */
```

### Component Library

Uses **shadcn/ui** components:
- Pre-built, accessible components
- Customizable with Tailwind
- Based on Radix UI primitives

Add new components:
```bash
npx shadcn-ui@latest add [component-name]
```

## 🔐 Authentication

The application supports user authentication with:
- User profile management
- Session persistence
- Anonymous mode fallback
- Profile-based personalization

## 📱 Responsive Design

Fully responsive across all device sizes:
- **Mobile**: Optimized touch interactions, collapsible sidebar
- **Tablet**: Adaptive layouts
- **Desktop**: Full-featured experience

## 🚢 Building for Production

### Build Command

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Build Output

```
dist/
├── assets/           # Bundled JS, CSS
├── index.html       # Entry HTML
└── favicon.svg      # App icon
```

### Environment Variables

For production, set these environment variables:

```env
VITE_API_BASE_URL=https://api.yourproductiondomain.com
VITE_APP_NAME=AI Co-Founder
```

## 🐳 Docker Support

A Dockerfile is included for containerized deployment:

```bash
# Build Docker image
docker build -t ai-cofounder-frontend .

# Run container
docker run -p 5173:5173 ai-cofounder-frontend
```

## 🤝 Backend Integration

This frontend connects to the **ai-cofounder-backend** API. Key endpoints:

- `POST /api/conversations` - Create conversations
- `GET /api/conversations` - List conversations
- `POST /api/messages` - Send messages
- `GET /api/messages` - Retrieve messages
- `POST /api/openai/invoke` - AI chat completion
- `GET /api/profile` - User profile
- `PUT /api/profile` - Update profile

## 🔍 Key Technologies Explained

### Vite
Fast, modern build tool that provides:
- Instant server start
- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ES modules

### Radix UI
Unstyled, accessible components that provide:
- WAI-ARIA compliant
- Keyboard navigation
- Focus management
- Screen reader support

### Framer Motion
Production-ready animation library:
- Declarative animations
- Gesture recognition
- Layout animations
- Variants for complex sequences

## 📝 Configuration Files

### `vite.config.js`
- Path aliases (`@` for `src/`)
- Development server settings
- Build optimizations

### `tailwind.config.js`
- Custom theme configuration
- Plugin setup (animations, etc.)
- Content paths

### `tsconfig.json`
- TypeScript compiler options
- Path mappings
- Strict mode settings

### `components.json`
- shadcn/ui configuration
- Component style preferences
- Path aliases

## 🧪 Testing

*Testing setup can be added with:*

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

## 📈 Performance Optimizations

- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Strategic use of React.memo and useMemo
- **Optimized Images**: Proper image handling
- **Bundle Analysis**: Built-in Vite optimization

## 🔒 Security

- **Environment Variables**: Sensitive data in `.env`
- **API Authentication**: Token-based auth
- **Input Validation**: Zod schemas for data validation
- **XSS Protection**: React's built-in escaping
- **HTTPS**: Use HTTPS in production

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

*Add your license information here*

## 👥 Contributing

*Add contribution guidelines here*

## 📞 Support

For support and questions:
- Email: app@base44.com
- GitHub Issues: *Add your repo URL*

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ for coaches and entrepreneurs**
