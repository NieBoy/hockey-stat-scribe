import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/types";
import { getCurrentUser, signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp } from "@/services/auth";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  useEffect(() => {
    const handleAuthStateChange = async () => {
      try {
        setLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          
          if (location.pathname === '/signin' || location.pathname === '/signup') {
            navigate(location.state?.from?.pathname || "/", { replace: true });
          }
        }
        
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
              const currentUser = await getCurrentUser();
              setUser(currentUser);
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
            }
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    handleAuthStateChange();
  }, [navigate, location]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in user:", email);
      const result = await apiSignIn(email, password);
      
      if (result.error) {
        console.log("Sign in error:", result.error);
        toast.error(result.error);
      } else if (result.user) {
        setUser(result.user);
        console.log("User signed in successfully:", result.user.id);
        toast.success("Signed in successfully");
        
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
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
      console.log("Signing up user:", email);
      const result = await apiSignUp(email, password, name);
      
      if (result.error) {
        console.log("Sign up error:", result.error);
        toast.error(result.error);
      } else if (result.success) {
        console.log("User signed up successfully");
        toast.success("Account created! Please sign in");
        
        setTimeout(() => {
          navigate("/signin");
        }, 1500);
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
