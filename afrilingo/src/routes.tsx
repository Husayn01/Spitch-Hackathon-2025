import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

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
        <div className="w-8 h-8 border-4 border-nigeria-green border-t-transparent rounded-full animate-spin"></div>
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
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/learn/:language" element={<LearningPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};