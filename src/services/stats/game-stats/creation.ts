
import { supabase } from '@/lib/supabase';
import { GameStat } from '@/types';

export const insertGameStat = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
  try {
    console.log("Inserting game stat:", stat);
    
    // Get user_id from team_members table
    const { data: teamMember, error: memberError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('id', stat.playerId)
      .single();
      
    if (memberError || !teamMember || !teamMember.user_id) {
      console.error(`Cannot insert stat: Unable to find a valid user_id for team_member ${stat.playerId}`);
      console.log("Team member lookup error or missing user_id:", memberError || "No user_id found");
      
      // Important: This prevents the stats calculation from proceeding with an invalid user_id
      throw new Error(`Player ID ${stat.playerId} does not have a valid user_id in team_members`);
    }
    
    console.log(`Found user_id ${teamMember.user_id} for team member ${stat.playerId}`);
    
    // Use RPC with the user_id instead of team_member.id
    const { data, error } = await supabase.rpc('record_game_stat', {
      p_game_id: stat.gameId,
      p_player_id: teamMember.user_id, // This is the key change - using user_id instead of team_member.id
      p_stat_type: stat.statType,
      p_period: stat.period,
      p_value: stat.value,
      p_details: stat.details || ''
    });
    
    if (error) {
      console.error("Error inserting game stat:", error);
      throw error;
    }
    
    console.log("Successfully inserted game stat with user_id");
    return data;
  } catch (error) {
    console.error("Error in insertGameStat:", error);
    throw error;
  }
};

export const recordPlusMinusStats = async (
  gameId: string,
  playerIds: string[],
  period: number,
  isPositive: boolean
) => {
  try {
    console.log(`Recording ${isPositive ? 'plus' : 'minus'} for players:`, playerIds);
    
    // First get user_ids for all team members
    const { data: validPlayers, error: validationError } = await supabase
      .from('team_members')
      .select('id, user_id')
      .in('id', playerIds)
      .filter('user_id', 'not.is', null); // Only include team members with valid user_ids
      
    if (validationError) {
      console.error("Error validating players:", validationError);
      throw new Error("Failed to validate players");
    }
    
    // Filter to only include players with valid user_ids
    const validPlayerPairs = validPlayers.filter(p => p.user_id);
    
    if (validPlayerPairs.length === 0) {
      console.warn("No valid players with user_ids to record plus/minus stats for");
      return false;
    }
    
    console.log(`Found ${validPlayerPairs.length} players with valid user_ids out of ${playerIds.length} requested`);
    
    const statPromises = validPlayerPairs.map(player => 
      insertGameStat({
        gameId,
        playerId: player.id, // We keep using team_member.id in the function params for consistency
        statType: 'plusMinus',
        period,
        value: isPositive ? 1 : -1,
        details: isPositive ? 'plus' : 'minus'
      })
    );
    
    await Promise.all(statPromises);
    console.log(`Successfully recorded ${isPositive ? 'plus' : 'minus'} stats for ${validPlayerPairs.length} players`);
    return true;
  } catch (error) {
    console.error("Error recording plus/minus stats:", error);
    throw error;
  }
};
