
import { useState, useEffect } from "react";
import { User } from "@/types";
import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/services/auth";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const setupAuthListener = async () => {
      try {
        console.log("Initializing auth state...");
        
        // Set up auth listener
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event);
            
            if (event === 'SIGNED_IN' && session) {
              try {
                const currentUser = await getCurrentUser();
                if (isMounted) {
                  setUser(currentUser);
                  setLoading(false);
                }
              } catch (error) {
                console.error("Error fetching user data:", error);
                if (isMounted) {
                  setUser(null);
                  setLoading(false);
                }
              }
            } else if (event === 'SIGNED_OUT') {
              if (isMounted) {
                setUser(null);
                setLoading(false);
              }
            }
          }
        );
        
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          try {
            const currentUser = await getCurrentUser();
            if (isMounted) {
              setUser(currentUser);
            }
          } catch (error) {
            console.error("Error fetching user from session:", error);
          }
        }
        
        if (isMounted) {
          setLoading(false);
        }
        
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth state initialization error:", error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    setupAuthListener();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    user,
    loading,
    setUser,
    setLoading
  };
}
