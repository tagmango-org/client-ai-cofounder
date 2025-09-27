# TypeScript Development Guide

## 🎯 Priority Fixes (High Impact, Low Effort)

### 1. Fix AppUserContext Interface
The `AppUserProfile` interface needs more properties:

```typescript
// src/components/AppUserContext.tsx
interface AppUserProfile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  userId?: string;
  profilePic?: string;
  profile?: any; // Can be refined later
  // Add other properties as you discover them
}

interface TagMangoUser {
  id: string;
  _id?: string; // Add this for compatibility
  email: string;
  name?: string;
  // Add other properties as needed
}
```

### 2. Add Message and Conversation Types
Create `src/types/index.ts`:

```typescript
export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp?: Date;
  // Add other message properties
}

export interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
  createdAt?: Date;
  // Add other conversation properties
}
```

### 3. Fix State Initialization
Instead of `useState([])`, use:

```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [conversations, setConversations] = useState<Conversation[]>([]);
```

## 🛠️ Development Workflow

### Commands
```bash
# Start development with type checking in separate terminal
npm run dev              # Main development server
npm run type-check       # Check types (run in separate terminal)

# Build for production
npm run build

# Lint code
npm run lint
```

### IDE Setup
- **VS Code**: Install TypeScript extension (usually built-in)
- **Enable**: "TypeScript › Preferences: Include Package Json Auto Imports"
- **Set**: "TypeScript › Preferences: Import Module Specifier" to "relative"

## 🔧 Fixing Common Patterns

### 1. Event Handlers
```typescript
// Before (JS)
const handleChange = (e) => {
  setValue(e.target.value);
};

// After (TS)
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

### 2. Component Props
```typescript
// Create interfaces for component props
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, disabled, className }) => {
  // component implementation
};
```

### 3. API Responses
```typescript
// Define API response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
}

// Usage
const fetchUser = async (id: string): Promise<ApiResponse<UserData>> => {
  // implementation
};
```

## 📈 Incremental Improvement Strategy

### Week 1: Core Types
- [ ] Fix AppUserContext interfaces
- [ ] Add Message/Conversation types
- [ ] Fix state initialization in main components

### Week 2: Component Props
- [ ] Add props interfaces for custom components
- [ ] Fix event handler types
- [ ] Add proper return types for functions

### Week 3: API & Utils
- [ ] Type API response interfaces
- [ ] Add proper types to utility functions
- [ ] Fix any remaining `any` types

### Week 4: Strict Mode
- [ ] Enable strict mode in tsconfig.json
- [ ] Fix remaining strict mode errors
- [ ] Add comprehensive JSDoc comments

## 🎨 UI Component Types (shadcn/ui)

The UI components from shadcn/ui can be gradually typed. For now, you can:

1. **Ignore UI component errors**: They don't affect functionality
2. **Use `// @ts-ignore`** for problematic UI component lines if needed
3. **Gradually add proper interfaces** when you have time

## 🚨 Common Gotchas

1. **Import paths**: Use `@/` prefix for src imports
2. **Event types**: Use React's built-in event types
3. **Ref types**: Use `useRef<HTMLElement | null>(null)`
4. **State types**: Always specify generic types for useState
5. **Props spreading**: Be careful with `...props` - define proper interfaces

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite TypeScript Guide](https://vitejs.dev/guide/features.html#typescript)
