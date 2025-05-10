import { createGameStat } from '../utils/statsDbUtils';

export const processFaceoffEvent = async (event: any, playerId: string, details: any): Promise<boolean> => {
  try {
    if (!details) return false;
    
    // Check if player was involved in the faceoff
    if (details.winnerId === playerId || details.loserId === playerId) {
      const won = details.winnerId === playerId;
      console.log(`Player ${playerId} ${won ? 'won' : 'lost'} a faceoff`);
      
      return await createGameStat(
        event.game_id,
        playerId,
        'faceoffs',
        event.period,
        won ? "1" : "0"
      );
    }
    return false;
  } catch (error) {
    console.error(`Error processing faceoff event:`, error);
    return false;
  }
};
