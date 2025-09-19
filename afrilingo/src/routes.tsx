import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Icon } from './utils/icons';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LearningPage = lazy(() => import('./pages/LearningPage'));

// Loading component with Nigerian theme
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-flex items-center space-x-2">
        <Icon icon="loading" size="large" className="animate-spin text-nigeria-green" />
        <span className="text-lg font-medium text-gray-700">E duro...</span>
        <span className="text-sm text-gray-500">(Loading...)</span>
      </div>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/learn/:language" 
          element={
            <ProtectedRoute>
              <LearningPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};