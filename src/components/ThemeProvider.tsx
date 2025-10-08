import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    } else {
      // Default to dark theme
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <style>{`
        :root {
          /* Light theme variables */
          --bg-primary: #fafafa;
          --bg-secondary: #ffffff;
          --bg-tertiary: #f8fafc;
          --bg-hover: #e2e8f0;
          --bg-active: #e0e7ff;
          --bg-glass: rgba(255, 255, 255, 0.7);
          
          /* Text Colors */
          --text-primary: #1e293b;
          --text-secondary: #475569;
          --text-muted: #64748b;
          --text-inverse: #ffffff;
          
          /* Border Colors */
          --border-primary: #e2e8f0;
          --border-secondary: #cbd5e1;
          --border-subtle: #f1f5f9;
          
          /* Accent Colors - Enhanced for better visibility */
          --accent-orange: #f97316;
          --accent-orange-hover: #ea580c;
          --accent-orange-light: rgba(249, 115, 22, 0.25);
          --accent-orange-border: rgba(249, 115, 22, 0.5);
          
          /* Special Background Colors */
          --bg-discovery-button: rgba(139, 92, 246, 0.08);
          --bg-godmode-button: rgba(249, 115, 22, 0.08);
        }

        [data-theme="dark"] {
          /* Dark theme variables - Matte Black */
          --bg-primary: #0f0f23;
          --bg-secondary: #1a1a2e;
          --bg-tertiary: #16213e;
          --bg-hover: #252545;
          --bg-active: #2d3748;
          --bg-glass: rgba(255, 255, 255, 0.03);
          
          /* Text Colors */
          --text-primary: #f8fafc;
          --text-secondary: #cbd5e1;
          --text-muted: #94a3b8;
          --text-inverse: #0f172a;
          
          /* Border Colors */
          --border-primary: #334155;
          --border-secondary: #475569;
          --border-subtle: #1e293b;
          
          /* Accent Colors - Enhanced for better visibility */
          --accent-orange: #fb923c;
          --accent-orange-hover: #f97316;
          --accent-orange-light: rgba(251, 146, 60, 0.25);
          --accent-orange-border: rgba(251, 146, 60, 0.5);
          
          /* Special Background Colors */
          --bg-discovery-button: rgba(139, 92, 246, 0.12);
          --bg-godmode-button: rgba(251, 146, 60, 0.12);
        }
        
        /* Enhanced Reset and Base Styles */
        * {
          box-sizing: border-box;
        }

        html {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;
          font-size: 14px;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        body {
          margin: 0;
          padding: 0;
          background-color: var(--bg-primary);
          color: var(--text-primary);
          overflow-x: hidden;
          font-feature-settings: "kern" 1, "liga" 1;
        }

        /* Enhanced Scrollbar Styling */
        * {
          scrollbar-width: thin;
          scrollbar-color: var(--border-secondary) transparent;
        }

        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: var(--border-secondary);
          border-radius: 2px;
          transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--border-primary);
        }

        /* Enhanced Utility Classes */
        .bg-glass {
          background-color: var(--bg-glass);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .bg-hover {
          background-color: var(--bg-hover);
        }

        .bg-active {
          background-color: var(--bg-active);
        }

        .border-glass {
          border-color: var(--border-subtle);
        }

        .border-primary {
          border-color: var(--border-primary);
        }

        .border-secondary {
          border-color: var(--border-secondary);
        }

        /* Enhanced Transitions */
        .sleek-transition {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sleek-transition-fast {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .sleek-transition-slow {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .sleek-transition-bounce {
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        /* Enhanced Interactive States */
        .hover-lift:hover {
          transform: translateY(-1px);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-scale:hover {
          transform: scale(1.02);
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-dim:hover {
          opacity: 0.8;
          transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-glow:hover {
          box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
          transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced Focus States for Accessibility */
        button:focus-visible,
        input:focus-visible,
        textarea:focus-visible,
        [tabindex]:focus-visible {
          outline: 2px solid var(--accent-orange);
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Improved Selection Styling */
        ::selection {
          background-color: var(--accent-orange-light);
          color: var(--text-primary);
        }

        /* Enhanced Input Styling */
        input, textarea {
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
        }

        /* Remove default button styles */
        button {
          background: none;
          border: none;
          font-family: inherit;
          cursor: pointer;
          font-size: inherit;
        }

        /* Enhanced Backdrop Blur Support */
        .backdrop-blur-glass {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .backdrop-blur-subtle {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        /* Micro-interaction Classes */
        .button-press:active {
          transform: scale(0.98);
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .slide-up {
          animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Animation Keyframes */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Enhanced Typography Classes */
        .text-primary {
          color: var(--text-primary);
        }

        .text-secondary {
          color: var(--text-secondary);
        }

        .text-muted {
          color: var(--text-muted);
        }

        .text-accent {
          color: var(--accent-orange);
        }

        /* Improved Performance */
        .gpu-accelerated {
          transform: translateZ(0);
          will-change: transform;
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
};