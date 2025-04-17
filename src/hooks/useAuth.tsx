
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

  // Set up auth listener and check for existing session
  useEffect(() => {
    let subscription: any;

    // First check for existing session
    const checkSession = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log("Found existing session");
          const currentUser = await getCurrentUser();
          setUser(currentUser);
          
          // Redirect if on auth pages
          if (currentUser && (location.pathname === '/signin' || location.pathname === '/signup')) {
            const from = location.state?.from?.pathname || "/";
            navigate(from, { replace: true });
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };
    
    // Then set up the auth state change listener
    const setupAuthListener = async () => {
      const { data } = await supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event);
          
          if (event === 'SIGNED_OUT') {
            setUser(null);
            return;
          }
          
          if (session?.user) {
            // Use setTimeout to avoid any deadlocks
            setTimeout(async () => {
              const currentUser = await getCurrentUser();
              setUser(currentUser);
              
              // Redirect if on auth pages
              if (currentUser && (location.pathname === '/signin' || location.pathname === '/signup')) {
                const from = location.state?.from?.pathname || "/";
                navigate(from, { replace: true });
              }
            }, 0);
          }
        }
      );
      
      subscription = data.subscription;
    };
    
    checkSession();
    setupAuthListener();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate, location]);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await apiSignIn(email, password);
      if (result.error) {
        toast.error(result.error);
      } else if (result.user) {
        setUser(result.user);
        toast.success("Signed in successfully");
        
        // Redirect to intended destination or home
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
