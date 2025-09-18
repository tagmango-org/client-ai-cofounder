
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Bot, Library } from 'lucide-react';

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-orange-100 text-orange-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">AI Co-Founder</h1>
        </div>
        <nav className="flex flex-col gap-2">
          <NavLink to={createPageUrl('Chat')}>
            <Bot className="w-5 h-5" />
            <span>AI Chat</span>
          </NavLink>
          <NavLink to={createPageUrl('KnowledgeBase')}>
            <Library className="w-5 h-5" />
            <span>Knowledge Base</span>
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
