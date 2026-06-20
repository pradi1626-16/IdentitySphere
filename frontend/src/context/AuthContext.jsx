import { createContext, useContext, useState } from 'react';
import { USERS } from '../data/mockData';
import { seedIfNeeded } from '../services/storageService';

seedIfNeeded();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (email) => {
    const u = USERS[email];
    if (u) { setUser({ email, ...u }); return true; }
    return false;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
