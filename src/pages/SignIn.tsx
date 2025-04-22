
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoName, setDemoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoForm, setShowDemoForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn(email, password);
      if (result.error) {
        // Display more helpful error message
        if (result.error.includes("Email not confirmed")) {
          setError("Your email hasn't been confirmed. Please check your inbox or use the demo account option below.");
        } else if (result.error.includes("Invalid login credentials")) {
          setError("Invalid email or password. If you haven't registered yet, please sign up first.");
        } else {
          setError(result.error);
        }
      }
      // The redirect is handled in the useAuth hook
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createDemoAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!demoName || !email || !password) {
      setError("Please fill in all fields to create a demo account.");
      return;
    }
    
    setDemoLoading(true);
    setError(null);
    
    try {
      // Call the edge function to create a demo user with pre-confirmed email
      const { data, error } = await supabase.functions.invoke('create-demo-user', {
        body: {
          email,
          password,
          name: demoName
        }
      });
      
      if (error) {
        setError(`Error: ${error.message}`);
        console.error("Demo account creation error:", error);
        return;
      }
      
      if (data && data.error) {
        setError(data.error);
        console.error("Demo account creation error:", data.error);
        return;
      }
      
      if (data && data.alreadyExists) {
        toast.info("Account already exists. Signing you in...");
      } else {
        toast.success("Demo account created successfully! Signing you in...");
      }
      
      // Sign in with the account credentials
      const result = await signIn(email, password);
      if (result.error) {
        setError("Account exists but couldn't sign in automatically: " + result.error);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred creating the demo account.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <PenTool className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to sign in to your account
          </CardDescription>
        </CardHeader>
        {!showDemoForm ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
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
                  onClick={() => setShowDemoForm(true)}
                  className="w-full mt-2"
                >
                  Create Demo Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={createDemoAccount}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="demo-name">Your Name</Label>
                <Input 
                  id="demo-name" 
                  type="text" 
                  placeholder="John Doe" 
                  value={demoName}
                  onChange={(e) => setDemoName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email</Label>
                <Input 
                  id="demo-email" 
                  type="email" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-password">Password</Label>
                <Input 
                  id="demo-password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={demoLoading}
              >
                {demoLoading ? (
                  <>
                    <span className="animate-spin mr-2">○</span>
                    Creating Account...
                  </>
                ) : (
                  "Create & Login"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDemoForm(false)}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
