
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPlayerStats } from "@/services/stats/core/statsQueries";
import { fetchPlayerRawGameStats } from "@/services/stats/game-stats/queries";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Hook to provide player stats data
 * @param playerId The team_member.id (not user.id) of the player
 */
export function usePlayerStatsData(playerId: string) {
  const [playerTeam, setPlayerTeam] = useState<any>(null);
  const [teamGames, setTeamGames] = useState<any[]>([]);

  // Fetch player stats using team_member.id
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: ['playerStats', playerId],
    queryFn: () => fetchPlayerStats(playerId),
    enabled: !!playerId
  });

  // Fetch raw game stats using team_member.id
  const {
    data: rawGameStats,
    isLoading: rawStatsLoading,
    error: rawStatsError,
    refetch: refetchRawStats
  } = useQuery({
    queryKey: ['rawGameStats', playerId],
    queryFn: async () => {
      try {
        const stats = await fetchPlayerRawGameStats(playerId);
        return stats;
      } catch (error) {
        console.error("Error fetching raw game stats:", error);
        toast.error("Could not load raw game stats");
        return [];
      }
    },
    enabled: !!playerId
  });

  // Fetch game events player was involved in
  const {
    data: playerGameEvents,
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents
  } = useQuery({
    queryKey: ['playerGameEvents', playerId],
    queryFn: async () => {
      try {
        // First get player team info
        const { data: playerData } = await supabase
          .from('team_members')
          .select('team_id, name')
          .eq('id', playerId)
          .single();

        if (!playerData) {
          throw new Error("Player not found");
        }

        setPlayerTeam(playerData);

        // Get team games
        const { data: games } = await supabase
          .from('games')
          .select('*')
          .or(`home_team_id.eq.${playerData.team_id},away_team_id.eq.${playerData.team_id}`)
          .order('date', { ascending: false });

        setTeamGames(games || []);

        if (!games || games.length === 0) return [];

        // Get game IDs
        const gameIds = games.map(game => game.id);

        // Get events where this player is mentioned in the details
        // Note: We need to search in the JSONB for player mentions
        const { data: events, error } = await supabase
          .from('game_events')
          .select('*')
          .in('game_id', gameIds)
          .or(`details->>'playerId'.eq.${playerId},details->>'primaryAssistId'.eq.${playerId},details->>'secondaryAssistId'.eq.${playerId}`)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        return events || [];
      } catch (error) {
        console.error("Error fetching player game events:", error);
        return [];
      }
    },
    enabled: !!playerId
  });

  return {
    stats,
    statsLoading: statsLoading || rawStatsLoading || eventsLoading,
    statsError: statsError || rawStatsError || eventsError,
    rawGameStats,
    playerGameEvents,
    playerTeam,
    teamGames,
    refetchStats,
    refetchRawStats,
    refetchEvents
  };
}
