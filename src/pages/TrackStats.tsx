
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Save } from "lucide-react";
import { GameStat } from "@/types";
import StatTracker from "@/components/stats/StatTracker";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { fetchGameStats, insertGameStat, deleteGameStat } from "@/services/stats/gameStatsService";
import { useToast } from "@/hooks/use-toast";

export default function TrackStats() {
  const { id } = useParams<{ id: string }>();
  const [gameStats, setGameStats] = useState<GameStat[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Find the game in mock data or fetch from backend
  const game = mockGames.find(g => g.id === id) || mockGames[0];
  
  // Find which stat types this user is assigned to track
  const userAssignment = user ? game.statTrackers.find(
    tracker => tracker.user.id === user.id
  ) : undefined;
  
  const assignedStatTypes = userAssignment?.statTypes || [];
  
  // Fetch existing game stats on component mount
  useEffect(() => {
    const loadGameStats = async () => {
      if (id) {
        try {
          const stats = await fetchGameStats(id);
          setGameStats(stats);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load game stats",
            variant: "destructive"
          });
        }
      }
    };
    loadGameStats();
  }, [id]);

  // Real-time stats subscription
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel('game_stats_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_stats', 
          filter: `game_id=eq.${id}` 
        },
        (payload) => {
          switch(payload.eventType) {
            case 'INSERT':
              const newStat = {
                id: payload.new.id,
                gameId: payload.new.game_id,
                playerId: payload.new.player_id,
                statType: payload.new.stat_type,
                period: payload.new.period,
                timestamp: new Date(payload.new.timestamp),
                value: payload.new.value,
                details: payload.new.details || ''
              };
              setGameStats(prev => [...prev, newStat]);
              break;
            case 'DELETE':
              setGameStats(prev => 
                prev.filter(stat => stat.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);
  
  // Handler for stat recording
  const handleStatRecorded = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
    try {
      const insertedStat = await insertGameStat(stat);
      // Note: The real-time listener will handle adding the stat to state
      toast({
        title: "Stat Recorded",
        description: "The stat has been successfully recorded."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record stat",
        variant: "destructive"
      });
    }
  };

  // Handler for saving all stats (optional)
  const handleSaveAllStats = async () => {
    try {
      // Batch insert or update logic can be added here if needed
      toast({
        title: "Stats Saved",
        description: "All stats have been saved successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save stats",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="ghost" className="gap-1 mb-4" asChild>
          <Link to={`/games/${id}`}>
            <ChevronLeft className="h-4 w-4" /> Back to Game
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Tracking Stats</h1>
            <p className="text-muted-foreground">
              {game.homeTeam.name} vs {game.awayTeam.name}
            </p>
          </div>
          <Button 
            className="gap-2" 
            onClick={handleSaveAllStats}
          >
            <Save className="h-4 w-4" /> Save All Stats
          </Button>
        </div>
      </div>

      {assignedStatTypes.length > 0 ? (
        <StatTracker 
          game={game}
          statTypes={assignedStatTypes}
          onStatRecorded={handleStatRecorded}
          existingStats={gameStats}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Stat Tracking Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You haven't been assigned to track any stats for this game. Contact the coach to get assigned.
            </p>
            <Button asChild>
              <Link to={`/games/${id}`}>Return to Game</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {gameStats.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Stats Recorded This Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-2">Player</th>
                    <th className="text-left pb-2">Stat</th>
                    <th className="text-left pb-2">Period</th>
                    <th className="text-left pb-2">Value</th>
                    <th className="text-left pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gameStats.map((stat) => {
                    const player = [...game.homeTeam.players, ...game.awayTeam.players].find(
                      p => p.id === stat.playerId
                    );
                    return (
                      <tr key={stat.id} className="border-b">
                        <td className="py-2">{player?.name || 'Unknown Player'}</td>
                        <td className="py-2 capitalize">{stat.statType}</td>
                        <td className="py-2">{stat.period}</td>
                        <td className="py-2">{stat.value}</td>
                        <td className="py-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteGameStat(stat.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </MainLayout>
  );
}
