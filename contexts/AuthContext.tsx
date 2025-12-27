import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  email?: string;
}

export interface LoginRecord {
  userId: string;
  username: string;
  timestamp: string;
  ipAddress?: string;
  sessionId: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loginHistory: LoginRecord[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded credentials for local development
const VALID_USERS = {
  admin: { password: 'SafeArch2024!', role: 'admin' as UserRole, email: 'admin@safe-arch.local' },
  user1: { password: 'User123456!', role: 'user' as UserRole, email: 'operator1@safe-arch.local' },
  user2: { password: 'User123456!', role: 'user' as UserRole, email: 'operator2@safe-arch.local' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('safe-arch-auth');
    const history = localStorage.getItem('safe-arch-login-history');
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (e) {
        console.error('Failed to parse stored auth:', e);
      }
    }
    
    if (history) {
      try {
        setLoginHistory(JSON.parse(history));
      } catch (e) {
        console.error('Failed to parse login history:', e);
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    // Simulate async backend call
    await new Promise(resolve => setTimeout(resolve, 300));

    const userConfig = VALID_USERS[username as keyof typeof VALID_USERS];
    
    if (!userConfig || userConfig.password !== password) {
      throw new Error('Invalid username or password');
    }

    const newUser: User = {
      id: `user-${username}-${Date.now()}`,
      username,
      role: userConfig.role,
      email: userConfig.email,
    };

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Add login record
    const loginRecord: LoginRecord = {
      userId: newUser.id,
      username,
      timestamp: new Date().toISOString(),
      sessionId,
    };

    const updatedHistory = [loginRecord, ...loginHistory];
    
    // Persist to localStorage
    localStorage.setItem('safe-arch-auth', JSON.stringify(newUser));
    localStorage.setItem('safe-arch-session-id', sessionId);
    localStorage.setItem('safe-arch-login-history', JSON.stringify(updatedHistory));

    setUser(newUser);
    setLoginHistory(updatedHistory);
  };

  const logout = () => {
    localStorage.removeItem('safe-arch-auth');
    localStorage.removeItem('safe-arch-session-id');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loginHistory }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
