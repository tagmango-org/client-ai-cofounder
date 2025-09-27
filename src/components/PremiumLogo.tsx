import React from 'react';
import { motion } from 'framer-motion';

const PremiumLogo = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-5 h-5", 
    large: "w-8 h-8"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className} relative flex items-center justify-center flex-shrink-0`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Diamond/Spark Icon - refined for better visibility */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className="w-full h-full text-[var(--accent-orange)]"
        strokeWidth="2"
        stroke="currentColor"
      >
        <path 
          d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5L12 2Z" 
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
        />
      </svg>
    </motion.div>
  );
};

export default PremiumLogo;