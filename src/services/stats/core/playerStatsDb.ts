
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";

export const updateOrInsertStat = async (
  playerId: string, 
  stat: Partial<PlayerStat>
) => {
  try {
    console.log(`Updating/inserting stat for player ${playerId}:`, stat);
    
    const { data: existingStat } = await supabase
      .from('player_stats')
      .select('id')
      .eq('player_id', playerId)
      .eq('stat_type', stat.statType)
      .maybeSingle();
      
    if (existingStat) {
      console.log(`Found existing stat with id ${existingStat.id}, updating...`);
      const { error: updateError } = await supabase
        .from('player_stats')
        .update({
          value: stat.value,
          games_played: stat.gamesPlayed
        })
        .eq('id', existingStat.id);
        
      if (updateError) {
        console.error("Error updating player stat:", updateError);
        throw updateError;
      }
      
      console.log(`Successfully updated stat id ${existingStat.id}`);
    } else {
      console.log(`No existing stat found, inserting new stat...`);
      const { error: insertError } = await supabase
        .from('player_stats')
        .insert({
          player_id: playerId,
          stat_type: stat.statType,
          value: stat.value,
          games_played: stat.gamesPlayed
        });
        
      if (insertError) {
        console.error("Error inserting player stat:", insertError);
        throw insertError;
      }
      
      console.log(`Successfully inserted new stat for player ${playerId}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in updateOrInsertStat for player ${playerId}:`, error);
    return false;
  }
};
