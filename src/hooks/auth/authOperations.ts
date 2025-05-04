
import { User } from "@/types";
import { signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp } from "@/services/auth";
import { toast } from "sonner";

export async function performSignIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    console.log("AuthOperations: Performing sign in for user:", email);
    
    // Convert email to lowercase for consistent authentication
    const normalizedEmail = email.toLowerCase();
    
    // Perform the actual sign in request
    const result = await apiSignIn(normalizedEmail, password);
    
    if (result.error) {
      console.log("AuthOperations: Sign in error:", result.error);
      return result;
    } 
    
    if (result.user) {
      console.log("AuthOperations: User signed in successfully:", result.user.id);
      // Show success toast but don't block the flow - use setTimeout
      setTimeout(() => toast.success("Signed in successfully"), 100);
      return result;
    }
    
    // Fallback error handling
    console.error("AuthOperations: Sign in returned neither user nor error");
    return { user: null, error: "An unexpected error occurred during sign in" };
    
  } catch (error: any) {
    const errorMessage = error?.message || "Failed to sign in";
    console.error("AuthOperations: Sign in error:", error);
    return { user: null, error: errorMessage };
  }
}

export async function performSignUp(email: string, password: string, name: string): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log("AuthOperations: Signing up user:", email);
    const result = await apiSignUp(email, password, name);
    
    if (result.error) {
      console.log("AuthOperations: Sign up error:", result.error);
      toast.error(result.error);
    } else if (result.success) {
      console.log("AuthOperations: User signed up successfully");
      toast.success("Account created! Please sign in");
    }
    return result;
  } catch (error) {
    console.error("AuthOperations: Sign up error:", error);
    const errorMessage = "Failed to create account";
    toast.error(errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function performSignOut(): Promise<void> {
  try {
    await apiSignOut();
    toast.success("Signed out successfully");
  } catch (error) {
    console.error("AuthOperations: Sign out error:", error);
    toast.error("Failed to sign out");
  }
}
