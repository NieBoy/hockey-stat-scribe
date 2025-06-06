
import { createGameStat } from '../utils/statsDbUtils';

export const processFaceoffEvent = async (event: any, playerId: string, details: any): Promise<boolean> => {
  try {
    if (!details) return false;
    
    // Check if player was involved in the faceoff
    if (details.winnerId === playerId || details.loserId === playerId) {
      const won = details.winnerId === playerId;
      console.log(`Player ${playerId} ${won ? 'won' : 'lost'} a faceoff`);
      
      return await createGameStat({
        game_id: event.game_id,
        player_id: playerId,
        stat_type: 'faceoffs',
        period: event.period,
        value: won ? 1 : 0 // Using number instead of string
      });
    }
    return false;
  } catch (error) {
    console.error(`Error processing faceoff event:`, error);
    return false;
  }
};
