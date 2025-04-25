
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { PlayerStat, StatType } from "@/types";

export function useTeamStats(teamId: string) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Find all members of this team
  const { 
    data: teamMembers,
    isLoading: isLoadingMembers
  } = useQuery({
    queryKey: ['teamMembers', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name')
        .eq('team_id', teamId);
        
      if (error) throw error;
      return data || [];
    }
  });

  // Get stats for all team members
  const { 
    data: stats, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['teamStats', teamId],
    queryFn: async () => {
      // If no team members, return empty array
      if (!teamMembers || teamMembers.length === 0) return [];
      
      try {
        // Get all player IDs in this team
        const playerIds = teamMembers.map(member => member.id);
        
        // Get stats for all these players
        const { data, error } = await supabase
          .from('player_stats')
          .select('*')
          .in('player_id', playerIds);
        
        if (error) throw error;
        
        // Map the stats to include player names
        return (data || []).map(stat => {
          const player = teamMembers.find(m => m.id === stat.player_id);
          
          return {
            playerId: stat.player_id,
            statType: stat.stat_type as StatType,
            value: stat.value,
            gamesPlayed: stat.games_played,
            playerName: player?.name || 'Unknown Player'
          };
        });
      } catch (error) {
        console.error("Error fetching team stats:", error);
        throw error;
      }
    },
    enabled: teamMembers !== undefined && teamMembers.length > 0,
  });

  return {
    stats,
    isLoading: isLoading || isLoadingMembers,
    error,
    isRefreshing,
    refetch
  };
}
