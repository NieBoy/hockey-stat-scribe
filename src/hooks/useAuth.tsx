
import { createContext, useContext, ReactNode } from "react";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/auth/useAuthState";
import { performSignIn, performSignUp, performSignOut } from "@/hooks/auth/authOperations";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, setUser, setLoading } = useAuthState();
  const navigate = useNavigate();
  
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await performSignIn(email, password);
      
      if (result.user) {
        setUser(result.user);
        navigate("/");
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const result = await performSignUp(email, password, name);
    
    if (result.success) {
      // Navigate after a short delay for better UX
      setTimeout(() => {
        navigate("/signin");
      }, 1500);
    }
    
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await performSignOut();
      setUser(null);
      navigate("/signin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
