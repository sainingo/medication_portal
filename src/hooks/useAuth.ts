import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Create interfaces for login credentials and session data
interface LoginCredentials {
  username: string;
  password: string;
}

interface SessionData {
  authenticated: boolean;
  user: {
    uuid: string;
    display: string;
    username: string;
    // Add other user properties as needed
  };
  sessionLocation?: {
    uuid: string;
    display: string;
    // Add other location properties as needed
  };
  token: any
  // Include other properties from the OpenMRS session response
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Your OpenMRS instance base URL
  const OPENMRS_BASE_URL = 'https://ngx.ampath.or.ke/amrs';

  useEffect(() => {
    // Check for existing session
    const sessionData = sessionStorage.getItem('pharmacy_session');
    if (sessionData) {
      // Validate session with backend
      validateSession().then(isValid => {
        setIsAuthenticated(isValid);
        setIsLoading(false);
        if (!isValid) {
          navigate('/login');
        }
      });
    } else {
      setIsLoading(false);
    }
  }, [navigate]);

  const login = async ({ username, password }: LoginCredentials) => {
    try {
      // Authenticate against OpenMRS REST API
      const response = await fetch(`${OPENMRS_BASE_URL}/ws/rest/v1/session`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid credentials or server error');
      }

      const data: SessionData = await response.json();

      if (data.authenticated) {
        // Store the entire session data in sessionStorage
        sessionStorage.setItem('pharmacy_session', JSON.stringify({
          ...data,
          // Store the basic auth token for subsequent requests
          token: btoa(`${username}:${password}`)
        }));
        
        // Update authentication state
        setIsAuthenticated(true);
        
        return data; // Return the session data
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw the error to handle it in the component
    }
  };

  const logout = useCallback(() => {
    sessionStorage.removeItem('pharmacy_session');
    setIsAuthenticated(false);
    // Navigate directly here with a timeout to avoid state update issues
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 0);
  }, [navigate]);

  // const logout = () => {
  //   sessionStorage.removeItem('pharmacy_session');
  //   setIsAuthenticated(false);
  //   navigate('/login');
  // };

  const getSessionData = (): SessionData | null => {
    const sessionData = sessionStorage.getItem('pharmacy_session');
    return sessionData ? JSON.parse(sessionData) : null;
  };

  const getAuthHeader = (): { Authorization: string } | null => {
    const sessionData = getSessionData();
    return sessionData ? { Authorization: `Basic ${sessionData.token}` } : null;
  };

  const validateSession = async (): Promise<boolean> => {
    const sessionData = getSessionData();
    if (!sessionData) return false;

    try {
      const response = await fetch(`${OPENMRS_BASE_URL}/ws/rest/v1/session`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${sessionData.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return false;
      }

      const data: SessionData = await response.json();
      return data.authenticated;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  return { 
    isAuthenticated, 
    isLoading, 
    login, 
    logout, 
    getSessionData,
    getAuthHeader
  };
};