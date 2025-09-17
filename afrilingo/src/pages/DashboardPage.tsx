import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { UserStats } from '../components/gamification/UserStats';
import { Icon } from '../utils/icons';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, LogOut } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { level, xp, streakDays } = useGameStore();

  const languages = [
    { 
      code: 'yoruba', 
      name: 'Yoruba', 
      nativeName: 'Yorùbá',
      icon: 'yorubaMask',
      progress: 35,
      lessonsCompleted: 7,
      totalLessons: 20
    },
    { 
      code: 'igbo', 
      name: 'Igbo', 
      nativeName: 'Igbo',
      icon: 'igboBird',
      progress: 15,
      lessonsCompleted: 3,
      totalLessons: 20
    },
    { 
      code: 'hausa', 
      name: 'Hausa', 
      nativeName: 'Hausa',
      icon: 'hausaStar',
      progress: 0,
      lessonsCompleted: 0,
      totalLessons: 20
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              AfriLingo Dashboard
            </h1>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <div className="cultural-card">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
              </h2>
              <p className="text-gray-600">
                Ready to continue your Nigerian language journey? 
                You're on a {streakDays} day streak!
              </p>
            </div>

            {/* Language Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Languages
              </h3>
              {languages.map((lang) => (
                <div 
                  key={lang.code} 
                  className="cultural-card hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/learn/${lang.code}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <Icon 
                        icon={lang.icon as keyof typeof import('../utils/icons').Icons} 
                        size="large" 
                        className="text-nigeria-green" 
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {lang.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {lang.nativeName}
                          </p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {lang.lessonsCompleted} of {lang.totalLessons} lessons
                          </span>
                          <span className="font-medium text-gray-900">
                            {lang.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-nigeria-green h-2 rounded-full transition-all duration-500"
                            style={{ width: `${lang.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="cultural-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 
                           transition-colors text-left"
                  onClick={() => navigate('/learn/yoruba')}
                >
                  <Icon icon="pronunciation" size="medium" className="text-nigeria-green mb-2" />
                  <h4 className="font-medium text-gray-900">Practice Speaking</h4>
                  <p className="text-sm text-gray-600">Work on pronunciation</p>
                </button>
                
                <button 
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 
                           transition-colors text-left"
                  onClick={() => navigate('/learn/yoruba')}
                >
                  <Icon icon="story" size="medium" className="text-nigeria-green mb-2" />
                  <h4 className="font-medium text-gray-900">Read Stories</h4>
                  <p className="text-sm text-gray-600">Learn through folklore</p>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UserStats />
            
            {/* Achievements Preview */}
            <div className="cultural-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {level >= 5 && (
                  <div className="flex items-center gap-3">
                    <Icon icon="achievement" size="medium" className="text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">Level 5 Master</p>
                      <p className="text-sm text-gray-600">Reached level 5</p>
                    </div>
                  </div>
                )}
                {streakDays >= 7 && (
                  <div className="flex items-center gap-3">
                    <Icon icon="streak" size="medium" className="text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900">Week Warrior</p>
                      <p className="text-sm text-gray-600">7 day streak</p>
                    </div>
                  </div>
                )}
                {xp >= 100 && (
                  <div className="flex items-center gap-3">
                    <Icon icon="xp" size="medium" className="text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Century Club</p>
                      <p className="text-sm text-gray-600">Earned 100 XP</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Goal */}
            <div className="cultural-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Daily Goal
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Complete 3 lessons to maintain your streak
              </p>
              <div className="flex justify-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="36"
                      stroke="#008751"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 36}`}
                      strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.33)}`}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold">1/3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;