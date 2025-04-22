
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Sends invitations to team members.
 * Instead of sending an actual email, generates and returns sign-up links for each member.
 */
export const sendTeamInvitations = async (teamId: string, memberIds: string[]): Promise<{ sent: boolean, signupLinks: string[] }> => {
  try {
    if (!memberIds.length) {
      console.log("No member IDs provided for invitations");
      return { sent: false, signupLinks: [] };
    }
    
    console.log(`Sending invitations to ${memberIds.length} members of team ${teamId}`);
    
    // Fetch team information
    const { data: teamData, error: teamError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', teamId)
      .single();
      
    if (teamError || !teamData) {
      console.error("Error fetching team info:", teamError);
      throw new Error(`Team not found: ${teamError?.message}`);
    }
    
    // Fetch team members to get their emails
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select('id, name, email, role')
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
      return { sent: false, signupLinks: [] };
    }
    
    console.log(`Preparing to send emails to: ${membersWithEmail.map(m => m.email).join(', ')}`);
    
    // Check if invitations table exists
    try {
      await ensureInvitationsTableExists();
    } catch (dbError) {
      console.error("Error ensuring invitations table exists:", dbError);
      throw new Error("Could not create or verify invitations table");
    }
    
    // Create invitation records and collect signup links
    let invitationsSent = 0;
    const signupLinks: string[] = [];
    for (const member of membersWithEmail) {
      try {
        // Insert the invitation record
        const { data: invitationData, error: invitationError } = await supabase
          .from('invitations')
          .insert({
            team_id: teamId,
            email: member.email,
            role: member.role || 'player',
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (invitationError) {
          console.error(`Error creating invitation for ${member.email}:`, invitationError);
          // Continue with the next member instead of breaking the whole process
          continue;
        }
        
        if (invitationData) {
          // Generate a signup URL
          const baseUrl = window.location.origin;
          const signupUrl = `${baseUrl}/accept-invitation?id=${invitationData.id}`;
          signupLinks.push(signupUrl);

          invitationsSent++;
          console.log(`Invitation created for ${member.email}, signup link: ${signupUrl}`);
        }
      } catch (memberError) {
        console.error(`Error processing invitation for ${member.email}:`, memberError);
        // Continue with next member
      }
    }
    
    return { sent: invitationsSent > 0, signupLinks };
  } catch (error: any) {
    console.error("Error sending team invitations:", error);
    throw error;
  }
};

/**
 * Creates the invitations table if it doesn't exist
 */
export async function ensureInvitationsTableExists() {
  try {
    // First check if the table exists
    const { count, error: checkError } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .limit(1);

    // If there's an error about the relation not existing, create the table
    if (checkError && checkError.message.includes('relation "invitations" does not exist')) {
      await createInvitationsTable();
      return true;
    }

    return true;
  } catch (error) {
    console.error("Error ensuring invitations table exists:", error);
    await createInvitationsTable();
    return false;
  }
}

/**
 * Creates the invitations table directly
 */
async function createInvitationsTable() {
  try {
    const { data, error } = await supabase.functions.invoke('create-invitations-table');
    
    if (error) {
      console.error("Error creating invitations table via function:", error);
      throw error;
    }

    console.log("Invitations table created successfully:", data);
    return true;
  } catch (error) {
    console.error("Failed to create invitations table:", error);
    return false;
  }
}

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
