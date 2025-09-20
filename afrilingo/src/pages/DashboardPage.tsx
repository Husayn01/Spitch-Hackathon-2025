import React, { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { UserStats } from '../components/gamification/UserStats';
import { Icon } from '../utils/icons';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronRight, LogOut, Globe, TrendingUp, Calendar, 
  Trophy, Target, BookOpen, Sun, Moon, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardPage = () => {
  const { user, signOut } = useAuth();
  const { level, xp, streakDays } = useGameStore();
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const languages = [
    { 
      code: 'yoruba', 
      name: 'Yoruba', 
      nativeName: 'Yorùbá',
      icon: 'yorubaMask',
      progress: 35,
      lessonsCompleted: 7,
      totalLessons: 20,
      pattern: 'M10,10 L20,20 L30,10 L40,20',
      color: 'from-emerald-500 to-teal-600'
    },
    { 
      code: 'igbo', 
      name: 'Igbo', 
      nativeName: 'Igbo',
      icon: 'igboBird',
      progress: 15,
      lessonsCompleted: 3,
      totalLessons: 20,
      pattern: 'M15,15 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0',
      color: 'from-orange-500 to-red-600'
    },
    { 
      code: 'hausa', 
      name: 'Hausa', 
      nativeName: 'Hausa',
      icon: 'hausaStar',
      progress: 0,
      lessonsCompleted: 0,
      totalLessons: 20,
      pattern: 'M20,10 L30,20 L20,30 L10,20 Z',
      color: 'from-blue-500 to-indigo-600'
    }
  ];

  const recentAchievements = [
    { name: 'First Word', icon: '🎯', date: '2 days ago' },
    { name: 'Week Warrior', icon: '🔥', date: '1 week ago' },
    { name: 'Pronunciation Pro', icon: '🗣️', date: '2 weeks ago' }
  ];

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/';
  };

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full opacity-5">
          <defs>
            <pattern id="dashboard-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0,50 Q25,25 50,50 T100,50" stroke="currentColor" fill="none" strokeWidth="0.5"/>
              <circle cx="50" cy="50" r="20" stroke="currentColor" fill="none" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dashboard-pattern)" />
        </svg>
        <motion.div 
          className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-emerald-900/20 to-orange-900/20' : 'bg-gradient-to-br from-emerald-50 to-orange-50'}`}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className={`sticky top-0 z-50 ${isDark ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-lg border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <motion.button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileTap={{ scale: 0.9 }}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
              
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
              >
                <Globe className="w-8 h-8 text-emerald-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-orange-600 bg-clip-text text-transparent">
                  AfriLingo
                </h1>
              </motion.div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>
              
              <motion.button
                onClick={handleSignOut}
                className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                } transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={20} />
                Sign Out
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className={`md:hidden ${isDark ? 'bg-gray-800' : 'bg-white'} border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="container mx-auto px-4 py-4">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 py-2 w-full text-left"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Welcome Section */}
            <motion.div 
              className={`relative rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-hidden`}
              {...fadeInUp}
            >
              <svg className="absolute top-0 right-0 w-40 h-40 opacity-10 pointer-events-none">
                <pattern id="welcome-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                  <path d="M0,20 Q20,0 40,20 T40,20" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#welcome-pattern)" />
              </svg>

              <h2 className="text-2xl font-bold mb-2">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Ready to continue your Nigerian language journey? 
                You're on a <span className="font-semibold text-emerald-600">{streakDays} day streak!</span>
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Streak', value: `${streakDays} days`, icon: '🔥' },
                  { label: 'Level', value: level, icon: '🏆' },
                  { label: 'Total XP', value: xp, icon: '⚡' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className={`text-center p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <div className="text-2xl mb-1">{stat.icon}</div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Languages Section */}
            <motion.div
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              <h2 className="text-2xl font-bold mb-6">Your Languages</h2>
              <div className="space-y-4">
                {languages.map((lang, index) => (
                  <motion.div
                    key={lang.code}
                    className={`relative rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden cursor-pointer group`}
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleNavigate(`/learn/${lang.code}`)}
                  >
                    {/* Background Pattern */}
                    <svg className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                      <pattern id={`lang-pattern-${index}`} x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d={lang.pattern} stroke="currentColor" strokeWidth="1" fill="none" />
                      </pattern>
                      <rect width="100%" height="100%" fill={`url(#lang-pattern-${index})`} />
                    </svg>

                    <div className="flex items-center justify-between relative">
                      <div className="flex items-center gap-4">
                        <motion.div
                          className={`w-16 h-16 rounded-full bg-gradient-to-br ${lang.color} flex items-center justify-center text-white text-2xl`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon icon={lang.icon as any} size="large" />
                        </motion.div>
                        
                        <div>
                          <h3 className="text-xl font-bold mb-1">{lang.name}</h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {lang.lessonsCompleted} of {lang.totalLessons} lessons completed
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                        <motion.div
                          className={`h-full bg-gradient-to-r ${lang.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${lang.progress}%` }}
                          transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                      <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {lang.progress}% complete
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Stats Component */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <UserStats />
            </motion.div>

            {/* Recent Achievements */}
            <motion.div
              className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <span className="font-medium">{achievement.name}</span>
                    </div>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {achievement.date}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { icon: BookOpen, label: 'Continue Learning', action: '/learn/yoruba' },
                  { icon: Target, label: 'Practice Pronunciation', action: '/learn/yoruba' },
                  { icon: Calendar, label: 'View Progress', action: '/dashboard' }
                ].map((action, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleNavigate(action.action)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                    } transition-colors`}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <action.icon className="w-5 h-5 text-emerald-600" />
                    <span>{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;