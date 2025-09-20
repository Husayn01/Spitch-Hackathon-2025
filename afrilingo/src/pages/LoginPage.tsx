import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';
import { motion } from 'framer-motion';
import { Globe, Mail, Lock, Eye, EyeOff, ChevronRight, Sun, Moon } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        showToast.success('Account created! Please check your email to verify.');
      } else {
        await signIn(email, password);
        showToast.success('Welcome back!');
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      showToast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full opacity-5">
          <defs>
            <pattern id="auth-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0,50 Q25,25 50,50 T100,50" stroke="currentColor" fill="none" strokeWidth="0.5"/>
              <circle cx="50" cy="50" r="20" stroke="currentColor" fill="none" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-pattern)" />
        </svg>
        <motion.div 
          className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-emerald-900/20 to-orange-900/20' : 'bg-gradient-to-br from-emerald-50 to-orange-50'}`}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Theme Toggle */}
      <motion.button
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 p-2 rounded-full z-50 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>

      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md w-full space-y-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <motion.div 
            className="text-center"
            {...fadeInUp}
          >
            <div className="flex justify-center mb-6">
              <motion.div
                className={`w-20 h-20 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Globe className="w-10 h-10 text-emerald-600" />
              </motion.div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-orange-600 bg-clip-text text-transparent">
              {isSignUp ? 'Join AfriLingo' : 'Welcome Back'}
            </h2>
            <p className={`mt-2 text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {isSignUp ? 'Start your Nigerian language journey' : 'Continue your learning journey'}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form 
            className="mt-8 space-y-6" 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-2xl shadow-xl space-y-6`}>
              {/* Cultural Pattern Overlay */}
              <svg className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                <pattern id="form-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="2" fill="currentColor" />
                  <path d="M0,20 Q20,0 40,20 T40,20" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#form-pattern)" />
              </svg>

              {/* Email Input */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-200
                      ${isDark 
                        ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-600'}
                      focus:outline-none focus:ring-4 focus:ring-emerald-500/20`}
                    placeholder="you@example.com"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 rounded-xl border-2 transition-all duration-200
                      ${isDark 
                        ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-600'}
                      focus:outline-none focus:ring-4 focus:ring-emerald-500/20`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="group relative w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl
                         hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/30
                         disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <motion.div 
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Loading...
                    </>
                  ) : (
                    <>
                      {isSignUp ? 'Create Account' : 'Sign In'}
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </motion.button>

              {/* Toggle Auth Mode */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                >
                  {isSignUp 
                    ? 'Already have an account? ' 
                    : "Don't have an account? "}
                  <span className="font-semibold text-emerald-600 hover:underline">
                    {isSignUp ? 'Sign in' : 'Sign up'}
                  </span>
                </button>
              </div>
            </div>
          </motion.form>

          {/* Features */}
          <motion.div 
            className="grid grid-cols-3 gap-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {[
              { icon: '🗣️', text: 'Native Speakers' },
              { icon: '🎮', text: 'Gamified' },
              { icon: '🌍', text: 'Cultural' }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;