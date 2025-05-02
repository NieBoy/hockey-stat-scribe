
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
      console.error(`Invalid player ID: ${playerId}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error in validatePlayerId for ${playerId}:`, error);
    return false;
  }
}

/**
 * Validates multiple player IDs (all team_member.id)
 * @param playerIds Array of team_member.id to validate
 * @returns Promise<boolean> Whether all provided IDs are valid
 */
export async function validateMultiplePlayers(playerIds: string[]): Promise<boolean> {
  try {
    // Filter out any empty/null values
    const validIds = playerIds.filter(id => id);
    
    if (validIds.length === 0) {
      return true; // No IDs to validate, so technically valid
    }
    
    // For performance, do a single query to check all IDs
    const { data, error } = await supabase
      .from('team_members')
      .select('id')
      .in('id', validIds);
      
    if (error) {
      console.error(`Error validating multiple player IDs:`, error);
      return false;
    }
    
    // Create a Set of the returned IDs for fast lookup
    const foundIds = new Set(data?.map(p => p.id));
    
    // Check if all requested IDs were found
    const allValid = validIds.every(id => foundIds.has(id));
    
    if (!allValid) {
      const missingIds = validIds.filter(id => !foundIds.has(id));
      console.error(`Invalid player IDs: ${missingIds.join(', ')}`);
    }
    
    return allValid;
  } catch (error) {
    console.error(`Error in validateMultiplePlayers:`, error);
    return false;
  }
}

/**
 * Validates a single player ID - wrapper for validatePlayerId for compatibility
 * @param playerId The team_member.id to validate
 * @returns Promise<boolean> Whether the ID exists
 */
export async function validatePlayer(playerId: string): Promise<boolean> {
  return validatePlayerId(playerId);
}
