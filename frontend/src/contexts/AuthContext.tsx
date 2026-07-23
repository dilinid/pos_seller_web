import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi } from '../apis/auth.api';

export interface UserProfile {
  name: string;
  email?: string;
  phone: string;
  memberId: string;
  joinDate: string;
  address: string;
  membershipType: 'Platinum' | 'Gold' | 'Silver';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (phoneOrEmail: string, password: string) => Promise<boolean>;
  register: (name: string, phone: string, password: string, email?: string, address?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  updateProfile: (fields: Partial<UserProfile>) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('member_session');
    if (session) {
      setUser(JSON.parse(session));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const response = await loginApi(username, password);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    setIsAuthenticated(true);
    return true;
  };

    
  const register = async (name: string, phone: string, _password: string, email?: string, address?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('member_users') || '[]');
        const cleanPhone = phone.trim();
        const cleanEmail = email ? email.trim().toLowerCase() : '';

        // Check if phone or email already registered
        const exists = users.some((u: any) => 
          u.phone === cleanPhone || 
          (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
        );

        if (exists) {
          resolve(false);
          return;
        }

        const newUser = {
          name,
          phone: cleanPhone,
          email: cleanEmail,
          address: address || '123 E-Commerce Way',
          memberId: `MB-${Math.floor(100000 + Math.random() * 900000)}`,
          joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          membershipType: 'Gold',
        };

        users.push(newUser);
        localStorage.setItem('member_users', JSON.stringify(users));
        resolve(true);
      }, 800);
    });
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const googleProfile: UserProfile = {
          name: 'Google Member',
          email: 'google.user@gmail.com',
          phone: '+1 (555) 901-2940',
          memberId: 'MB-990281',
          joinDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          address: '1600 Amphitheatre Pkwy, Mountain View, CA',
          membershipType: 'Platinum'
        };
        localStorage.setItem('member_session', JSON.stringify(googleProfile));
        setUser(googleProfile);
        setIsAuthenticated(true);
        resolve(true);
      }, 800);
    });
  };

  const updateProfile = async (fields: Partial<UserProfile>): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!user) {
        resolve(false);
        return;
      }
      
      const updatedProfile = { ...user, ...fields };
      setUser(updatedProfile);
      localStorage.setItem('member_session', JSON.stringify(updatedProfile));

      // Also update in registered user registry if standard login
      const users = JSON.parse(localStorage.getItem('member_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.phone === user.phone);
      if (userIndex > -1) {
        users[userIndex] = {
          ...users[userIndex],
          name: updatedProfile.name,
          phone: updatedProfile.phone,
          email: updatedProfile.email,
          address: updatedProfile.address,
        };
        localStorage.setItem('member_users', JSON.stringify(users));
      }
      resolve(true);
    });
  };

  const logout = () => {
    localStorage.removeItem('member_session');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, loginWithGoogle, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
