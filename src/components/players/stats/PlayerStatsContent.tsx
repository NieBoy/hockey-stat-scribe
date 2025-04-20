
import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const [isFixingUser, setIsFixingUser] = useState(false);

  useEffect(() => {
    // Reset filters when player data changes
    setGameId("all");
    setPeriod("all");
    setStatType("all");
  }, [playerId, player?.id]);

  // Process games data for the filter dropdown
  const games = useMemo(
    () => {
      const gamesMap = new Map();
      rawGameStats.forEach((g) => {
        const match = teamGames?.find(tm => tm.id === g.gameId);
        if (match) {
          gamesMap.set(g.gameId, { id: g.gameId, date: match.date });
        } else {
          gamesMap.set(g.gameId, { id: g.gameId, date: new Date().toISOString() });
        }
      });
      return Array.from(gamesMap.values());
    },
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
  const hasValidUserId = !!player?.user_id;
  const hasGameEvents = playerGameEvents && playerGameEvents.length > 0;

  const checkPlayerUserAssociation = async () => {
    if (!player) return { valid: false, userId: null };
    
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('id, name, user_id, email')
        .eq('id', playerId)
        .single();
        
      if (error || !data) {
        return { valid: false, userId: null };
      }
      
      return { valid: true, userId: data.user_id, email: data.email, name: data.name };
    } catch (err) {
      console.error("Error checking player user association:", err);
      return { valid: false, userId: null };
    }
  };

  // Function to manually fix user ID association if needed
  const handleFixUserAssociation = async () => {
    if (!playerId) {
      toast.error("Cannot fix user association without valid player data");
      return;
    }

    setIsFixingUser(true);
    try {
      toast.info("Checking user ID association...");
      
      // First check the current state
      const checkResult = await checkPlayerUserAssociation();
      if (!checkResult.valid) {
        toast.error("Cannot retrieve player data");
        setIsFixingUser(false);
        return;
      }
      
      if (checkResult.userId) {
        // Verify if user exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('id', checkResult.userId)
          .single();
          
        if (existingUser) {
          toast.success("User association already valid", { 
            description: `Player is already linked to user ${existingUser.name || existingUser.email}`
          });
          setIsFixingUser(false);
          return;
        }
        // User ID exists in team_members but not in users table - need to fix
      }
      
      // Try to find existing user with player's email
      if (checkResult.email) {
        const { data: emailUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', checkResult.email)
          .single();
          
        if (emailUser) {
          // Update team_member with this user_id
          const { error: updateError } = await supabase
            .from('team_members')
            .update({ user_id: emailUser.id })
            .eq('id', playerId);
            
          if (updateError) {
            toast.error("Failed to update team member with existing user ID");
            setIsFixingUser(false);
            return;
          }
          
          toast.success("Fixed user association", { 
            description: `Linked player to existing user with email ${checkResult.email}`
          });
          
          setTimeout(() => {
            onRefresh();
          }, 1000);
          setIsFixingUser(false);
          return;
        }
      }
      
      // Need to create new user
      const newUserId = crypto.randomUUID();
      
      // Create user in users table
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          name: checkResult.name || 'Player',
          email: checkResult.email || `player_${newUserId.substring(0, 8)}@example.com`
        });
        
      if (createError) {
        console.error("Failed to create user:", createError);
        toast.error(`Failed to create user: ${createError.message}`);
        setIsFixingUser(false);
        return;
      }
      
      // Update team member
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ user_id: newUserId })
        .eq('id', playerId);
        
      if (updateError) {
        console.error("Failed to update team member:", updateError);
        toast.error(`Failed to update team member: ${updateError.message}`);
        setIsFixingUser(false);
        return;
      }
      
      toast.success("Created new user and linked to player", {
        description: "Please refresh the page to see the changes"
      });
      
      setTimeout(() => {
        onRefresh();
      }, 1000);
    } catch (error) {
      console.error("Error fixing user association:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsFixingUser(false);
    }
  };

  const displayNoStats = () => (
    <div className="mb-4">
      <p className="text-muted-foreground">No stats available for this player.</p>
      
      {!hasValidUserId && (
        <div className="mt-4 border border-orange-300 bg-orange-50 p-4 rounded-md">
          <h3 className="text-orange-800 font-medium">Missing User Association</h3>
          <p className="text-orange-700 mt-2">
            This player doesn't have a valid user ID connection, which prevents stats from being recorded properly.
          </p>
          <button 
            className="mt-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-md"
            onClick={handleFixUserAssociation}
            disabled={isFixingUser}
          >
            {isFixingUser ? "Fixing..." : "Fix User Association"}
          </button>
        </div>
      )}
    </div>
  );

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
        ) : displayNoStats()}

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
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleFixUserAssociation}
              disabled={isFixingUser}
            >
              {isFixingUser ? "Creating User Association..." : "Fix User Association"}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Click this button to create and link a user account for this player.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
