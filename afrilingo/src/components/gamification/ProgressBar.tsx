import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'emerald' | 'orange' | 'blue' | 'purple';
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  showPercentage = false,
  color = 'emerald',
  size = 'medium',
  animated = true
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  // Check if dark mode is enabled
  const isDark = document.documentElement.classList.contains('dark') || 
                document.body.classList.contains('bg-gray-900') ||
                true; // Default to dark mode

  const colorMap = {
    emerald: 'from-emerald-500 to-teal-600',
    orange: 'from-orange-500 to-red-600',
    blue: 'from-blue-500 to-indigo-600',
    purple: 'from-purple-500 to-pink-600'
  };

  const sizeMap = {
    small: 'h-2',
    medium: 'h-3',
    large: 'h-4'
  };

  const bgColorMap = {
    emerald: isDark ? 'bg-emerald-900/30' : 'bg-emerald-100',
    orange: isDark ? 'bg-orange-900/30' : 'bg-orange-100',
    blue: isDark ? 'bg-blue-900/30' : 'bg-blue-100',
    purple: isDark ? 'bg-purple-900/30' : 'bg-purple-100'
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div className={`relative w-full ${sizeMap[size]} ${bgColorMap[color]} rounded-full overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full">
            <pattern id={`progress-pattern-${color}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill={`url(#progress-pattern-${color})`} />
          </svg>
        </div>
        
        {/* Progress fill */}
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colorMap[color]} rounded-full`}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 0.8, ease: "easeOut" } : {}}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        
        {/* Value indicator (for large size only) */}
        {size === 'large' && percentage > 0 && (
          <motion.div
            className="absolute inset-y-0 flex items-center px-3"
            initial={animated ? { left: 0 } : { left: `calc(${percentage}% - 3rem)` }}
            animate={{ left: percentage > 90 ? `calc(${percentage}% - 3rem)` : `${percentage - 5}%` }}
            transition={animated ? { duration: 0.8, ease: "easeOut" } : {}}
          >
            <span className="text-xs font-semibold text-white drop-shadow-md">
              {value}/{max}
            </span>
          </motion.div>
        )}
      </div>
      
      {/* Additional info */}
      {size !== 'small' && (
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {value} / {max}
          </span>
          {percentage === 100 && (
            <motion.span
              className="text-xs font-medium text-emerald-600"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              Complete! ✨
            </motion.span>
          )}
        </div>
      )}
    </div>
  );
};

// Circular Progress Variant
export const CircularProgress: React.FC<{
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: 'emerald' | 'orange' | 'blue' | 'purple';
  showValue?: boolean;
}> = ({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = 'emerald',
  showValue = true
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  const colorMap = {
    emerald: 'url(#gradient-emerald)',
    orange: 'url(#gradient-orange)',
    blue: 'url(#gradient-blue)',
    purple: 'url(#gradient-purple)'
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id="gradient-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
          <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
          <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id="gradient-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <motion.div 
              className="text-2xl font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              {Math.round(percentage)}%
            </motion.div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {value}/{max}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};