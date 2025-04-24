
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
 * @param scorerId Optional team_member.id of the scorer
 * @param primaryAssistId Optional team_member.id of the primary assist
 * @param secondaryAssistId Optional team_member.id of the secondary assist
 * @returns Promise<boolean> Whether all provided IDs are valid
 */
export async function validatePlayers(scorerId?: string, primaryAssistId?: string, secondaryAssistId?: string): Promise<boolean> {
  try {
    // Validate scorer if provided
    if (scorerId && !(await validatePlayerId(scorerId))) {
      throw new Error(`Player with ID ${scorerId} does not exist`);
    }
    
    // Validate primary assist if provided
    if (primaryAssistId && !(await validatePlayerId(primaryAssistId))) {
      throw new Error(`Player with ID ${primaryAssistId} does not exist`);
    }
    
    // Validate secondary assist if provided
    if (secondaryAssistId && !(await validatePlayerId(secondaryAssistId))) {
      throw new Error(`Player with ID ${secondaryAssistId} does not exist`);
    }
    
    return true;
  } catch (error) {
    console.error("Error validating players:", error);
    throw error;
  }
}
