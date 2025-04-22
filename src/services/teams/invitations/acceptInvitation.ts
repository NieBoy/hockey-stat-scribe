
import { supabase } from "@/lib/supabase";

/**
 * Creates a user account when someone accepts an invitation
 */
export const acceptInvitation = async (
  invitationId: string,
  userData: {
    name: string;
    email: string;
    password: string;
  }
): Promise<boolean> => {
  try {
    // Log accepting of invitation
    console.log(`Accepting invitation ${invitationId} for user ${userData.email}`);
    
    // 1. First verify the invitation exists and is valid
    const { data: invitationRecord, error: invitationError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single();
      
    if (invitationError || !invitationRecord) {
      console.error("Invalid or expired invitation:", invitationError);
      throw new Error("Invalid or expired invitation");
    }
    
    // 2. Check if the email matches
    if (invitationRecord.email !== userData.email) {
      throw new Error("Email does not match invitation");
    }
    
    // 3. Create user account via Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name
        }
      }
    });
    
    if (authError || !authData.user) {
      console.error("Error creating user account:", authError);
      throw new Error("Could not create user account");
    }
    
    // 4. Create user profile in the users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        name: userData.name
      })
      .select()
      .single();
      
    if (profileError) {
      console.error("Error creating user profile:", profileError);
      throw new Error("Could not create user profile");
    }
    
    // 5. Update team members with user id
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ user_id: authData.user.id })
      .eq('email', userData.email);
      
    if (updateError) {
      console.error("Error updating team members:", updateError);
      // Continue anyway
    }
    
    // 6. Mark invitation as accepted
    const { error: acceptError } = await supabase
      .from('invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        user_id: authData.user.id
      })
      .eq('id', invitationId);
      
    if (acceptError) {
      console.error("Error marking invitation as accepted:", acceptError);
      // Continue anyway
    }
    
    return true;
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
};
