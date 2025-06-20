import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth';
import { STORAGE_KEYS } from '../utils/constants';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      console.log('🔍 Login API response:', response.data);
      
      // Check if the response has the expected structure
      if (response.data && response.data.token && response.data.user) {
        console.log('✅ Setting auth data:', response.data.token, response.data.user);
        this.setAuthData(response.data.token, response.data.user);
      } else {
        console.error('❌ Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Login failed');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      console.log('🔍 Register API response:', response.data);
      
      // Check if the response has the expected structure
      if (response.data && response.data.token && response.data.user) {
        console.log('✅ Setting auth data:', response.data.token, response.data.user);
        this.setAuthData(response.data.token, response.data.user);
      } else {
        console.error('❌ Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Registration failed');
    }
  }

  async deleteAccount(userId: string): Promise<void> {
    try {
      await api.delete(`/auth/delete/${userId}`);
      this.clearAuthData();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Account deletion failed');
    }
  }

  logout(): void {
    this.clearAuthData();
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER);
      console.log('🔍 Getting user from localStorage:', userData);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Error parsing user data:', error);
      return null;
    }
  }

  getToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    console.log('🔍 Getting token from localStorage:', token ? 'Token exists' : 'No token');
    return token;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    const isAuth = !!(token && user && !this.isTokenExpired());
    console.log('🔍 Is authenticated:', isAuth, { token: !!token, user: !!user, expired: this.isTokenExpired() });
    return isAuth;
  }

  private setAuthData(token: string, user: User): void {
    console.log('🔍 Setting auth data:', { token, user });
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    // Verify it was stored
    setTimeout(() => {
      console.log('🔍 Verification - Token stored:', localStorage.getItem(STORAGE_KEYS.TOKEN));
      console.log('🔍 Verification - User stored:', localStorage.getItem(STORAGE_KEYS.USER));
    }, 10);
  }

  private clearAuthData(): void {
    console.log('🔍 Clearing auth data');
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Check if token is expired (basic check)
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      console.log('🔍 Token expiry check:', { expired: isExpired, exp: payload.exp, now: currentTime });
      return isExpired;
    } catch (error) {
      console.error('❌ Error checking token expiry:', error);
      return true;
    }
  }

  // Setup axios interceptor for automatic token attachment
  setupAxiosInterceptors(): void {
    // Request interceptor to add token
    api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && !this.isTokenExpired()) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log('🔍 401 error - logging out');
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}

export default new AuthService();