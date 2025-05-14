
import { calculatePlusMinusValue, recordPlusMinus } from '../core/utils/plusMinusUtils';

/**
 * Calculate and record plus/minus for a player
 * This is the main entry point for plus/minus recording from game events
 */
export const calculatePlusMinus = async (gameId: string, playerId: string, teamType: string): Promise<boolean> => {
  try {
    // Calculate the plus/minus value (+1 or -1)
    const plusMinusValue = await calculatePlusMinusValue(gameId, playerId, teamType as 'home' | 'away');
    
    // Record the plus/minus stat with the calculated value
    return await recordPlusMinus(gameId, playerId, 1, plusMinusValue);
  } catch (error) {
    console.error("Error calculating plus/minus:", error);
    throw error;
  }
};
