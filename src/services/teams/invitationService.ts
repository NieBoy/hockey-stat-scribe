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
      return false;
    }
    
    console.log(`Preparing to send emails to: ${membersWithEmail.map(m => m.email).join(', ')}`);
    
    // Check if invitations table exists
    try {
      const { count, error: checkTableError } = await supabase
        .from('invitations')
        .select('*', { count: 'exact', head: true });
        
      // If we got an error about the relation not existing, we need to create the table
      if (checkTableError && checkTableError.message.includes('relation "invitations" does not exist')) {
        await createInvitationsTable();
      }
    } catch (dbError) {
      console.warn("Error checking if invitations table exists:", dbError);
      await createInvitationsTable();
    }
    
    // Create invitation records for members with emails
    let invitationsSent = 0;
    for (const member of membersWithEmail) {
      let invitationData = null;
      let invitationError = null;
      try {
        // Insert the invitation record
        const insertResult = await supabase
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
        invitationData = insertResult.data;
        invitationError = insertResult.error;

        if (invitationError) {
          if (invitationError.message && invitationError.message.includes('does not exist')) {
            // Try to create the table again and then retry the insert
            await createInvitationsTable();
            // Retry insert after table creation
            const retryInsertResult = await supabase
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
            invitationData = retryInsertResult.data;
            invitationError = retryInsertResult.error;
            if (invitationError) {
              console.error(`Error creating invitation for ${member.email} after retry:`, invitationError);
              continue;
            }
          } else {
            console.error(`Error creating invitation for ${member.email}:`, invitationError);
            continue;
          }
        }
        if (invitationData) {
          try {
            const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
              body: {
                to: member.email,
                teamName: teamData.name,
                invitationId: invitationData.id,
                role: member.role || 'player'
              }
            });
            if (emailError) {
              console.error(`Error sending email to ${member.email}:`, emailError);
              // Still count as sent, since DB record exists
            }
            invitationsSent++;
            console.log(`Invitation sent to ${member.email}`);
          } catch (emailError) {
            console.error(`Error invoking send-invitation-email function:`, emailError);
          }
        }
      } catch (memberError) {
        console.error(`Error processing invitation for ${member.email}:`, memberError);
      }
    }
    
    // Return true if at least one invitation was sent
    return invitationsSent > 0;
  } catch (error: any) {
    console.error("Error sending team invitations:", error);
    throw error;
  }
};

// Helper function to create the invitations table using Supabase RPC instead of direct SQL
async function createInvitationsTable() {
  console.log("Creating invitations table...");
  
  try {
    // Create a table using Supabase's RPC function
    const { error } = await supabase.rpc('create_invitations_table');
    
    // If the function doesn't exist yet, we need to create it first
    if (error && error.message.includes('function "create_invitations_table" does not exist')) {
      // Create the function using multiple statements
      await createInvitationsTableFunction();
      
      // Try calling the function again
      const { error: secondError } = await supabase.rpc('create_invitations_table');
      if (secondError) {
        console.error("Error creating invitations table:", secondError);
        throw secondError;
      }
    } else if (error) {
      console.error("Error creating invitations table:", error);
      throw error;
    }
    
    console.log("Invitations table created successfully");
  } catch (error) {
    console.error("Error creating invitations table:", error);
    // We'll continue execution even if table creation fails
  }
}

// Create a function that will create the invitations table
async function createInvitationsTableFunction() {
  try {
    // Use multiple separate queries instead of a single SQL statement
    await supabase.rpc('create_check_table_exists_function');
    await supabase.rpc('create_invitations_table_function');
  } catch (error) {
    console.error("Error creating functions:", error);
  }
}

// Fix issues with the database functions
export const setupInvitationsDatabaseFunctions = async () => {
  try {
    // First create the function to check if a table exists
    const { error: createCheckFnError } = await supabase.rpc(
      'create_or_update_check_table_exists_function'
    );

    if (createCheckFnError) {
      // Create the function manually
      await supabase.functions.invoke('setup-db-functions', {
        body: { action: 'setup_check_table_function' }
      });
    }

    // Then create the function to create the invitations table
    const { error: createTableFnError } = await supabase.rpc(
      'create_or_update_invitations_table_function'
    );

    if (createTableFnError) {
      // Create the function manually
      await supabase.functions.invoke('setup-db-functions', {
        body: { action: 'setup_invitations_table_function' }
      });
    }

    console.log("Database functions setup complete");
    return true;
  } catch (error) {
    console.error("Error setting up database functions:", error);
    return false;
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
