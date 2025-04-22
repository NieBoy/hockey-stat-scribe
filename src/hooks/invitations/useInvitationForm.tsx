
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
      let teamMemberId: string | null = null;
      
      // For mock invitations, get team ID from the invitation ID
      let teamId = null;
      if (invitationId?.startsWith('mock-')) {
        teamId = invitationId.split('-')[1];
      } else if (invitation?.team_id) {
        teamId = invitation.team_id;
      }
      
      // If we have a teamId, check if a team member with this email already exists
      if (teamId) {
        console.log("Looking for existing team member with email:", values.email);
        const { data: existingMember } = await supabase
          .from("team_members")
          .select("id")
          .eq("team_id", teamId)
          .eq("email", values.email)
          .maybeSingle();
          
        if (existingMember?.id) {
          console.log("Found existing team member:", existingMember.id);
          teamMemberId = existingMember.id;
        }
      }
      
      // Create the user account with our edge function
      console.log("Creating user account with edge function");
      const { data: authData, error: authError } = await supabase.functions.invoke('create-demo-user', {
        body: {
          email: values.email,
          password: values.password,
          name: values.name,
          teamMemberId: teamMemberId // Pass the team member ID if we found one
        }
      });

      if (authError) {
        console.error("Error from create-demo-user function:", authError);
        throw new Error(authError.message);
      }
      
      if (authData?.error) {
        console.error("Error returned from create-demo-user:", authData.error);
        throw new Error(authData.error);
      }

      const userId = authData?.user?.id;
      if (!userId && !authData?.alreadyExists) {
        throw new Error("Failed to create user account");
      }
      
      // Handle normal invitations
      if (!invitationId?.startsWith('mock-')) {
        // Mark the invitation as accepted
        const { error: acceptError } = await supabase
          .from("invitations")
          .update({
            status: "accepted",
            accepted_at: new Date().toISOString(),
            user_id: userId
          })
          .eq("id", invitationId);

        if (acceptError) {
          console.error("Error accepting invitation:", acceptError);
        }
      }
      
      // If we have a team ID but no existing member, create a new team member
      if (teamId && !teamMemberId && userId) {
        console.log(`Creating new team member for user ${userId} in team ${teamId}`);
        const { error: teamMemberError } = await supabase
          .from("team_members")
          .insert({
            team_id: teamId,
            user_id: userId,
            name: values.name,
            email: values.email,
            role: invitation?.role || "player"
          });
          
        if (teamMemberError) {
          console.error("Error creating team member:", teamMemberError);
        }
      }

      toast.success("You've successfully joined the team!");
      
      // Sign in with the newly created account
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
