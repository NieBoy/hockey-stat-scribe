
import { supabase } from "@/lib/supabase";

/**
 * Setup the required database functions for team invitations
 * This should be called when the app initializes to ensure all required functions exist
 */
export async function setupInvitationsDatabaseFunctions() {
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
}

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
