import { Link } from 'react-router-dom';

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
              className="btn-nigeria inline-flex items-center justify-center"
            >
              Start Learning Free
              <span className="ml-2">🚀</span>
            </Link>
            <Link 
              to="/dashboard"
              className="px-6 py-3 bg-white text-nigeria-green font-semibold rounded-lg 
                       border-2 border-nigeria-green hover:bg-gray-50 transition-colors
                       inline-flex items-center justify-center"
            >
              Explore Languages
              <span className="ml-2">🌍</span>
            </Link>
          </div>
        </div>

        {/* Language Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          {['Yoruba', 'Igbo', 'Hausa'].map((lang) => (
            <div key={lang} className="cultural-card hover:transform hover:scale-105 transition-transform">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{lang}</h3>
              <p className="text-gray-600 mb-4">
                {lang === 'Yoruba' && 'Learn the melodic tonal language of Southwest Nigeria'}
                {lang === 'Igbo' && 'Master the rich language of Southeast Nigeria'}
                {lang === 'Hausa' && 'Discover the widely spoken language of Northern Nigeria'}
              </p>
              <div className="text-3xl mb-4">
                {lang === 'Yoruba' && '🎭'}
                {lang === 'Igbo' && '🦅'}
                {lang === 'Hausa' && '🐪'}
              </div>
              <Link 
                to={`/learn/${lang.toLowerCase()}`}
                className="text-nigeria-green font-semibold hover:underline"
              >
                Start Learning →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;