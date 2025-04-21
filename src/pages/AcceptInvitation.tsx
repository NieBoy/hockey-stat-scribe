
import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Fetch invitation details
  useEffect(() => {
    async function fetchInvitation() {
      if (!invitationId) {
        setError("Invalid invitation link");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("invitations")
          .select("*")
          .eq("id", invitationId)
          .single();

        if (error || !data) {
          setError("This invitation is invalid or has expired");
          setLoading(false);
          return;
        }

        // Check if invitation has expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          setError("This invitation has expired");
          setLoading(false);
          return;
        }

        // Check if invitation has been accepted
        if (data.status === "accepted") {
          setError("This invitation has already been accepted");
          setLoading(false);
          return;
        }

        // Set invitation data and prefill email
        setInvitation(data);
        form.setValue("email", data.email);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching invitation:", err);
        setError("Error loading invitation");
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [invitationId, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setValidating(true);
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name
          }
        }
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Failed to create user account");
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          name: values.name,
          email: values.email
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        // Continue anyway, not critical
      }

      // Update team members with user_id
      const { error: updateError } = await supabase
        .from("team_members")
        .update({ user_id: authData.user.id })
        .eq("email", values.email);

      if (updateError) {
        console.error("Error updating team members:", updateError);
        // Continue anyway
      }

      // Mark invitation as accepted
      const { error: acceptError } = await supabase
        .from("invitations")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
          user_id: authData.user.id
        })
        .eq("id", invitationId);

      if (acceptError) {
        console.error("Error accepting invitation:", acceptError);
        // Continue anyway
      }

      toast.success("You've successfully joined the team!");
      
      // Navigate to the home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Error accepting invitation:", err);
      toast.error(err instanceof Error ? err.message : "Failed to accept invitation");
    } finally {
      setValidating(false);
    }
  };

  if (!invitationId) {
    return <Navigate to="/" />;
  }

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Accept Invitation</CardTitle>
            <CardDescription>
              Create your account to join the team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Validating invitation...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center py-8 text-center">
                <XCircle className="h-12 w-12 text-destructive mb-2" />
                <h3 className="text-lg font-semibold">Invalid Invitation</h3>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <Button className="mt-6" onClick={() => navigate("/")}>
                  Return Home
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your email" 
                            type="email" 
                            disabled 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Create Password</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Create a secure password" 
                            type="password" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6" 
                    disabled={validating}
                  >
                    {validating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept & Join Team
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center flex-col text-center text-sm text-muted-foreground">
            <p>Already have an account?</p>
            <Button variant="link" onClick={() => navigate("/signin")}>
              Sign in instead
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
