
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Sends invitations to team members
 */
export const sendTeamInvitations = async (teamId: string, memberIds: string[]): Promise<boolean> => {
  try {
    if (!memberIds.length) {
      console.log("No member IDs provided for invitations");
      return false;
    }
    
    console.log(`Sending invitations to ${memberIds.length} members of team ${teamId}`);
    
    // Fetch team members to get their emails
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select('id, name, email')
      .in('id', memberIds);
      
    if (teamMembersError) {
      console.error("Error fetching team members for invitations:", teamMembersError);
      throw new Error(`Error fetching team members: ${teamMembersError.message}`);
    }
    
    if (!teamMembers || teamMembers.length === 0) {
      throw new Error("No team members found with the provided IDs");
    }
    
    // Filter out members without emails
    const membersWithEmail = teamMembers.filter(member => member.email) || [];
    const membersWithoutEmail = teamMembers.filter(member => !member.email) || [];
    
    if (membersWithEmail.length === 0) {
      console.warn("No members with emails to invite");
      if (membersWithoutEmail.length > 0) {
        const names = membersWithoutEmail.map(m => m.name).join(", ");
        throw new Error(`Selected members don't have email addresses: ${names}`);
      }
      return false;
    }
    
    console.log(`Preparing to send emails to: ${membersWithEmail.map(m => m.email).join(', ')}`);
    
    // Create invitation records for members with emails
    for (const member of membersWithEmail) {
      try {
        // Check if invitation already exists
        const { data: existingInvitation, error: checkError } = await supabase
          .from('invitations')
          .select('id')
          .eq('email', member.email)
          .eq('team_id', teamId)
          .eq('status', 'pending')
          .maybeSingle();
          
        if (checkError) {
          console.error(`Error checking existing invitation for ${member.email}:`, checkError);
        } else if (existingInvitation) {
          console.log(`Invitation already exists for ${member.email}, skipping`);
          continue;
        }
        
        // Create an invitation record
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .insert({
            team_id: teamId,
            email: member.email,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          });
          
        if (invitationError) {
          console.error(`Error creating invitation for ${member.email}:`, invitationError);
        } else {
          console.log(`Created invitation for ${member.email}`);
          
          // Here you would normally call your email service
          console.log(`[EMAIL SIMULATION] Sending invitation email to ${member.email}`);
        }
      } catch (memberError) {
        console.error(`Error processing invitation for ${member.email}:`, memberError);
      }
    }
    
    // Let user know about members without email addresses
    if (membersWithoutEmail.length > 0) {
      const names = membersWithoutEmail.map(m => m.name).join(", ");
      console.warn(`Could not send invitations to members without email addresses: ${names}`);
    }
    
    // Return true if at least one invitation was processed
    return membersWithEmail.length > 0;
  } catch (error: any) {
    console.error("Error sending team invitations:", error);
    throw error;
  }
};

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
    // Here we would implement the logic to create a real user account
    // and link it to the team member when they accept an invitation
    console.log(`Accepting invitation ${invitationId} for user ${userData.email}`);
    
    // 1. First verify the invitation exists and is valid
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single();
      
    if (invitationError || !invitation) {
      console.error("Invalid or expired invitation:", invitationError);
      throw new Error("Invalid or expired invitation");
    }
    
    // 2. Check if the email matches
    if (invitation.email !== userData.email) {
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
    
    // 5. Update all team_members records with this email
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ user_id: authData.user.id })
      .eq('email', userData.email);
      
    if (updateError) {
      console.error("Error updating team members:", updateError);
      // Continue anyway
    }
    
    // 6. Mark the invitation as accepted
    const { error: acceptError } = await supabase
      .from('invitations')
      .update({ 
        status: 'accepted',
        accepted_at: new Date(),
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
