// src/utils/authService.ts
import { AxiosInstance } from 'axios';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  authenticated: boolean;
  user: {
    uuid: string;
    display: string;
    username: string;
  };
  sessionLocation?: {
    uuid: string;
    display: string;
  };
  token: string;
}

// Storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

/**
 * Authentication service for OpenMRS
 */
export const authService = {
  /**
   * Login user with credentials
   */
  async login(credentials: LoginCredentials, baseUrl: string): Promise<LoginResponse> {
    const response = await fetch(`${baseUrl}/ws/rest/v1/session`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Invalid credentials or server error');
    }

    const data = await response.json();
    
    if (data.authenticated) {
      const token = btoa(`${credentials.username}:${credentials.password}`);
      
      // Store token in sessionStorage (more secure than localStorage for auth tokens)
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      
      // Store user data separately (optional)
      sessionStorage.setItem(USER_DATA_KEY, JSON.stringify(data.user));
      
      return {
        ...data,
        token
      };
    } else {
      throw new Error('Authentication failed');
    }
  },

  /**
   * Get stored authentication token
   */
  getAuthToken(): string | null {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  },

  /**
   * Get stored user data
   */
  getUserData(): any {
    const userData = sessionStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Configure an axios instance with authentication
   */
  configureAxios(axiosInstance: AxiosInstance): void {
    axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Basic ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  },

  /**
   * Logout user
   */
  logout(): void {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(USER_DATA_KEY);
    // Clear any other auth-related data as needed
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
};