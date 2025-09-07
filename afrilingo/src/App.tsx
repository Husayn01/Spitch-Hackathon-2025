import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes';
import { AuthProvider } from './contexts/AuthContext';
// Remove the App.css import - we're using Tailwind

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster 
            position="top-center"
            toastOptions={{
              className: 'font-nigerian',
              style: {
                background: '#008751',
                color: '#fff',
              },
            }}
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;