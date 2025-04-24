
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
    console.log(`Validating team_member.id: ${playerId}`);
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
    
    console.log(`Successfully validated team_member.id: ${playerId}`);
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
  console.log(`Validating player with team_member.id: ${playerId}`);
  if (!(await validatePlayerId(playerId))) {
    throw new Error(`Player with team_member.id ${playerId} does not exist in team_members table`);
  }
}

/**
 * Validates multiple player IDs exist in team_members table
 * @param playerIds Array of team_member.id values to validate
 * @returns Promise<boolean> Whether all IDs are valid
 */
export async function validateMultiplePlayers(playerIds: string[]): Promise<boolean> {
  if (!playerIds.length) {
    console.error("No player IDs provided for validation");
    return false;
  }

  try {
    console.log(`Validating multiple team_member.ids:`, playerIds);
    const { data, error } = await supabase
      .from('team_members')
      .select('id')
      .in('id', playerIds);

    if (error) {
      console.error('Error validating multiple players:', error);
      return false;
    }

    const foundIds = new Set(data.map(p => p.id));
    const missingIds = playerIds.filter(id => !foundIds.has(id));

    if (missingIds.length > 0) {
      console.error(`Invalid player IDs: ${missingIds.join(', ')}`);
      return false;
    }

    console.log(`Successfully validated all player IDs`);
    return true;
  } catch (error) {
    console.error('Error in validateMultiplePlayers:', error);
    return false;
  }
}
