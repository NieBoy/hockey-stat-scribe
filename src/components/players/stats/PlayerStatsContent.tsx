
import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SortableStatsTable } from "@/components/stats/SortableStatsTable";
import { PlayerStat, GameStat } from "@/types";
import EmptyStatsContent from "@/components/players/stats/empty-state/EmptyStatsContent";
import PlayerStatsDebug from "@/components/players/PlayerStatsDebug";
import GameStatsFilter from "@/components/stats/GameStatsFilter";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

function filterGameStats(
  stats: GameStat[],
  filters: {
    gameId: string,
    period: string,
    statType: string
  }
) {
  return stats.filter(stat => {
    const matchesGame = filters.gameId === "all" || stat.gameId === filters.gameId;
    const matchesPeriod = filters.period === "all" || stat.period?.toString() === filters.period;
    const matchesStatType = filters.statType === "all" || stat.statType === filters.statType;
    return matchesGame && matchesPeriod && matchesStatType;
  });
}

// Group stats by type for better display
function aggregateGameStats(stats: GameStat[]): PlayerStat[] {
  if (!stats || stats.length === 0) return [];
  
  const statsByType = new Map<string, { value: number, gameIds: Set<string> }>();
  
  // First pass: group by stat type
  stats.forEach(stat => {
    const key = stat.statType;
    if (!statsByType.has(key)) {
      statsByType.set(key, { value: 0, gameIds: new Set() });
    }
    const existing = statsByType.get(key)!;
    existing.value += stat.value;
    existing.gameIds.add(stat.gameId);
  });
  
  // Convert to array of PlayerStat objects
  return Array.from(statsByType.entries()).map(([statType, data]) => ({
    playerId: stats[0].playerId, // All stats are for the same player
    statType: statType as any,
    value: data.value,
    gamesPlayed: data.gameIds.size,
    playerName: 'Player' // Will be set by SortableStatsTable
  }));
}

interface PlayerStatsContentProps {
  stats: PlayerStat[];
  showDebugInfo: boolean;
  player: any | null;
  playerTeam: any;
  teamGames: any[];
  rawGameStats: GameStat[];
  playerGameEvents: any[];
  onRefresh: () => void;
  playerId: string;
}

