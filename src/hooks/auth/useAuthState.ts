
import { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/services/auth";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log("AuthState: Setting up auth state listener");
    
    // Set up auth listener first - follow Supabase best practices
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("AuthState: Auth state changed:", event);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' && session) {
          console.log("AuthState: User signed in, fetching user data");
          // Don't call setLoading(true) here to avoid state conflicts
          
          // Use a safe async pattern - don't make this the callback directly
          const fetchUser = async () => {
            try {
              const currentUser = await getCurrentUser();
              
              if (mounted) {
                console.log("AuthState: User data fetched:", currentUser?.id);
                setUser(currentUser);
                setLoading(false);
              }
            } catch (error) {
              console.error("AuthState: Error fetching user data:", error);
              if (mounted) {
                setUser(null);
                setLoading(false);
              }
            }
          };
          
          // Schedule this separately to avoid Supabase deadlock
          setTimeout(fetchUser, 0);
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            console.log("AuthState: User signed out, clearing user state");
            setUser(null);
            setLoading(false);
          }
        }
      }
    );
    
    // Check for existing session
    const checkSession = async () => {
      try {
        console.log("AuthState: Checking for existing session");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("AuthState: Found existing session, fetching user data");
          try {
            const currentUser = await getCurrentUser();
            if (mounted) {
              console.log("AuthState: User data fetched from session:", currentUser?.id);
              setUser(currentUser);
            }
          } catch (error) {
            console.error("AuthState: Error fetching user from session:", error);
          }
        } else {
          console.log("AuthState: No existing session found");
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("AuthState: Error checking session:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    // Run session check
    checkSession();
    
    return () => {
      console.log("AuthState: Cleaning up auth state listener");
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    loading,
    setUser,
    setLoading
  };
}
