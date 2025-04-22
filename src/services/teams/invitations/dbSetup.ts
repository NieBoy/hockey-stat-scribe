
import { supabase } from "@/lib/supabase";

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
