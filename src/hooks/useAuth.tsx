
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { User } from "@/types";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from "@/hooks/auth/useAuthState";
import { performSignIn, performSignUp, performSignOut } from "@/hooks/auth/authOperations";
import { toast } from "sonner";

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
  const location = useLocation();
  const [navigating, setNavigating] = useState(false);
  
  console.log(`AuthProvider: Current state - user: ${user?.id || 'null'}, loading: ${loading}, path: ${location.pathname}, navigating: ${navigating}`);
  
  // Handle automatic redirects based on auth state
  useEffect(() => {
    // Skip redirect during initial loading or when already navigating
    if (loading || navigating) {
      console.log(`AuthProvider: Skip redirect - loading: ${loading}, navigating: ${navigating}`);
      return;
    }
    
    // If user is authenticated and on a login/signup page, redirect to home
    if (user && ["/signin", "/signup"].includes(location.pathname)) {
      console.log("AuthProvider: User authenticated, redirecting from auth page to home");
      setNavigating(true);
      navigate("/", { replace: true });
      // Reset navigating flag after navigation completes
      setTimeout(() => setNavigating(false), 50);
    }
  }, [user, loading, location.pathname, navigate, navigating]);
  
  const signIn = async (email: string, password: string) => {
    console.log("AuthProvider: Starting sign in process");
    setLoading(true);
    
    try {
      const result = await performSignIn(email, password);
      console.log("AuthProvider: Sign in result received", result);
      
      if (result.user) {
        console.log("AuthProvider: Sign in successful, setting user");
        setUser(result.user);
        
        // Immediately flag we're navigating to prevent useEffect redirect race conditions
        setNavigating(true);
        
        // Schedule navigation with minimal delay to ensure it happens after state updates
        setTimeout(() => {
          console.log("AuthProvider: Navigating to home after successful sign in");
          navigate("/", { replace: true });
          // Loading state will be managed by useAuthState after navigation
          setTimeout(() => setNavigating(false), 50);
        }, 10);
        
        // Return the result
        return result;
      }
      
      // Only for error cases, we reset loading here
      if (result.error) {
        console.log("AuthProvider: Sign in error, resetting loading state");
        setLoading(false);
      }
      
      return result;
    } catch (error) {
      console.error("AuthProvider: Unexpected error in signIn:", error);
      setLoading(false);
      return { user: null, error: "An unexpected error occurred" };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const result = await performSignUp(email, password, name);
      
      if (result.success) {
        // Set navigating flag to prevent redirect race conditions
        setNavigating(true);
        
        // Schedule navigation
        setTimeout(() => {
          navigate("/signin", { replace: true });
          setTimeout(() => setNavigating(false), 50);
        }, 10);
      }
      
      setLoading(false);
      return result;
    } catch (error) {
      console.error("AuthProvider: Unexpected error in signUp:", error);
      setLoading(false);
      toast.error("Failed to create account");
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await performSignOut();
      setUser(null);
      
      // Set navigating flag to prevent redirect race conditions
      setNavigating(true);
      
      // Schedule navigation
      setTimeout(() => {
        navigate("/signin", { replace: true });
        setTimeout(() => {
          setNavigating(false);
          setLoading(false);
        }, 50);
      }, 10);
    } catch (error) {
      console.error("AuthProvider: Error during sign out:", error);
      setLoading(false);
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
