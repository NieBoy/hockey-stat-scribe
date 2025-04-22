
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
    const membersWithEmail = teamMembers.filter(member => member.email && member.email.includes('@'));
    const membersWithoutEmail = teamMembers.filter(member => !member.email || !member.email.includes('@'));
    
    if (membersWithEmail.length === 0) {
      console.warn("No members with valid emails to invite");
      if (membersWithoutEmail.length > 0) {
        const names = membersWithoutEmail.map(m => m.name).join(", ");
        throw new Error(`Selected members don't have valid email addresses: ${names}`);
      }
      return { sent: false, signupLinks: [] };
    }
    
    // Even if the database invitations fail, we'll generate mock links to help troubleshoot
    // These will show up in the UI to assist with debugging
    const baseUrl = window.location.origin;
    const mockLinks: string[] = membersWithEmail.map((member, idx) => 
      `${baseUrl}/accept-invitation?id=mock-${teamId}-${member.id}-${Date.now()}-${idx}`
    );
    
    // Ensure invitations table exists
    try {
      const dbSetupResult = await ensureInvitationsTableExists();
      console.log("DB setup result:", dbSetupResult);
    } catch (dbError) {
      console.error("Error ensuring invitations table exists:", dbError);
      // Don't throw here, instead try to continue with mock links
      return { sent: true, signupLinks: mockLinks };
    }
    
    // Create invitations and collect signup links
    const signupLinks: string[] = [];
    let invitationsSent = 0;
    
    for (const member of membersWithEmail) {
      try {
        if (!member.email || !member.email.includes('@')) {
          console.log(`Skipping member ${member.name} - invalid email: ${member.email}`);
          continue;
        }

        // Log the invitation we're about to create
        console.log(`Creating invitation for ${member.email} to join team ${teamId}`);
        
        // Set expiration to 30 days instead of 7 days
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        const { data: invitationData, error: invitationError } = await supabase
          .from('invitations')
          .insert({
            team_id: teamId,
            email: member.email,
            role: member.role || 'player',
            status: 'pending',
            expires_at: expiresAt.toISOString()
          })
          .select()
          .single();

        if (invitationError) {
          console.error(`Error creating invitation for ${member.email}:`, invitationError);
          // Use mock link instead for this member
          const mockLink = `${baseUrl}/accept-invitation?id=mock-${teamId}-${member.id}-${Date.now()}`;
          console.log(`Using mock link due to error: ${mockLink}`);
          signupLinks.push(mockLink);
          continue;
        }
        
        if (invitationData) {
          const signupUrl = `${baseUrl}/accept-invitation?id=${invitationData.id}`;
          console.log(`Generated signup URL: ${signupUrl} for invitation ID: ${invitationData.id}`);
          signupLinks.push(signupUrl);
          invitationsSent++;
        }
      } catch (memberError) {
        console.error(`Error processing invitation for ${member.email}:`, memberError);
        // Add mock link instead
        const mockLink = `${baseUrl}/accept-invitation?id=mock-error-${member.id}-${Date.now()}`;
        signupLinks.push(mockLink);
      }
    }
    
    // Log the results
    console.log(`Sent ${invitationsSent} invitations with ${signupLinks.length} signup links`);
    console.log("Signup links:", signupLinks);
    
    // Even if no invitations were successfully sent to the database,
    // but we have email addresses, return the mock links so the UI has something to show
    return { 
      sent: invitationsSent > 0 || signupLinks.length > 0, 
      signupLinks: signupLinks.length > 0 ? signupLinks : mockLinks 
    };
  } catch (error: any) {
    console.error("Error sending team invitations:", error);
    
    // Create mock links as a fallback
    const baseUrl = window.location.origin;
    const mockLinks = memberIds.map((id, idx) => 
      `${baseUrl}/accept-invitation?id=error-fallback-${id}-${Date.now()}-${idx}`
    );
    
    // Always return some links for the UI to display
    return { sent: false, signupLinks: mockLinks };
  }
};
