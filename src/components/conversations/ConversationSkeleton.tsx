import React from 'react';
import { motion } from 'framer-motion';

const ConversationSkeleton = () => {
  return (
    <div className="space-y-2 p-2">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          className="h-9 w-full bg-[var(--bg-hover)] rounded-md"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            delay: index * 0.15 
          }}
        />
      ))}
    </div>
  );
};

export default ConversationSkeleton;