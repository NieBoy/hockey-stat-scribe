
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { getCurrentUser, signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp } from "@/services/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Set up auth listener
  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid any potential deadlocks
          setTimeout(async () => {
            const user = await getCurrentUser();
            setUser(user);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );
    
    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await apiSignIn(email, password);
      if (result.error) {
        toast.error(result.error);
      } else if (result.user) {
        setUser(result.user);
        toast.success("Signed in successfully");
        navigate("/");
      }
      return result;
    } catch (error) {
      const errorMessage = "Failed to sign in";
      console.error("Sign in error:", error);
      toast.error(errorMessage);
      return { user: null, error: errorMessage };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await apiSignUp(email, password, name);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success("Account created! Please sign in");
        navigate("/signin");
      }
      return result;
    } catch (error) {
      console.error("Sign up error:", error);
      const errorMessage = "Failed to create account";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
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
