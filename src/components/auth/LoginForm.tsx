
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormProps {
  onShowDemoForm: () => void;
}

export const LoginForm = ({ onShowDemoForm }: LoginFormProps) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("LoginForm: Form submitted, setting loading state");
    setFormLoading(true);
    setError(null);

    try {
      const lowercaseEmail = email.toLowerCase();
      console.log("LoginForm: Signing in with:", lowercaseEmail);
      
      const result = await signIn(lowercaseEmail, password);
      console.log("LoginForm: Sign in result received", result);
      
      if (result.error) {
        console.log("LoginForm: Error received:", result.error);
        // Display more helpful error message
        if (result.error.includes("Email not confirmed")) {
          setError("Your email hasn't been confirmed. Please check your inbox or use the demo account option below.");
        } else if (result.error.includes("Invalid login credentials")) {
          setError("Invalid email or password. If you haven't registered yet, please sign up first.");
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      console.error("LoginForm: Unexpected error during login:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      // Always reset loading state, regardless of what happened
      console.log("LoginForm: Resetting loading state");
      setFormLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="name@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={formLoading}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link 
              to="/forgot-password" 
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={formLoading}
          />
        </div>
      </div>
      <div className="flex flex-col space-y-4 mt-4">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={formLoading}
        >
          {formLoading ? (
            <>
              <span className="animate-spin mr-2">○</span>
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
        <div className="flex flex-col space-y-2 w-full">
          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-50 px-2 text-muted-foreground">or</span>
            </div>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onShowDemoForm}
            className="w-full mt-2"
            disabled={formLoading}
          >
            Create Demo Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </form>
  );
};
