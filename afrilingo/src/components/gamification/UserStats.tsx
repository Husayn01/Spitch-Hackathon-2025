import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Icon } from '../../utils/icons';
import { Flame, Trophy, Star, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserStatsProps {
  compact?: boolean;
}

export const UserStats: React.FC<UserStatsProps> = ({ compact = false }) => {
  const { level, xp, xpToNextLevel, streakDays, totalCowries, achievements } = useGameStore();
  const progressPercentage = (xp / xpToNextLevel) * 100;
  
  // Check if dark mode is enabled - this would typically come from a context
  const isDark = document.documentElement.classList.contains('dark') || 
                document.body.classList.contains('bg-gray-900') ||
                true; // Default to dark mode

  if (compact) {
    return (
      <motion.div 
        className={`flex items-center gap-4 px-4 py-2 rounded-xl ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="font-semibold">{streakDays}</span>
        </motion.div>
        <div className="w-px h-4 bg-gray-600" />
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-semibold">Lv {level}</span>
        </motion.div>
        <div className="w-px h-4 bg-gray-600" />
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <Icon icon="cowrieShell" size="small" className="text-emerald-500" />
          <span className="font-semibold">{totalCowries}</span>
        </motion.div>
      </motion.div>
    );
  }

  const stats = [
    { 
      icon: Trophy, 
      label: 'Level', 
      value: level, 
      color: 'text-yellow-500',
      bgColor: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'
    },
    { 
      icon: Flame, 
      label: 'Streak', 
      value: `${streakDays} days`, 
      color: 'text-orange-500',
      bgColor: isDark ? 'bg-orange-500/20' : 'bg-orange-100'
    },
    { 
      icon: Star, 
      label: 'Total XP', 
      value: xp.toLocaleString(), 
      color: 'text-purple-500',
      bgColor: isDark ? 'bg-purple-500/20' : 'bg-purple-100'
    },
    { 
      icon: 'cowrieShell', 
      label: 'Cowries', 
      value: totalCowries, 
      color: 'text-emerald-500',
      bgColor: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100',
      isCustomIcon: true
    }
  ];

  return (
    <motion.div 
      className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Your Progress
        </h3>
        <motion.div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
          }`}
          whileHover={{ scale: 1.05 }}
        >
          {achievements.length} Achievements
        </motion.div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            XP Progress
          </span>
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {xp} / {xpToNextLevel}
          </span>
        </div>
        <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {xpToNextLevel - xp} XP to level {level + 1}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                {stat.isCustomIcon ? (
                  <Icon icon={stat.icon as any} size="small" className={stat.color} />
                ) : (
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                )}
              </div>
              <div>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className="font-bold text-lg">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Motivational Message */}
      <motion.div 
        className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-emerald-50'} border ${
          isDark ? 'border-gray-600' : 'border-emerald-200'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
            Daily Goal
          </span>
        </div>
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {streakDays > 0 
            ? `Amazing! Keep your ${streakDays} day streak going!` 
            : 'Complete a lesson today to start your streak!'}
        </p>
      </motion.div>
    </motion.div>
  );
};