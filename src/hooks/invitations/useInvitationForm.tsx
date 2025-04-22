
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export function useInvitationForm() {
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

  const validateInvitation = async () => {
    if (!invitationId) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    // Handle mock invitations (from development environment)
    if (invitationId.startsWith('mock-')) {
      console.log("Processing mock invitation:", invitationId);
      const parts = invitationId.split('-');
      if (parts.length >= 3) {
        const mockInvitation = {
          id: invitationId,
          team_id: parts[1],
          email: "demo@example.com",
          role: "player",
          status: "pending",
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        
        setInvitation(mockInvitation);
        form.setValue("email", ""); // Set to empty string for mock invitations so user can enter their own
        setLoading(false);
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", invitationId)
        .single();

      if (error || !data) {
        console.error("Error fetching invitation:", error);
        setError("This invitation is invalid or has expired");
        setLoading(false);
        return;
      }

      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setError("This invitation has expired");
        setLoading(false);
        return;
      }

      if (data.status === "accepted") {
        setError("This invitation has already been accepted");
        setLoading(false);
        return;
      }

      setInvitation(data);
      form.setValue("email", data.email || "");
      setLoading(false);
    } catch (err) {
      console.error("Error fetching invitation:", err);
      setError("Error loading invitation");
      setLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setValidating(true);
    try {
      if (invitationId?.startsWith('mock-')) {
        console.log("Creating demo account with email:", values.email);
        
        // For mock invitations, create a user account directly via auth
        // Important: Set email_confirm=true in admin functions to bypass email confirmation
        const { data: authData, error: authError } = await supabase.functions.invoke('create-demo-user', {
          body: {
            email: values.email,
            password: values.password,
            name: values.name
          }
        });

        if (authError || !authData?.user) {
          console.error("Error creating demo account:", authError || "No user data returned");
          throw new Error(authError?.message || "Failed to create user account");
        }
        
        // User has been created and auto-confirmed by the edge function
        const userId = authData.user.id;
        console.log("Demo user created with ID:", userId);
        
        // Parse team ID from mock invitation ID
        const teamId = invitationId.split('-')[1];
        
        // Associate user with team
        if (teamId) {
          const { error: teamMemberError } = await supabase
            .from("team_members")
            .insert({
              team_id: teamId,
              user_id: userId,
              name: values.name,
              email: values.email,
              role: "player"
            });
            
          if (teamMemberError) {
            console.error("Error adding team member:", teamMemberError);
          }
        }
        
        toast.success("Demo account created successfully!");
        
        // Now sign in with the newly created account
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password
        });
        
        if (signInError) {
          console.error("Error signing in:", signInError);
          throw new Error("Account created but couldn't sign in automatically: " + signInError.message);
        }
        
        setTimeout(() => {
          navigate("/");
        }, 1500);
        return;
      }
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name
          }
        }
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error("Failed to create user account");

      const { error: profileError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          name: values.name,
          email: values.email
        });

      if (profileError) {
        console.error("Error creating profile:", profileError);
      }

      const { error: updateError } = await supabase
        .from("team_members")
        .update({ user_id: authData.user.id })
        .eq("email", values.email);

      if (updateError) {
        console.error("Error updating team members:", updateError);
      }

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
      }

      toast.success("You've successfully joined the team!");
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

  return {
    form,
    loading,
    error,
    invitation,
    validating,
    validateInvitation,
    onSubmit,
    invitationId
  };
}
