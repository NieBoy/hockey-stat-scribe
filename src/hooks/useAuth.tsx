
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
  
  console.log(`AuthProvider: Current state - user: ${user?.id || 'null'}, loading: ${loading}, path: ${location.pathname}`);
  
  // Handle automatic redirects based on auth state
  useEffect(() => {
    // Skip redirect during initial loading
    if (loading) {
      console.log("AuthProvider: Skip redirect during loading");
      return;
    }
    
    // If user is authenticated and on a login/signup page, redirect to home
    if (user && ["/signin", "/signup"].includes(location.pathname)) {
      console.log("AuthProvider: User authenticated, redirecting from auth page to home");
      navigate("/", { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);
  
  const signIn = async (email: string, password: string) => {
    console.log("AuthProvider: Starting sign in process");
    setLoading(true);
    
    try {
      const result = await performSignIn(email, password);
      console.log("AuthProvider: Sign in result received", result);
      
      if (result.user) {
        console.log("AuthProvider: Sign in successful, setting user and redirecting");
        setUser(result.user);
        
        // Immediately navigate on success
        navigate("/", { replace: true });
        
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
        // Navigate immediately after success
        navigate("/signin", { replace: true });
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
      navigate("/signin", { replace: true });
      setLoading(false);
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
