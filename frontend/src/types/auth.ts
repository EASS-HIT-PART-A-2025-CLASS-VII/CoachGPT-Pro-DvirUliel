export interface User {
    id: string;
    name: string;
    email: string;
    role?: string;
    createdAt?: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
  }
  
  export interface AuthResponse {
    status: string;
    token?: string;
    user: User;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
  }
  
  export interface LoginFormData {
    email: string;
    password: string;
  }
  
  export interface RegisterFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }