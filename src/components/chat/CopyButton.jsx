
import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CopyButton({ textToCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 sleek-transition bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] backdrop-blur-sm border border-[var(--border-secondary)] rounded-lg p-2 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-xs">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span className="text-xs">Copy</span>
        </>
      )}
    </motion.button>
  );
}
