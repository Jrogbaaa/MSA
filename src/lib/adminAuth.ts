// React imports for useEffect and useState
import { useEffect, useState } from 'react';

// Admin Authentication System
// Simple authentication for admin access with hardcoded credentials

interface AdminUser {
  username: string;
  role: 'admin';
  loginTime: Date;
}

// Admin credentials (in production, these would be securely stored)
const ADMIN_CREDENTIALS = {
  username: 'arnoldestatesmsa',
  password: '*#fhdncu^%!f'
};

// Admin session storage key
const ADMIN_SESSION_KEY = 'msa_admin_session';

export const authenticateAdmin = (username: string, password: string): boolean => {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    // Store admin session in localStorage
    const adminSession: AdminUser = {
      username: ADMIN_CREDENTIALS.username,
      role: 'admin',
      loginTime: new Date()
    };
    
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession));
    return true;
  }
  return false;
};

export const getAdminSession = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!sessionData) return null;
    
    const session: AdminUser = JSON.parse(sessionData);
    
    // Check if session is still valid (24 hours)
    const sessionTime = new Date(session.loginTime);
    const currentTime = new Date();
    const timeDiff = currentTime.getTime() - sessionTime.getTime();
    const hoursDiff = timeDiff / (1000 * 3600);
    
    if (hoursDiff > 24) {
      // Session expired, remove it
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting admin session:', error);
    return null;
  }
};

export const logoutAdmin = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
};

export const isAdminAuthenticated = (): boolean => {
  return getAdminSession() !== null;
};

// Admin route protection hook
export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAdmin = () => {
      const adminSession = getAdminSession();
      setIsAdmin(adminSession !== null);
      setIsLoading(false);
    };
    
    checkAdmin();
    
    // Check periodically for session changes
    const interval = setInterval(checkAdmin, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  return { isAdmin, isLoading };
}; 