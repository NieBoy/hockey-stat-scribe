
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPlayerStats } from "@/services/stats/core/statsQueries";
import { fetchPlayerRawGameStats } from "@/services/stats/game-stats/queries";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export function usePlayerStatsData(playerId: string) {
  const [playerTeam, setPlayerTeam] = useState<any>(null);
  const [teamGames, setTeamGames] = useState<any[]>([]);

  // Fetch basic player stats
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

  // Fetch raw game stats
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
        console.log('Raw game stats fetched:', stats);
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
      console.log('Fetching events for player:', playerId);
      try {
        // First get player team info
        const { data: playerData, error: playerError } = await supabase
          .from('team_members')
          .select('team_id, name')
          .eq('id', playerId)
          .single();

        if (playerError) {
          console.error('Error fetching player data:', playerError);
          throw playerError;
        }

        if (!playerData) {
          console.error('No player data found for ID:', playerId);
          throw new Error("Player not found");
        }

        console.log('Found player team data:', playerData);
        setPlayerTeam(playerData);

        // Get team games
        const { data: games, error: gamesError } = await supabase
          .from('games')
          .select('*')
          .or(`home_team_id.eq.${playerData.team_id},away_team_id.eq.${playerData.team_id}`)
          .order('date', { ascending: false });

        if (gamesError) {
          console.error('Error fetching games:', gamesError);
          throw gamesError;
        }

        console.log(`Found ${games?.length || 0} team games`);
        setTeamGames(games || []);

        if (!games || games.length === 0) {
          console.log('No games found for team');
          return [];
        }

        // Get game IDs
        const gameIds = games.map(game => game.id);

        // Fix: Use proper JSONB containment operator for checking player involvement
        const { data: events, error: eventsError } = await supabase
          .from('game_events')
          .select('*')
          .in('game_id', gameIds)
          .or(
            `details->>'playerId'.eq.${playerId},` +
            `details->>'primaryAssistId'.eq.${playerId},` +
            `details->>'secondaryAssistId'.eq.${playerId},` +
            `details->'playersOnIce' ?? '[]' @> '[${playerId}]'`
          );

        if (eventsError) {
          console.error('Error fetching events:', eventsError);
          throw eventsError;
        }

        console.log(`Found ${events?.length || 0} game events for player`);
        return events || [];
      } catch (error) {
        console.error("Error in playerGameEvents query:", error);
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
