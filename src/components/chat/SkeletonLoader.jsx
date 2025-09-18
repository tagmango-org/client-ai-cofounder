import React from 'react';
import { motion } from 'framer-motion';
import PremiumLogo from '../PremiumLogo';

const SkeletonLoader = () => {
  const SkeletonBar = ({ width, delay, opacity = [0.3, 0.6, 0.3] }) => (
    <motion.div
      className={`h-4 bg-[var(--bg-hover)] rounded ${width}`}
      animate={{ opacity }}
      transition={{ duration: 2, repeat: Infinity, delay }}
    />
  );

  const UserSkeletonBubble = ({ delay, children }) => (
    <div className="flex justify-end mb-4">
      <motion.div
        className="max-w-[60%] bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-2xl px-4 py-2.5 space-y-2"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, delay }}
      >
        {children}
      </motion.div>
    </div>
  );
  
  const AISkeletonBubble = ({ delay, children }) => (
    <div className="flex gap-3 mb-6">
      <div className="flex-shrink-0 mt-1">
        <motion.div
          className="w-5 h-5 flex items-center justify-center"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay }}
        >
          <PremiumLogo size="small" className="opacity-30" />
        </motion.div>
      </div>
      <div className="flex-1 space-y-3">
        {children}
      </div>
    </div>
  );

  return (
    <div className="flex-1 w-full h-full flex flex-col">
      <div className="flex-1 max-w-4xl mx-auto p-6 w-full">
        <div className="space-y-6 h-full flex flex-col justify-end">
          
          <AISkeletonBubble delay={0}>
            <SkeletonBar width="w-4/5" delay={0.2} />
            <SkeletonBar width="w-3/5" delay={0.4} />
          </AISkeletonBubble>

          <UserSkeletonBubble delay={0.6}>
            <SkeletonBar width="w-32" delay={0.8} opacity={[0.5, 0.8, 0.5]} />
          </UserSkeletonBubble>

          <AISkeletonBubble delay={1.0}>
            <SkeletonBar width="w-5/6" delay={1.2} />
            <SkeletonBar width="w-2/3" delay={1.4} />
            <div className="flex gap-2 pt-2">
                <motion.div 
                  className="h-8 bg-[var(--bg-hover)] rounded-lg w-24"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.6 }}
                />
                <motion.div 
                  className="h-8 bg-[var(--bg-hover)] rounded-lg w-20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.8 }}
                />
              </div>
          </AISkeletonBubble>

        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;