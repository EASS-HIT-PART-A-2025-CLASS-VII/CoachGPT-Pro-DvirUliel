import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
// Pages
import LoginRegisterPage from './pages/LoginRegisterPage';
import HomePage from './pages/HomePage';
import WorkoutPlanPage from './pages/WorkoutPlanPage';
import ChatPage from './pages/ChatPage';
import ExerciseLibraryPage from './pages/ExerciseLibraryPage';
import PlanArchivePage from './pages/PlanArchivePage';
// Components
import Sidebar from './components/common/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';
// Auth
import AuthPage from './components/auth/AuthPage';
// Styles
import './styles/globals.css';

function App() {
  const authResult = useAuth();
  const { user, isLoading } = authResult;
  
  // Debug logs with more detail
  console.log('🔍 App render:', {
    user: user ? `${user.name} (${user.email})` : null,
    isLoading,
    hasUser: !!user,
    currentPath: window.location.pathname,
    authResult: authResult, // Log the whole object
    userObject: user // Log the actual user object
  });

  // Handle automatic logout redirect
  React.useEffect(() => {
    if (!isLoading && !user && window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      console.log('🔄 App - Redirecting to home due to no user');
      window.location.href = '/';
    }
  }, [user, isLoading]);

  if (isLoading) {
    console.log('🔄 App is loading...');
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Debug info */}
      <div className="fixed top-0 right-0 bg-black text-white text-xs p-2 z-50">
        User: {user ? 'Logged in' : 'Not logged in'} | Loading: {isLoading ? 'Yes' : 'No'}
      </div>
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#374151',
            color: '#f9fafb',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#f9fafb',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f9fafb',
            },
          },
        }}
      />
      
      <div className="flex">
        {/* Sidebar - only show when authenticated */}
        {user && <Sidebar />}
        
        {/* Main Content */}
        <div className={`flex-1 ${user ? 'lg:ml-64' : ''} transition-all duration-300`}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={user ? <Navigate to="/home" replace /> : <LoginRegisterPage />}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/home" replace /> : <AuthPage mode="login" />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/home" replace /> : <AuthPage mode="register" />}
            />
            
            {/* Protected Routes */}
            <Route
              path="/home"
              element={user ? <HomePage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/plan"
              element={user ? <WorkoutPlanPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/chat"
              element={user ? <ChatPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/exercises"
              element={user ? <ExerciseLibraryPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/archive"
              element={user ? <PlanArchivePage /> : <Navigate to="/" replace />}
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;