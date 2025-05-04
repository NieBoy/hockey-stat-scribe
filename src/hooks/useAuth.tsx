
import { createContext, useContext, ReactNode, useState } from "react";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
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
  
  const signIn = async (email: string, password: string) => {
    console.log("AuthProvider: Starting sign in process");
    setLoading(true);
    
    try {
      const result = await performSignIn(email, password);
      console.log("AuthProvider: Sign in result received", result.user ? "User found" : "No user", result.error ? `Error: ${result.error}` : "No error");
      
      if (result.user) {
        setUser(result.user);
        console.log("AuthProvider: User set, navigating to home");
        navigate("/");
      }
      
      return result;
    } catch (error) {
      console.error("AuthProvider: Unexpected error in signIn:", error);
      return { user: null, error: "An unexpected error occurred" };
    } finally {
      console.log("AuthProvider: Sign in process complete, resetting loading state");
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await performSignUp(email, password, name);
      
      if (result.success) {
        // Navigate after a short delay for better UX
        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      }
      
      return result;
    } catch (error) {
      console.error("AuthProvider: Unexpected error in signUp:", error);
      toast.error("Failed to create account");
      return { success: false, error: "An unexpected error occurred" };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await performSignOut();
      setUser(null);
      navigate("/signin");
    } catch (error) {
      console.error("AuthProvider: Error during sign out:", error);
      toast.error("Failed to sign out");
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
