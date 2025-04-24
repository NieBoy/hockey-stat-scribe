
import { supabase } from '@/lib/supabase';

/**
 * Validates that a player ID exists in the team_members table
 * @param playerId The team_member.id to validate
 * @returns Promise<boolean> Whether the ID exists
 */
export async function validatePlayerId(playerId: string): Promise<boolean> {
  if (!playerId) {
    console.error("No player ID provided for validation");
    return false;
  }
  
  try {
    const { count, error } = await supabase
      .from('team_members')
      .select('id', { count: 'exact', head: true })
      .eq('id', playerId);
      
    if (error) {
      console.error(`Error validating player ID ${playerId}:`, error);
      return false;
    }
    
    if (!count) {
      console.error(`Invalid player ID: ${playerId} - not found in team_members table`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in validatePlayerId for ${playerId}:`, error);
    return false;
  }
}

/**
 * Validates a player ID and throws an error if invalid
 * @param playerId The team_member.id to validate
 * @throws Error if the player ID is invalid
 */
export async function validatePlayer(playerId: string): Promise<void> {
  if (!(await validatePlayerId(playerId))) {
    throw new Error(`Player with ID ${playerId} does not exist in team_members table`);
  }
}
