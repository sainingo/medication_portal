// src/context/authContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useLogin } from "../api/useLogin";
import { authService, LoginResponse } from "../utils/authService";

interface User {
  uuid: string;
  display: string;
  username: string;
  roles?: any[];
  person?: any;
  email?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  login: (username: string, password: string) => Promise<LoginResponse>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const loginMutation = useLogin();
  
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Use auth service to check for existing session
      const authToken = authService.getAuthToken();
      const userData = authService.getUserData();
      
      if (authToken && userData) {
        try {
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to restore authentication:", error);
          authService.logout();
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  const login = async (username: string, password: string) => {
    try {
      const response = await loginMutation.mutateAsync({ username, password });
      
      // User data is already stored in session storage by authService
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };
  
  const logout = () => {
    console.log("AuthProvider - Logging out...");
    authService.logout();
    setUser(null);
    sessionStorage.removeItem('pickup_location_name');
    setIsAuthenticated(false);
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated }}>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}