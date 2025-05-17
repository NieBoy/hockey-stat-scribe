
import { calculateAndRecordPlusMinus } from '../utils/plusMinusCalculator';

/**
 * Calculate and record plus/minus for a player
 * This is the main entry point for plus/minus recording from game events
 * 
 * @param gameId The game ID
 * @param playerId The player's team_member.id
 * @param teamType The team type that scored ('home' or 'away')
 * @param period Optional period, defaults to 1 if not provided
 * @returns Promise<boolean> Success status
 */
export const calculatePlusMinus = async (
  gameId: string, 
  playerId: string, 
  teamType: 'home' | 'away',
  period: number = 1
): Promise<boolean> => {
  try {
    return await calculateAndRecordPlusMinus(gameId, playerId, teamType, period);
  } catch (error) {
    console.error(`Error in calculatePlusMinus for player ${playerId}:`, error);
    throw error;
  }
};
