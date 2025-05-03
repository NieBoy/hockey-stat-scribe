
import { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/services/auth";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth listener first
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          try {
            console.log("User signed in, fetching user data");
            const currentUser = await getCurrentUser();
            
            if (mounted) {
              setUser(currentUser);
              setLoading(false);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
            if (mounted) {
              setUser(null);
              setLoading(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            console.log("User signed out, clearing user state");
            setUser(null);
            setLoading(false);
          }
        }
      }
    );
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          try {
            const currentUser = await getCurrentUser();
            if (mounted) {
              setUser(currentUser);
            }
          } catch (error) {
            console.error("Error fetching user from session:", error);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    checkSession();
    
    return () => {
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
