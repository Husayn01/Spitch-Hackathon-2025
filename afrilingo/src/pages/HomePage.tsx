import { Link } from 'react-router-dom';
import { Rocket, Globe } from 'lucide-react';
import { Icon } from '../utils/icons';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn Nigerian Languages with
            <span className="text-nigeria-green"> AfriLingo</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with your roots through interactive lessons, cultural stories, and AI-powered conversations
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login"
              className="btn-nigeria inline-flex items-center justify-center gap-2"
            >
              Start Learning Free
              <Rocket size={20} />
            </Link>
            <Link 
              to="/dashboard"
              className="px-6 py-3 bg-white text-nigeria-green font-semibold rounded-lg 
                       border-2 border-nigeria-green hover:bg-gray-50 transition-colors
                       inline-flex items-center justify-center gap-2"
            >
              Explore Languages
              <Globe size={20} />
            </Link>
          </div>
        </div>

        {/* Language Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          {[
            { 
              name: 'Yoruba', 
              description: 'Learn the melodic tonal language of Southwest Nigeria',
              icon: 'yorubaMask'
            },
            { 
              name: 'Igbo', 
              description: 'Master the rich language of Southeast Nigeria',
              icon: 'igboBird'
            },
            { 
              name: 'Hausa', 
              description: 'Discover the widely spoken language of Northern Nigeria',
              icon: 'hausaStar'
            }
          ].map((lang) => (
            <div key={lang.name} className="cultural-card hover:transform hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{lang.name}</h3>
              <p className="text-gray-600 mb-4">{lang.description}</p>
              <div className="mb-4">
                <Icon icon={lang.icon as keyof typeof import('../utils/icons').Icons} size="xlarge" className="text-nigeria-green" />
              </div>
              <Link 
                to={`/learn/${lang.name.toLowerCase()}`}
                className="text-nigeria-green font-semibold hover:underline inline-flex items-center gap-1"
              >
                Start Learning 
                <Icon icon="next" size="small" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;