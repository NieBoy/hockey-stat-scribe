
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertCircle, Play, FileDigit } from "lucide-react";
import { processEventsToStats } from "@/services/stats/core/gameEventProcessor";
import { supabase } from "@/lib/supabase";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";

interface StatsSystemDebugProps {
  playerId?: string;
  teamId?: string;
  gameId?: string;
  onProcessingComplete?: () => void;
}

const StatsSystemDebug = ({ 
  playerId, 
  teamId, 
  gameId, 
  onProcessingComplete 
}: StatsSystemDebugProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    events: 0,
    rawStats: 0,
    playerStats: 0,
    lastProcessed: null as Date | null
  });

  // Fetch basic stats counts to display in the debug panel
  const fetchStatsOverview = async () => {
    try {
      setDebugLog(prev => [...prev, "Fetching stats overview..."]);
      
      // Get events count
      let query = supabase.from('game_events').select('*', { count: 'exact', head: true });
      if (gameId) query = query.eq('game_id', gameId);
      const { count: eventsCount, error: eventsError } = await query;
      
      if (eventsError) throw eventsError;
      
      // Get raw game stats count
      let statsQuery = supabase.from('game_stats').select('*', { count: 'exact', head: true });
      if (playerId) statsQuery = statsQuery.eq('player_id', playerId);
      if (gameId) statsQuery = statsQuery.eq('game_id', gameId);
      const { count: rawStatsCount, error: statsError } = await statsQuery;
      
      if (statsError) throw statsError;
      
      // Get player stats count
      let playerStatsQuery = supabase.from('player_stats').select('*', { count: 'exact', head: true });
      if (playerId) playerStatsQuery = playerStatsQuery.eq('player_id', playerId);
      const { count: playerStatsCount, error: playerStatsError } = await playerStatsQuery;
      
      if (playerStatsError) throw playerStatsError;
      
      setStats({
        events: eventsCount || 0,
        rawStats: rawStatsCount || 0,
        playerStats: playerStatsCount || 0,
        lastProcessed: new Date()
      });
      
      setDebugLog(prev => [...prev, `Found ${eventsCount} events, ${rawStatsCount} raw stats, and ${playerStatsCount} player stats`]);
    } catch (error) {
      console.error("Error fetching stats overview:", error);
      setDebugLog(prev => [...prev, `Error fetching stats: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    }
  };

  // Process events for a specific player
  const handleProcessEventsForPlayer = async () => {
    if (!playerId) {
      toast.error("No player ID provided");
      return;
    }
    
    setIsProcessing(true);
    setSuccess(null);
    setDebugLog(["Starting events processing for player..."]);
    
    try {
      // Fetch events for this player's team
      const { data: playerData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('id', playerId)
        .single();
        
      if (!playerData?.team_id) {
        throw new Error("Could not determine player's team");
      }
      
      // Get games for this team
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('id')
        .or(`home_team_id.eq.${playerData.team_id},away_team_id.eq.${playerData.team_id}`);
        
      if (gamesError) throw gamesError;
      
      if (!games || games.length === 0) {
        setDebugLog(prev => [...prev, "No games found for this player's team"]);
        setSuccess(false);
        return;
      }
      
      setDebugLog(prev => [...prev, `Found ${games.length} games to process for player ${playerId}`]);
      
      // For each game, get events and process them for this player
      let totalEventsProcessed = 0;
      let successfulGames = 0;
      
      for (const game of games) {
        setDebugLog(prev => [...prev, `Processing game ${game.id}...`]);
        
        const { data: events, error: eventsError } = await supabase
          .rpc('get_game_events', { p_game_id: game.id });
          
        if (eventsError) {
          setDebugLog(prev => [...prev, `Error getting events for game ${game.id}: ${eventsError.message}`]);
          continue;
        }
        
        if (!events || events.length === 0) {
          setDebugLog(prev => [...prev, `No events found for game ${game.id}`]);
          continue;
        }
        
        // Process events to stats for this player
        const result = await processEventsToStats(playerId, events);
        
        if (result) {
          successfulGames++;
          totalEventsProcessed += events.length;
          setDebugLog(prev => [...prev, `Successfully processed ${events.length} events for game ${game.id}`]);
        } else {
          setDebugLog(prev => [...prev, `Failed to process events for game ${game.id}`]);
        }
      }
      
      setDebugLog(prev => [...prev, 
        `Processing completed for player ${playerId}. ` +
        `Processed ${totalEventsProcessed} events across ${successfulGames} games.`
      ]);
      
      const success = successfulGames > 0;
      setSuccess(success);
      
      // Refresh the stats counts
      await fetchStatsOverview();
      
      if (onProcessingComplete) {
        onProcessingComplete();
      }
      
    } catch (error) {
      console.error("Error processing events:", error);
      setDebugLog(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process events for all players in a team
  const handleProcessEventsForTeam = async () => {
    if (!teamId) {
      toast.error("No team ID provided");
      return;
    }
    
    setIsProcessing(true);
    setSuccess(null);
    setDebugLog(["Starting events processing for team..."]);
    
    try {
      // Get all players in the team
      const { data: players, error: playersError } = await supabase
        .from('team_members')
        .select('id, name')
        .eq('team_id', teamId)
        .eq('role', 'player');
        
      if (playersError) throw playersError;
      
      if (!players || players.length === 0) {
        setDebugLog(prev => [...prev, "No players found in this team"]);
        setSuccess(false);
        return;
      }
      
      setDebugLog(prev => [...prev, `Found ${players.length} players to process stats for`]);
      
      // Get all games for this team
      const { data: games, error: gamesError } = await supabase
        .from('games')
        .select('id')
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`);
        
      if (gamesError) throw gamesError;
      
      if (!games || games.length === 0) {
        setDebugLog(prev => [...prev, "No games found for this team"]);
        setSuccess(false);
        return;
      }
      
      setDebugLog(prev => [...prev, `Found ${games.length} games to process`]);
      
      // For each game, get events
      const gameEventsMap = new Map();
      
      for (const game of games) {
        const { data: events, error: eventsError } = await supabase
          .rpc('get_game_events', { p_game_id: game.id });
          
        if (eventsError) {
          setDebugLog(prev => [...prev, `Error getting events for game ${game.id}: ${eventsError.message}`]);
          continue;
        }
        
        if (events && events.length > 0) {
          gameEventsMap.set(game.id, events);
        }
      }
      
      // For each player, process events from all games
      let successfulPlayers = 0;
      
      for (const player of players) {
        setDebugLog(prev => [...prev, `Processing events for player: ${player.name} (${player.id})`]);
        
        let playerEventsProcessed = 0;
        let playerGamesProcessed = 0;
        
        for (const [gameId, events] of gameEventsMap.entries()) {
          if (!events || events.length === 0) continue;
          
          const result = await processEventsToStats(player.id, events);
          
          if (result) {
            playerEventsProcessed += events.length;
            playerGamesProcessed++;
          }
        }
        
        if (playerGamesProcessed > 0) {
          setDebugLog(prev => [...prev, 
            `Successfully processed ${playerEventsProcessed} events across ` +
            `${playerGamesProcessed} games for player ${player.name}`
          ]);
          successfulPlayers++;
        } else {
          setDebugLog(prev => [...prev, `No relevant events processed for player ${player.name}`]);
        }
      }
      
      const success = successfulPlayers > 0;
      setSuccess(success);
      setDebugLog(prev => [...prev, 
        `Processing completed for team. ` +
        `Successfully processed events for ${successfulPlayers} out of ${players.length} players.`
      ]);
      
      // Refresh the stats counts
      await fetchStatsOverview();
      
      if (onProcessingComplete) {
        onProcessingComplete();
      }
      
    } catch (error) {
      console.error("Error processing events for team:", error);
      setDebugLog(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process events for a specific game
  const handleProcessEventsForGame = async () => {
    if (!gameId) {
      toast.error("No game ID provided");
      return;
    }
    
    setIsProcessing(true);
    setSuccess(null);
    setDebugLog(["Starting events processing for game..."]);
    
    try {
      // Get teams for this game
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('home_team_id, away_team_id')
        .eq('id', gameId)
        .single();
        
      if (gameError) throw gameError;
      
      if (!game) {
        setDebugLog(prev => [...prev, "Game not found"]);
        setSuccess(false);
        return;
      }
      
      // Get all players from both teams
      const { data: players, error: playersError } = await supabase
        .from('team_members')
        .select('id, name, team_id')
        .in('team_id', [game.home_team_id, game.away_team_id])
        .eq('role', 'player');
        
      if (playersError) throw playersError;
      
      if (!players || players.length === 0) {
        setDebugLog(prev => [...prev, "No players found for teams in this game"]);
        setSuccess(false);
        return;
      }
      
      setDebugLog(prev => [...prev, `Found ${players.length} players to process stats for`]);
      
      // Get events for this game
      const { data: events, error: eventsError } = await supabase
        .rpc('get_game_events', { p_game_id: gameId });
        
      if (eventsError) throw eventsError;
      
      if (!events || events.length === 0) {
        setDebugLog(prev => [...prev, "No events found for this game"]);
        setSuccess(false);
        return;
      }
      
      setDebugLog(prev => [...prev, `Found ${events.length} events to process`]);
      
      // Process events for each player
      let successfulPlayers = 0;
      
      for (const player of players) {
        const result = await processEventsToStats(player.id, events);
        
        if (result) {
          successfulPlayers++;
          setDebugLog(prev => [...prev, `Successfully processed events for player ${player.name}`]);
        } else {
          setDebugLog(prev => [...prev, `No relevant events processed for player ${player.name}`]);
        }
      }
      
      const success = successfulPlayers > 0;
      setSuccess(success);
      setDebugLog(prev => [...prev, 
        `Processing completed for game. ` +
        `Successfully processed events for ${successfulPlayers} out of ${players.length} players.`
      ]);
      
      // Refresh the stats counts
      await fetchStatsOverview();
      
      if (onProcessingComplete) {
        onProcessingComplete();
      }
      
    } catch (error) {
      console.error("Error processing events for game:", error);
      setDebugLog(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Initial fetch of stats overview
  React.useEffect(() => {
    fetchStatsOverview();
  }, [playerId, gameId, teamId]);

  return (
    <Card className="mt-4">
      <CardHeader className="py-4">
        <CardTitle className="flex items-center text-base">
          <FileDigit className="h-4 w-4 mr-2" />
          Stats System Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-center">
            <div className="text-sm text-muted-foreground mb-1">Game Events</div>
            <div className="text-xl font-bold">{stats.events}</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-center">
            <div className="text-sm text-muted-foreground mb-1">Raw Game Stats</div>
            <div className="text-xl font-bold">{stats.rawStats}</div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded text-center">
            <div className="text-sm text-muted-foreground mb-1">Player Stats</div>
            <div className="text-xl font-bold">{stats.playerStats}</div>
          </div>
        </div>
        
        <Tabs defaultValue="process-player">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="process-player">Process Player</TabsTrigger>
            <TabsTrigger value="process-team">Process Team</TabsTrigger>
            <TabsTrigger value="process-game">Process Game</TabsTrigger>
          </TabsList>
          
          <TabsContent value="process-player" className="space-y-4">
            <div className="flex space-x-2 mt-4">
              <Button 
                onClick={handleProcessEventsForPlayer} 
                disabled={isProcessing || !playerId}
                size="sm"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Process Events to Stats
              </Button>
              
              <Button 
                variant="outline" 
                onClick={fetchStatsOverview} 
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Counts
              </Button>
            </div>
            
            {!playerId && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Player Selected</AlertTitle>
                <AlertDescription>
                  Select a player to process their events to stats.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="process-team" className="space-y-4">
            <div className="flex space-x-2 mt-4">
              <Button 
                onClick={handleProcessEventsForTeam} 
                disabled={isProcessing || !teamId}
                size="sm"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Process Team Events
              </Button>
              
              <Button 
                variant="outline" 
                onClick={fetchStatsOverview} 
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Counts
              </Button>
            </div>
            
            {!teamId && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Team Selected</AlertTitle>
                <AlertDescription>
                  Select a team to process events for all players.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="process-game" className="space-y-4">
            <div className="flex space-x-2 mt-4">
              <Button 
                onClick={handleProcessEventsForGame} 
                disabled={isProcessing || !gameId}
                size="sm"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                Process Game Events
              </Button>
              
              <Button 
                variant="outline" 
                onClick={fetchStatsOverview} 
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Counts
              </Button>
            </div>
            
            {!gameId && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Game Selected</AlertTitle>
                <AlertDescription>
                  Select a game to process events for all players.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
        
        {success !== null && (
          <Alert variant={success ? "default" : "destructive"}>
            <AlertDescription>
              {success 
                ? "Stats successfully processed! Reload the page to see changes." 
                : "Failed to process stats. See logs for details."}
            </AlertDescription>
          </Alert>
        )}
        
        {debugLog.length > 0 && (
          <Accordion type="single" collapsible>
            <AccordionItem value="logs">
              <AccordionTrigger>Debug Logs</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded text-xs overflow-auto max-h-60">
                  {debugLog.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsSystemDebug;
