
import { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/services/auth";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    console.log("Setting up auth state listener");
    
    // Set up auth listener first
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === 'SIGNED_IN' && session) {
          console.log("User signed in, fetching user data");
          setLoading(true);
          try {
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
        console.log("Checking for existing session");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Found existing session, fetching user data");
          try {
            const currentUser = await getCurrentUser();
            if (mounted) {
              setUser(currentUser);
            }
          } catch (error) {
            console.error("Error fetching user from session:", error);
          }
        } else {
          console.log("No existing session found");
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
      console.log("Cleaning up auth state listener");
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
