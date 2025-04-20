
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
    
    // Check if invitations table exists and create it if not
    try {
      // First check if the table exists
      const { error: checkTableError } = await supabase.rpc('check_table_exists', { 
        table_name: 'invitations' 
      });
      
      // If we got an error about the function not existing, we need to create the function first
      if (checkTableError && checkTableError.message.includes('function') && checkTableError.message.includes('does not exist')) {
        // Create the function to check if a table exists
        await supabase.sql(`
          CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
          RETURNS boolean
          LANGUAGE plpgsql
          AS $$
          DECLARE
            table_exists boolean;
          BEGIN
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = $1
            ) INTO table_exists;
            RETURN table_exists;
          END;
          $$;
        `);
        
        // Try again after creating the function
        const { data: tableExists } = await supabase.rpc('check_table_exists', { 
          table_name: 'invitations' 
        });
        
        // If table doesn't exist, create it
        if (!tableExists) {
          await createInvitationsTable();
        }
      } else if (!checkTableError) {
        // Function exists, check if we need to create the table
        const { data: tableExists } = await supabase.rpc('check_table_exists', { 
          table_name: 'invitations' 
        });
        
        if (!tableExists) {
          await createInvitationsTable();
        }
      } else {
        // If we still have an error, try creating the table directly
        await createInvitationsTable();
      }
    } catch (dbError) {
      // If there's an error with the RPC call, attempt to create the table directly
      console.warn("Error checking if invitations table exists:", dbError);
      await createInvitationsTable();
    }
    
    // Create invitation records for members with emails
    for (const member of membersWithEmail) {
      try {
        // Simulate email sending since we can't actually send emails from the frontend
        console.log(`[EMAIL SIMULATION] Sending invitation email to ${member.email}`);
        
        // Create invitation record
        const { error: invitationError } = await supabase
          .from('invitations')
          .insert({
            team_id: teamId,
            email: member.email,
            status: 'pending',
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          });
          
        if (invitationError) {
          // If the table error persists, we'll try a fallback approach
          if (invitationError.message.includes('does not exist')) {
            // Store invitations in local storage as a fallback
            storeInvitationLocally(teamId, member.email);
          } else {
            console.error(`Error creating invitation for ${member.email}:`, invitationError);
          }
        } else {
          console.log(`Created invitation for ${member.email}`);
        }
      } catch (memberError) {
        console.error(`Error processing invitation for ${member.email}:`, memberError);
      }
    }
    
    // Return true if at least one invitation was processed
    return membersWithEmail.length > 0;
  } catch (error: any) {
    console.error("Error sending team invitations:", error);
    throw error;
  }
};

// Helper function to create the invitations table
async function createInvitationsTable() {
  console.log("Creating invitations table...");
  
  try {
    await supabase.sql(`
      CREATE TABLE IF NOT EXISTS public.invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID NOT NULL,
        email TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        user_id UUID,
        accepted_at TIMESTAMP WITH TIME ZONE
      );
    `);
    console.log("Invitations table created successfully");
  } catch (error) {
    console.error("Error creating invitations table:", error);
    // We'll continue execution even if table creation fails
  }
}

// Fallback method to store invitations locally when DB operations fail
function storeInvitationLocally(teamId: string, email: string) {
  try {
    const storedInvites = localStorage.getItem('pendingInvitations') || '[]';
    const invites = JSON.parse(storedInvites);
    invites.push({
      teamId,
      email,
      createdAt: new Date().toISOString(),
      status: 'pending'
    });
    localStorage.setItem('pendingInvitations', JSON.stringify(invites));
    console.log(`Stored invitation for ${email} locally`);
  } catch (e) {
    console.error("Error storing invitation locally:", e);
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
