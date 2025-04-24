
import { supabase } from "@/lib/supabase";
import { PlayerStat } from "@/types";

export const updateOrInsertStat = async (
  playerId: string,
  stat: Partial<PlayerStat>
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('player_stats')
      .upsert({
        player_id: playerId,
        stat_type: stat.statType,
        value: stat.value || 0,
        games_played: stat.gamesPlayed || 0
      }, {
        onConflict: 'player_id,stat_type'
      });

    if (error) {
      console.error("Error upserting player stat:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateOrInsertStat:", error);
    return false;
  }
};
