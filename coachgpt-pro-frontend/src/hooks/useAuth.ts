import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import { User, LoginRequest, RegisterRequest } from '../types/auth';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Add instance tracking
  const instanceId = React.useRef(Math.random().toString(36).substr(2, 9));
  console.log(`🔍 useAuth [${instanceId.current}] - Hook instance created/called`);

  // Function to refresh auth state from localStorage
  const refreshAuthState = useCallback(() => {
    console.log('🔄 useAuth - Refreshing auth state...');
    const currentUser = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    const tokenExpired = authService.isTokenExpired();
    
    console.log('🔍 useAuth - Refresh check:', {
      currentUser,
      isAuthenticated,
      tokenExpired
    });
    
    if (isAuthenticated && currentUser && !tokenExpired) {
      console.log('✅ useAuth - Setting user from refresh:', currentUser);
      setUser(currentUser);
      return currentUser;
    } else {
      console.log('❌ useAuth - Clearing user from refresh');
      setUser(null);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 useAuth - Starting initialization...');
      console.log('🔍 useAuth - Initial state:', { user, isLoading });
      
      try {
        const currentUser = authService.getCurrentUser();
        const isAuthenticated = authService.isAuthenticated();
        const tokenExpired = authService.isTokenExpired();
        
        console.log('🔍 useAuth - Auth check:', {
          currentUser,
          isAuthenticated,
          tokenExpired
        });
        
        if (isAuthenticated && currentUser && !tokenExpired) {
          console.log('✅ useAuth - Setting user:', currentUser);
          setUser(currentUser);
        } else {
          console.log('❌ useAuth - Clearing auth data');
          authService.logout();
          setUser(null);
        }
      } catch (error) {
        console.error('❌ useAuth - Error initializing auth:', error);
        authService.logout();
        setUser(null);
      } finally {
        console.log('🔍 useAuth - Setting isLoading to false');
        setIsLoading(false);
      }
    };

    initializeAuth();
    
    // Setup axios interceptors
    authService.setupAxiosInterceptors();
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log(`🔍 useAuth [${instanceId.current}] - State changed:`, {
      user: user ? `${user.name} (${user.email})` : null,
      isLoading,
      isAuthenticated: !!user
    });
  }, [user, isLoading]);

  // Watch for user changes and verify consistency
  useEffect(() => {
    if (user) {
      const storedUser = authService.getCurrentUser();
      const isAuth = authService.isAuthenticated();
      console.log('🔍 useAuth - User state verification:', {
        stateUser: user.email,
        storedUser: storedUser?.email,
        isAuthenticated: isAuth,
        consistent: user.email === storedUser?.email
      });
    }
  }, [user]);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🚀 useAuth - Starting login...');
      const response = await authService.login(credentials);
      console.log('✅ useAuth - Login response:', response);
      
      // Set user state directly from response
      console.log('🔍 useAuth - Setting user state:', response.user);
      setUser(response.user);
      
      toast.success('Login successful!');
      
      // Use setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        console.log('🔍 useAuth - Delayed navigation to /plan');
        // Try window.location instead of navigate
        window.location.href = '/plan';
      }, 100);
      
    } catch (error: any) {
      console.error('❌ useAuth - Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (userData: RegisterRequest): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('🚀 useAuth - Starting registration...');
      const response = await authService.register(userData);
      console.log('✅ useAuth - Registration response:', response);
      
      setUser(response.user);
      toast.success('Registration successful! Welcome to CoachGPT Pro!');
      navigate('/plan');
    } catch (error: any) {
      console.error('❌ useAuth - Registration error:', error);
      toast.error(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    try {
      console.log('🚀 useAuth - Starting logout...');
      console.log('🔍 useAuth - Current user before logout:', user);
      
      authService.logout();
      console.log('✅ useAuth - authService.logout() completed');
      
      setUser(null);
      console.log('✅ useAuth - setUser(null) completed');
      
      toast.success('Logged out successfully');
      console.log('🔍 useAuth - Navigating to /');
      
      // Force navigation to home and reload
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ useAuth - Logout error:', error);
      // Force logout even if there's an error
      setUser(null);
      window.location.href = '/';
    }
  }, [user]);

  const deleteAccount = useCallback(async (): Promise<void> => {
    if (!user) return;
    setIsLoading(true);
    try {
      await authService.deleteAccount(user.id);
      setUser(null);
      toast.success('Account deleted successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, navigate]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    deleteAccount,
  };
};