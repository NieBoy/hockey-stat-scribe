
import { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/services/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  hasNavigated: boolean;
}

export function useAuthState() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    hasNavigated: false
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Update state helper function to avoid repeating setState logic
  const updateState = (updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Mark that navigation has been handled
  const setHasNavigated = (value: boolean) => {
    updateState({ hasNavigated: value });
  };

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount
    
    const handleAuthStateChange = async () => {
      try {
        console.log("Initializing auth state...");
        if (isMounted) updateState({ loading: true });
        
        // Set up the auth listener before checking session
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event);
            
            if (event === 'SIGNED_IN' && session) {
              console.log("User signed in, fetching user data");
              try {
                const currentUser = await getCurrentUser();
                if (isMounted) updateState({ user: currentUser });
                
                // Prevent navigation loops by tracking if we've already navigated
                if ((location.pathname === '/signin' || location.pathname === '/signup') && !state.hasNavigated) {
                  console.log("Auth state change - will navigate away from auth page");
                  const destination = location.state?.from?.pathname || "/";
                  
                  // Use setTimeout to break potential circular dependencies
                  setTimeout(() => {
                    if (isMounted) {
                      console.log("Navigating to:", destination);
                      navigate(destination, { replace: true });
                      setHasNavigated(true);
                    }
                  }, 0);
                }
              } catch (error) {
                console.error("Error fetching user after sign in:", error);
                if (isMounted) updateState({ user: null, loading: false });
              }
            } else if (event === 'SIGNED_OUT') {
              console.log("User signed out, clearing user state");
              if (isMounted) updateState({ user: null, hasNavigated: false });
            }
            
            // Always update loading state when auth events complete
            if (isMounted) updateState({ loading: false });
          }
        );
        
        // Then check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Session found during initialization");
          try {
            const currentUser = await getCurrentUser();
            if (isMounted) updateState({ user: currentUser });
            
            // Only redirect if we're on auth pages and not already navigated
            if ((location.pathname === '/signin' || location.pathname === '/signup') && !state.hasNavigated) {
              setHasNavigated(true);
              const destination = location.state?.from?.pathname || "/";
              console.log("Auth session found, redirecting to:", destination);
              navigate(destination, { replace: true });
            }
          } catch (error) {
            console.error("Error fetching user from session:", error);
            if (isMounted) updateState({ user: null });
          } finally {
            if (isMounted) updateState({ loading: false });
          }
        } else {
          console.log("No session found during initialization");
          if (isMounted) updateState({ loading: false });
        }
        
        return () => {
          console.log("Cleaning up auth listener");
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth state change error:', error);
        if (isMounted) updateState({ user: null, loading: false });
      }
    };

    handleAuthStateChange();
    
    return () => {
      isMounted = false; // Prevent state updates after component unmounts
    };
  }, [navigate, location]);

  return { 
    user: state.user,
    loading: state.loading,
    hasNavigated: state.hasNavigated,
    setHasNavigated
  };
}
