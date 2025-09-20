import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Users, Zap, Trophy, Star, ChevronRight, Menu, X, 
  Sun, Moon, Volume2, MessageCircle, Book, Heart, Play
} from 'lucide-react';

// Theme Context
const ThemeContext = React.createContext({ isDark: false, toggleTheme: () => {} });

const HomePage = () => {
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Update active section based on scroll
      const sections = ['hero', 'features', 'languages', 'how-it-works', 'testimonials'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const languages = [
    { 
      code: 'yoruba', 
      name: 'Yoruba', 
      nativeName: 'Yorùbá',
      learners: '15K+',
      pattern: 'M10,10 L20,20 L30,10 L40,20', // Simplified Adire pattern
      color: 'from-emerald-500 to-teal-600'
    },
    { 
      code: 'igbo', 
      name: 'Igbo', 
      learners: '12K+',
      pattern: 'M15,15 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0', // Uli-inspired circles
      color: 'from-orange-500 to-red-600'
    },
    { 
      code: 'hausa', 
      name: 'Hausa',
      learners: '10K+',
      pattern: 'M20,10 L30,20 L20,30 L10,20 Z', // Geometric pattern
      color: 'from-blue-500 to-indigo-600'
    }
  ];

  const features = [
    { 
      icon: Volume2, 
      title: 'Native Speaker Audio', 
      desc: 'Learn authentic pronunciation from native speakers',
      animation: 'hover:scale-105'
    },
    { 
      icon: MessageCircle, 
      title: 'AI Conversations', 
      desc: 'Practice real dialogues with our cultural AI assistant',
      animation: 'hover:rotate-6'
    },
    { 
      icon: Trophy, 
      title: 'Gamified Learning', 
      desc: 'Earn cowrie shells and unlock cultural achievements',
      animation: 'hover:-rotate-6'
    },
    { 
      icon: Book, 
      title: 'Cultural Stories', 
      desc: 'Immerse yourself in traditional folktales and wisdom',
      animation: 'hover:scale-105'
    }
  ];

  const testimonials = [
    {
      name: "Adaeze O.",
      role: "Nigerian-American",
      text: "Finally, I can connect with my roots and speak Igbo with my grandparents!",
      rating: 5
    },
    {
      name: "Tunde K.",
      role: "Language Enthusiast",
      text: "The pronunciation practice is incredible. It's like having a personal tutor.",
      rating: 5
    },
    {
      name: "Amina B.",
      role: "Heritage Learner",
      text: "AfriLingo makes learning Hausa fun and culturally authentic.",
      rating: 5
    }
  ];

  // Navigation function for login button
  const handleGetStarted = () => {
    // In the real app, this would use React Router's navigate
    window.location.href = '/login';
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={`min-h-screen transition-colors duration-500 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      }`}>
        {/* Animated Background Pattern */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute w-full h-full opacity-5">
            <defs>
              <pattern id="african-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M0,50 Q25,25 50,50 T100,50" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                <circle cx="50" cy="50" r="20" stroke="currentColor" fill="none" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#african-pattern)" />
          </svg>
          <motion.div 
            className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-emerald-900/20 to-orange-900/20' : 'bg-gradient-to-br from-emerald-50 to-orange-50'}`}
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        {/* Navigation */}
        <motion.nav 
          className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            scrollY > 50 
              ? `${isDark ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-lg shadow-lg` 
              : 'bg-transparent'
          }`}
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe className="w-8 h-8 text-emerald-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-orange-600 bg-clip-text text-transparent">
                  AfriLingo
                </span>
              </motion.div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-8">
                {['Features', 'Languages', 'How It Works', 'Testimonials'].map((item) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(' ', '-')}`}
                    className={`relative font-medium transition-colors ${
                      activeSection === item.toLowerCase().replace(' ', '-')
                        ? 'text-emerald-600'
                        : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                    }`}
                    whileHover={{ y: -2 }}
                  >
                    {item}
                    {activeSection === item.toLowerCase().replace(' ', '-') && (
                      <motion.div
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-600"
                        layoutId="navbar-indicator"
                      />
                    )}
                  </motion.a>
                ))}
                <motion.button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </motion.button>
                <motion.button 
                  onClick={handleGetStarted}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-medium"
                  whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Started
                </motion.button>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                whileTap={{ scale: 0.9 }}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className={`md:hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="container mx-auto px-6 py-4 space-y-4">
                  {['Features', 'Languages', 'How It Works', 'Testimonials'].map((item) => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase().replace(' ', '-')}`}
                      className="block py-2 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item}
                    </a>
                  ))}
                  <button 
                    onClick={() => {
                      handleGetStarted();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-medium"
                  >
                    Get Started
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* Hero Section */}
        <section id="hero" className="min-h-screen flex items-center relative pt-20">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">Trusted by 40K+ diaspora learners</span>
                </motion.div>
                
                <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                  <motion.span 
                    className="block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    Connect with
                  </motion.span>
                  <motion.span 
                    className="block bg-gradient-to-r from-emerald-600 via-teal-600 to-orange-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Your Roots
                  </motion.span>
                </h1>

                <motion.p 
                  className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                  {...fadeInUp}
                  transition={{ delay: 0.3 }}
                >
                  Master Yoruba, Igbo, and Hausa through immersive cultural experiences, 
                  native speaker audio, and AI-powered conversations.
                </motion.p>

                <motion.div 
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button 
                    onClick={handleGetStarted}
                    className="group px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-semibold text-lg flex items-center gap-2 justify-center"
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Learning Free
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                  <motion.button 
                    className={`px-8 py-4 rounded-full font-semibold text-lg border-2 flex items-center gap-2 justify-center ${
                      isDark 
                        ? 'border-gray-600 hover:bg-gray-800' 
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </motion.button>
                </motion.div>
              </motion.div>

              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative w-full h-[500px]">
                  {/* Animated Language Cards */}
                  {languages.map((lang, index) => (
                    <motion.div
                      key={lang.code}
                      className={`absolute w-64 h-80 rounded-2xl p-6 shadow-2xl cursor-pointer ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                      }`}
                      style={{
                        left: `${index * 30}%`,
                        top: `${index * 10}%`,
                        zIndex: 3 - index
                      }}
                      whileHover={{ 
                        scale: 1.05,
                        rotate: index === 1 ? 5 : -5,
                        zIndex: 10
                      }}
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        y: {
                          duration: 3 + index,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }
                      }}
                    >
                      <div className={`h-full flex flex-col justify-between bg-gradient-to-br ${lang.color} rounded-xl p-6 text-white`}>
                        <div>
                          <svg className="w-12 h-12 mb-4 opacity-50">
                            <path d={lang.pattern} stroke="currentColor" strokeWidth="2" fill="none" />
                          </svg>
                          <h3 className="text-2xl font-bold mb-1">{lang.name}</h3>
                          <p className="text-sm opacity-90">{lang.nativeName}</p>
                        </div>
                        <div>
                          <p className="text-3xl font-bold mb-2">{lang.learners}</p>
                          <p className="text-sm opacity-90">Active Learners</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronRight className="w-6 h-6 rotate-90" />
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Learn Authentically,
                <span className="bg-gradient-to-r from-emerald-600 to-orange-600 bg-clip-text text-transparent">
                  {' '}Connect Deeply
                </span>
              </h2>
              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Experience Nigerian languages as they're meant to be learned
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`group relative p-8 rounded-2xl ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } shadow-lg hover:shadow-2xl transition-all duration-300`}
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                >
                  <motion.div 
                    className={`w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 ${feature.animation}`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{feature.desc}</p>
                  
                  {/* Decorative Pattern */}
                  <svg className="absolute top-4 right-4 w-20 h-20 opacity-5">
                    <pattern id={`pattern-${index}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                      <circle cx="20" cy="20" r="2" fill="currentColor" />
                      <path d="M0,20 Q20,0 40,20 T80,20" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                    </pattern>
                    <rect width="100%" height="100%" fill={`url(#pattern-${index})`} />
                  </svg>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Languages Section */}
        <section id="languages" className="py-20">
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Choose Your
                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {' '}Heritage Language
                </span>
              </h2>
              <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Start your journey with any of Nigeria's major languages
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {languages.map((lang, index) => (
                <motion.div
                  key={lang.code}
                  className="relative group"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <motion.div
                    className={`relative h-96 rounded-3xl overflow-hidden cursor-pointer ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    } shadow-xl`}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${lang.color} opacity-90`} />
                    
                    {/* Pattern Overlay */}
                    <svg className="absolute inset-0 w-full h-full opacity-10">
                      <pattern id={`lang-pattern-${index}`} x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                        <path d={lang.pattern} stroke="white" strokeWidth="1" fill="none" />
                      </pattern>
                      <rect width="100%" height="100%" fill={`url(#lang-pattern-${index})`} />
                    </svg>

                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-between p-8 text-white">
                      <div>
                        <motion.h3 
                          className="text-3xl font-bold mb-2"
                          whileHover={{ x: 10 }}
                          transition={{ type: "spring" }}
                        >
                          {lang.name}
                        </motion.h3>
                        <p className="text-xl opacity-90 mb-4">{lang.nativeName}</p>
                        <div className="flex items-center gap-2 mb-6">
                          <Users className="w-5 h-5" />
                          <span>{lang.learners} Active Learners</span>
                        </div>
                      </div>
                      
                      <motion.button 
                        onClick={handleGetStarted}
                        className="w-full py-3 bg-white/20 backdrop-blur-sm rounded-full font-semibold flex items-center justify-center gap-2 group/btn"
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
                      >
                        Start Learning
                        <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>

                    {/* Hover Effect */}
                    <motion.div
                      className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Your Journey to
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {' '}Fluency
                </span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: 1, title: "Choose Your Path", desc: "Select your heritage language and set your learning goals" },
                { step: 2, title: "Learn & Practice", desc: "Engage with interactive lessons, stories, and native speakers" },
                { step: 3, title: "Connect & Grow", desc: "Join the community and use your skills in real conversations" }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="relative"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <div className="text-center">
                    <motion.div
                      className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl font-bold ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ type: "spring" }}
                    >
                      {item.step}
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>{item.desc}</p>
                  </div>
                  
                  {index < 2 && (
                    <div className="hidden md:block absolute top-10 left-full w-full">
                      <svg className="w-full h-2">
                        <line 
                          x1="0" y1="4" x2="100%" y2="4" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeDasharray="5,5"
                          className="text-gray-300"
                        />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Loved by the
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {' '}Diaspora
                </span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className={`p-8 rounded-2xl ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                  } shadow-lg`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <p className={`mb-6 text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold`}>
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div 
              className={`relative rounded-3xl overflow-hidden ${
                isDark ? 'bg-gray-800' : 'bg-gradient-to-br from-emerald-50 to-teal-50'
              } p-12 md:p-20`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {/* Background Pattern */}
              <svg className="absolute inset-0 w-full h-full opacity-5">
                <pattern id="cta-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <circle cx="50" cy="50" r="40" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                  <path d="M50,10 L90,50 L50,90 L10,50 Z" stroke="currentColor" fill="none" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#cta-pattern)" />
              </svg>

              <div className="relative text-center max-w-3xl mx-auto">
                <motion.h2 
                  className="text-4xl md:text-5xl font-bold mb-6"
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                >
                  Ready to Reconnect with Your Heritage?
                </motion.h2>
                <p className={`text-xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Join thousands of diaspora learners mastering their mother tongue
                </p>
                
                <motion.div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button 
                    onClick={handleGetStarted}
                    className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full font-semibold text-lg flex items-center gap-2"
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Free Today
                    <Heart className="w-5 h-5" />
                  </motion.button>
                  <motion.button 
                    className={`px-10 py-4 rounded-full font-semibold text-lg border-2 ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Learn More
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-emerald-600" />
                <span className="font-bold text-xl">AfriLingo</span>
              </div>
              
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                © 2024 AfriLingo. Empowering the diaspora through language.
              </p>
              
              <div className="flex gap-6">
                <a href="#" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Privacy
                </a>
                <a href="#" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Terms
                </a>
                <a href="#" className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeContext.Provider>
  );
};

export default HomePage;