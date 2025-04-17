
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { getCurrentUser, signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await apiSignIn(email, password);
      if (result.error) {
        toast.error(result.error);
        return result;
      }
      
      setUser(result.user);
      toast.success("Signed in successfully");
      navigate("/");
      return result;
    } catch (error) {
      console.error("Sign in error:", error);
      const errorMessage = "Failed to sign in";
      toast.error(errorMessage);
      return { user: null, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const success = await apiSignUp(email, password, name);
      if (!success) {
        toast.error("Failed to create account");
        return false;
      }
      
      toast.success("Account created! Please sign in");
      navigate("/signin");
      return true;
    } catch (error) {
      console.error("Sign up error:", error);
      toast.error("Failed to create account");
      return false;
    }
  };

  const signOut = async () => {
    try {
      await apiSignOut();
      setUser(null);
      toast.success("Signed out successfully");
      navigate("/signin");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
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
