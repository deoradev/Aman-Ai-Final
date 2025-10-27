import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthContextType {
  currentUser: string | null;
  login: (identifier: string) => void;
  logout: () => void;
  getScopedKey: (key: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('amandigitalcare-currentUser');
  });

  const login = (identifier: string) => {
    localStorage.setItem('amandigitalcare-currentUser', identifier);
    setCurrentUser(identifier);
    // In a real app, you might migrate anonymous data to the new user profile here.
  };

  const logout = () => {
    localStorage.removeItem('amandigitalcare-currentUser');
    setCurrentUser(null);
  };

  const getScopedKey = (key: string): string => {
    const scope = currentUser || 'anonymous';
    return `amandigitalcare-user-${scope}-${key}`;
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, getScopedKey }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};