export default function PlayerStatsContent({
  stats,
  showDebugInfo,
  player,
  playerTeam,
  teamGames,
  rawGameStats,
  playerGameEvents,
  onRefresh,
  playerId
}: PlayerStatsContentProps) {
  const [gameId, setGameId] = useState<string>("all");
  const [period, setPeriod] = useState<string>("all");
  const [statType, setStatType] = useState<string>("all");

  // Process games data for the filter dropdown
  const games = useMemo(
    () =>
      [...new Map(
        rawGameStats.map((g) => [g.gameId, { 
          id: g.gameId, 
          date: (() => {
            const match = teamGames?.find(tm => tm.id === g.gameId);
            if (match) return match.date;
            return new Date().toISOString();
          })() 
        }])
      ).values()],
    [rawGameStats, teamGames]
  );

  // Filter raw game stats based on selected filters
  const filteredRawStats = useMemo(() => 
    filterGameStats(rawGameStats, { gameId, period, statType }),
  [rawGameStats, gameId, period, statType]);
  
  // Aggregate filtered stats for display
  const aggregatedStats = useMemo(() => 
    aggregateGameStats(filteredRawStats),
  [filteredRawStats]);

  const hasRawGameStats = rawGameStats && rawGameStats.length > 0;
  const isPlayerValid = !!player;
  const hasValidUserId = !!player?.id;
  const hasGameEvents = playerGameEvents && playerGameEvents.length > 0;

  // Function to manually fix user ID association if needed
  const handleFixUserAssociation = async () => {
    if (!player || !playerId) {
      toast.error("Cannot fix user association without valid player data");
      return;
    }

    try {
      toast.info("Attempting to fix user ID association...");
      
      // First get the team member record
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('id, name, email, user_id')
        .eq('id', playerId)
        .single();
        
      if (memberError) {
        console.error("Error fetching team member:", memberError);
        toast.error(`Could not fetch team member: ${memberError.message}`);
        return;
      }
      
      if (!memberData) {
        toast.error("Team member not found");
        return;
      }
      
      // If there's already a user_id, check if that user exists
      if (memberData.user_id) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', memberData.user_id)
          .single();
          
        if (existingUser) {
          toast.success("User association already exists and is valid", { 
            description: `Player ${memberData.name} is linked to user ${existingUser.name || existingUser.email}`
          });
          return;
        }
      }
      
      // Try to create or find a user based on email
      if (memberData.email) {
        // Check if user with this email already exists
        const { data: emailUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', memberData.email)
          .single();
          
        if (emailUser) {
          // Update the team member with this user_id
          const { error: updateError } = await supabase
            .from('team_members')
            .update({ user_id: emailUser.id })
            .eq('id', playerId);
            
          if (updateError) {
            toast.error("Failed to update team member with existing user ID");
            return;
          }
          
          toast.success("Fixed user association", { 
            description: `Linked player to existing user with email ${memberData.email}`
          });
          
          setTimeout(() => {
            onRefresh();
          }, 1000);
          return;
        }
        
        // Create a new user
        const newUserId = crypto.randomUUID();
        
        // Create user in users table
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: newUserId,
            name: memberData.name,
            email: memberData.email
          });
          
        if (createError) {
          toast.error(`Failed to create user: ${createError.message}`);
          return;
        }
        
        // Update team member
        const { error: updateError } = await supabase
          .from('team_members')
          .update({ user_id: newUserId })
          .eq('id', playerId);
          
        if (updateError) {
          toast.error(`Failed to update team member: ${updateError.message}`);
          return;
        }
        
        toast.success("Created new user and linked to player", {
          description: "Please refresh the page to see the changes"
        });
        
        setTimeout(() => {
          onRefresh();
        }, 1000);
        return;
      }
      
      toast.error("Cannot fix user association", {
        description: "Player doesn't have an email address to link to a user account"
      });
      
    } catch (error) {
      console.error("Error fixing user association:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <Card>
      <CardContent className="py-6">
        {hasRawGameStats ? (
          <div className="mb-4">
            <GameStatsFilter
              stats={rawGameStats}
              players={player ? [player] : []}
              games={games}
              onFilter={() => {
                // All logic handled by local state
              }}
              // Use controlled props for the filter
              gameId={gameId}
              onGameIdChange={setGameId}
              period={period}
              onPeriodChange={setPeriod}
              statType={statType}
              onStatTypeChange={setStatType}
              hidePlayerFilter={true} // Hide player filter as this is a single player view
            />
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-muted-foreground">No stats available for this player.</p>
            
            {!hasValidUserId && (
              <div className="mt-4 border border-orange-300 bg-orange-50 p-4 rounded-md">
                <h3 className="text-orange-800 font-medium">Missing User Association</h3>
                <p className="text-orange-700 mt-2">
                  This player doesn't have a valid user ID connection, which may prevent stats from being recorded properly.
                </p>
                <button 
                  className="mt-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md"
                  onClick={handleFixUserAssociation}
                >
                  Fix User Association
                </button>
              </div>
            )}
          </div>
        )}

        {filteredRawStats && filteredRawStats.length > 0 ? (
          <>
            {/* Display aggregated stats (grouped by stat type) */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Aggregated Stats</h3>
              <SortableStatsTable
                stats={aggregatedStats}
                getPlayerName={() => player?.name || "Player"}
              />
            </div>
            
            {/* Display individual game stats */}
            <div>
              <h3 className="text-lg font-medium mb-2">Individual Game Stats</h3>
              <SortableStatsTable
                stats={filteredRawStats.map(stat => ({
                  playerId: stat.playerId,
                  statType: stat.statType,
                  value: stat.value,
                  gamesPlayed: 1,
                  playerName: player?.name || 'Player'
                }))}
                getPlayerName={() => player?.name || "Player"}
              />
            </div>
          </>
        ) : (
          <EmptyStatsContent
            gameStatsDebug={rawGameStats || []}
            playerGameEvents={playerGameEvents}
            onRefresh={onRefresh}
            isPlayerValid={isPlayerValid}
            hasValidUserId={hasValidUserId}
            playerId={playerId}
            hasRawGameStats={hasRawGameStats}
            hasGameEvents={hasGameEvents}
          />
        )}
        
        {showDebugInfo && (
          <PlayerStatsDebug
            player={player}
            playerTeam={playerTeam}
            teamGames={teamGames || []}
            rawGameStats={rawGameStats || []}
            playerGameEvents={playerGameEvents || []}
            stats={stats || []}
          />
        )}

        {!hasValidUserId && !hasRawGameStats && (
          <div className="mt-4">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              onClick={handleFixUserAssociation}
            >
              Fix User Association
            </button>
            <p className="text-sm text-muted-foreground mt-2">
              Click this button to create and link a user account for this player.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
