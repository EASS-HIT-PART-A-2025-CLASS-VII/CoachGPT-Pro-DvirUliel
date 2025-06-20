import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  id: string;
  path: string;
  icon: string;
  label: string;
  color: string;
}

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    { id: 'plan', path: '/plan', icon: '🏋️', label: 'Workout Plan', color: 'text-blue-500' },
    { id: 'chat', path: '/chat', icon: '🤖', label: 'AI Coach', color: 'text-purple-500' },
    { id: 'exercises', path: '/exercises', icon: '📚', label: 'Exercise Library', color: 'text-green-500' },
    { id: 'archive', path: '/archive', icon: '🗂️', label: 'Plan Archive', color: 'text-orange-500' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-lg p-2 shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          width: isCollapsed ? 64 : 256,
          // Fixed: Show on desktop always, only hide on mobile when closed
          x: window.innerWidth >= 1024 ? 0 : (isMobileOpen ? 0 : -256)
        }}
        className="fixed left-0 top-0 h-full bg-white shadow-xl z-50 border-r border-gray-200"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              {/* Logo */}
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold">🏋️</span>
              </div>
              
              {/* Brand Text */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-3 overflow-hidden"
                  >
                    <h1 className="text-lg font-bold text-gray-800">
                      Coach<span className="text-orange-500">GPT</span>
                    </h1>
                    <p className="text-xs text-gray-500">Pro</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Collapse Button - Desktop only */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="ml-auto p-1 rounded-md hover:bg-gray-100 transition-colors hidden lg:block"
              >
                <svg 
                  className={`w-5 h-5 text-gray-500 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg group relative ${
                    isActive(item.path) ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                  }`}
                >
                  {/* Active Indicator */}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r"
                    />
                  )}

                  {/* Icon */}
                  <span className="text-xl flex-shrink-0">{item.icon}</span>

                  {/* Label */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="ml-3 font-medium overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Section */}
          <div className="border-t border-gray-200 p-4">
            {/* User Info */}
            <div className={`flex items-center mb-3 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-3 overflow-hidden"
                  >
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className={`w-full flex items-center text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors p-2 rounded-lg group ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <span className="text-lg">🚪</span>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-3 font-medium overflow-hidden"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-16 bottom-8 bg-gray-900 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;