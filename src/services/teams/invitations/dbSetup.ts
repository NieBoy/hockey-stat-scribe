
import { supabase } from "@/lib/supabase";

/**
 * Creates the invitations table if it doesn't exist
 */
export async function ensureInvitationsTableExists() {
  try {
    console.log("Checking if invitations table exists...");
    
    // First check if the table exists
    const { count, error: checkError } = await supabase
      .from('invitations')
      .select('*', { count: 'exact', head: true })
      .limit(1);
      
    console.log("Table check result:", { count, error: checkError });

    // If there's an error about the relation not existing, create the table
    if (checkError && checkError.message.includes('relation "invitations" does not exist')) {
      console.log("Invitations table doesn't exist, creating it now...");
      const result = await createInvitationsTable();
      console.log("Table creation result:", result);
      return result;
    }

    console.log("Invitations table exists");
    return true;
  } catch (error) {
    console.error("Error ensuring invitations table exists:", error);
    console.log("Attempting to create invitations table as fallback...");
    try {
      return await createInvitationsTable();
    } catch (createError) {
      console.error("Failed to create invitations table:", createError);
      return false;
    }
  }
}

/**
 * Creates the invitations table directly
 */
async function createInvitationsTable() {
  try {
    console.log("Creating invitations table via function...");
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
