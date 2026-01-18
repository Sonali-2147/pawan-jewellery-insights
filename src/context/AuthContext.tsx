import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthUser {
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem("authUser");
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    // Default user credentials
    const DEFAULT_EMAIL = "pawangold@gmail.com";
    const DEFAULT_PASSWORD = "pawangold@123";
    const DEFAULT_NAME = "Pawan Gold";

    if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
      const newUser: AuthUser = {
        name: DEFAULT_NAME,
        email: DEFAULT_EMAIL,
      };
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem("authUser", JSON.stringify(newUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
