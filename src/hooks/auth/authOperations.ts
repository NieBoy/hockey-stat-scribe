
import { User } from "@/types";
import { signIn as apiSignIn, signOut as apiSignOut, signUp as apiSignUp } from "@/services/auth";
import { toast } from "sonner";

export async function performSignIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
  try {
    console.log("Signing in user:", email);
    
    // Convert email to lowercase for consistent authentication
    const normalizedEmail = email.toLowerCase();
    
    const result = await apiSignIn(normalizedEmail, password);
    
    if (result.error) {
      console.log("Sign in error:", result.error);
      toast.error(result.error);
    } else if (result.user) {
      console.log("User signed in successfully:", result.user.id);
      toast.success("Signed in successfully");
    }
    return result;
  } catch (error) {
    const errorMessage = "Failed to sign in";
    console.error("Sign in error:", error);
    toast.error(errorMessage);
    return { user: null, error: errorMessage };
  }
}

export async function performSignUp(email: string, password: string, name: string): Promise<{ success: boolean; error: string | null }> {
  try {
    console.log("Signing up user:", email);
    const result = await apiSignUp(email, password, name);
    
    if (result.error) {
      console.log("Sign up error:", result.error);
      toast.error(result.error);
    } else if (result.success) {
      console.log("User signed up successfully");
      toast.success("Account created! Please sign in");
    }
    return result;
  } catch (error) {
    console.error("Sign up error:", error);
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
    console.error("Sign out error:", error);
    toast.error("Failed to sign out");
  }
}
