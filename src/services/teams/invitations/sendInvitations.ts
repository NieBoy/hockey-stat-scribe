
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ensureInvitationsTableExists } from "./dbSetup";

/**
 * Sends invitations to team members.
 * Instead of sending an actual email, generates and returns sign-up links for each member.
 */
export const sendTeamInvitations = async (
  teamId: string, 
  memberIds: string[]
): Promise<{ sent: boolean, signupLinks: string[] }> => {
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
    
    // Fetch team members
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
    const membersWithEmail = teamMembers.filter(member => member.email);
    const membersWithoutEmail = teamMembers.filter(member => !member.email);
    
    if (membersWithEmail.length === 0) {
      console.warn("No members with emails to invite");
      if (membersWithoutEmail.length > 0) {
        const names = membersWithoutEmail.map(m => m.name).join(", ");
        throw new Error(`Selected members don't have email addresses: ${names}`);
      }
      return { sent: false, signupLinks: [] };
    }
    
    // Ensure invitations table exists
    try {
      await ensureInvitationsTableExists();
    } catch (dbError) {
      console.error("Error ensuring invitations table exists:", dbError);
      throw new Error("Could not create or verify invitations table");
    }
    
    // Create invitations and collect signup links
    const signupLinks: string[] = [];
    let invitationsSent = 0;
    
    for (const member of membersWithEmail) {
      try {
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
          continue;
        }
        
        if (invitationData) {
          const baseUrl = window.location.origin;
          const signupUrl = `${baseUrl}/accept-invitation?id=${invitationData.id}`;
          signupLinks.push(signupUrl);
          invitationsSent++;
        }
      } catch (memberError) {
        console.error(`Error processing invitation for ${member.email}:`, memberError);
      }
    }
    
    return { sent: invitationsSent > 0, signupLinks };
  } catch (error: any) {
    console.error("Error sending team invitations:", error);
    throw error;
  }
};
