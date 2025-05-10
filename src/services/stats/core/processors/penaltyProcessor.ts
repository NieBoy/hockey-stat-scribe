
import { createGameStat } from '../utils/statsDbUtils';

export const processPenaltyEvent = async (event: any, playerId: string, details: any): Promise<boolean> => {
  try {
    // Check if this player took the penalty
    if (details && details.playerId === playerId) {
      console.log(`Player ${playerId} took a penalty`);
      
      // Create penalty stat with value 1 (count of penalties)
      const penaltyStat = await createGameStat({
        game_id: event.game_id,
        player_id: playerId,
        stat_type: 'penalties',
        period: event.period,
        value: 1 // Using number instead of string
      });
      
      // If there's PIM (penalty minutes) data, record that too
      if (details.pim) {
        const pimValue = typeof details.pim === 'string' ? Number(details.pim) : details.pim;
        
        await createGameStat({
          game_id: event.game_id,
          player_id: playerId,
          stat_type: 'pim',
          period: event.period,
          value: pimValue // Ensure it's a number
        });
      }
      
      return penaltyStat;
    }
    return false;
  } catch (error) {
    console.error(`Error processing penalty event:`, error);
    return false;
  }
};
