
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface DemoAccountFormProps {
  onBackToSignIn: () => void;
}

export const DemoAccountForm = ({ onBackToSignIn }: DemoAccountFormProps) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [demoName, setDemoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!demoName || !email || !password) {
      setError("Please fill in all fields to create a demo account.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Convert email to lowercase before creating demo account
      const lowercaseEmail = email.toLowerCase();
      
      // First check if there's a team member with this email that we can link to
      const { data: teamMemberData } = await supabase
        .from("team_members")
        .select("id")
        .eq("email", lowercaseEmail)
        .maybeSingle();
      
      const teamMemberId = teamMemberData?.id || null;
      
      // Call the edge function to create a demo user with pre-confirmed email
      const { data, error } = await supabase.functions.invoke('create-demo-user', {
        body: {
          email: lowercaseEmail,
          password,
          name: demoName,
          teamMemberId
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
        
        // If we found a team member but there was no user_id set, link them now
        if (teamMemberId && !data.alreadyExists && data.user?.id) {
          const { error: linkError } = await supabase
            .from("team_members")
            .update({ user_id: data.user.id })
            .eq("id", teamMemberId);
            
          if (linkError) {
            console.error("Error linking user to team member:", linkError);
          } else {
            toast.success("Your account has been linked to your player profile!");
          }
        }
      }
      
      // Sign in with the account credentials (using lowercase email)
      const result = await signIn(lowercaseEmail, password);
      if (result.error) {
        setError("Account exists but couldn't sign in automatically: " + result.error);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred creating the demo account.");
    } finally {
      setLoading(false);
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
      </div>
      <div className="flex flex-col space-y-4 mt-4">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
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
          onClick={onBackToSignIn}
          className="w-full"
        >
          Back to Sign In
        </Button>
      </div>
    </form>
  );
};
