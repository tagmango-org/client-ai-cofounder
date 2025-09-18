import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Star } from 'lucide-react';

const PhaseCompletionCelebration = ({ isVisible, onComplete, phaseTitle }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Confetti Animation */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-orange-hover)] rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -10,
                    rotate: 0,
                    scale: Math.random() * 0.5 + 0.5,
                  }}
                  animate={{
                    y: window.innerHeight + 10,
                    rotate: 360,
                    x: Math.random() * window.innerWidth,
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    ease: "easeOut",
                  }}
                />
              ))}
              
              {/* Stars */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: 0,
                    rotate: 0,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: 180,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: Math.random() * 0.5,
                  }}
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Main Celebration Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: -50 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] rounded-2xl p-8 mx-4 max-w-md text-center shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 10 }}
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
              
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl font-bold text-[var(--text-primary)] mb-2"
              >
                Phase Complete! 🎉
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-[var(--text-secondary)] mb-4"
              >
                You've successfully completed <span className="font-semibold text-[var(--accent-orange)]">{phaseTitle}</span>
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-1 text-[var(--accent-orange)]"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Great progress!</span>
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PhaseCompletionCelebration;