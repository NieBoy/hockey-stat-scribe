
import { createGameStat } from '../utils/statsDbUtils';

export const processPenaltyEvent = async (event: any, playerId: string, details: any): Promise<boolean> => {
  try {
    // Check if this player took the penalty
    if (details && details.playerId === playerId) {
      console.log(`Player ${playerId} took a penalty`);
      const penaltyStat = await createGameStat(event.game_id, playerId, 'penalties', event.period);
      
      // If there's PIM (penalty minutes) data, record that too
      if (details.pim) {
        await createGameStat(event.game_id, playerId, 'pim', event.period, details.pim);
      }
      
      return penaltyStat;
    }
    return false;
  } catch (error) {
    console.error(`Error processing penalty event:`, error);
    return false;
  }
};
