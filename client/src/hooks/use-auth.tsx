import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "wouter";

type User = {
  id: number;
  username: string;
  role: string | null;
  fullName: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("auth_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("auth_user");
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real app, this would call an API endpoint
    
    // Mock login for demonstration
    if (username && password) {
      // Simulate successful login with mock user data
      const mockUser: User = {
        id: 1,
        username,
        role: username === "admin" ? "admin" : "user",
        fullName: username === "admin" ? "Administrator" : "Regular User",
      };

      setUser(mockUser);
      localStorage.setItem("auth_user", JSON.stringify(mockUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}