
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Save } from "lucide-react";
import { mockGames } from "@/lib/mock-data";
import { GameStat } from "@/types";
import StatTracker from "@/components/stats/StatTracker";
import { useAuth } from "@/hooks/useAuth";

export default function TrackStats() {
  const { id } = useParams<{ id: string }>();
  const [gameStats, setGameStats] = useState<GameStat[]>([]);
  const { user } = useAuth();
  
  // Find the game in mock data
  const game = mockGames.find(g => g.id === id) || mockGames[0];
  
  // Find which stat types this user is assigned to track
  const userAssignment = user ? game.statTrackers.find(
    tracker => tracker.user.id === user.id
  ) : undefined;
  
  const assignedStatTypes = userAssignment?.statTypes || [];
  
  // Handler for stat recording
  const handleStatRecorded = (stat: GameStat) => {
    setGameStats(prev => [...prev, stat]);
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
          <Button className="gap-2">
            <Save className="h-4 w-4" /> Save All Stats
          </Button>
        </div>
      </div>

      {assignedStatTypes.length > 0 ? (
        <StatTracker 
          game={game}
          statTypes={assignedStatTypes}
          onStatRecorded={handleStatRecorded}
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
                  </tr>
                </thead>
                <tbody>
                  {gameStats.map((stat, idx) => {
                    const player = [...game.homeTeam.players, ...game.awayTeam.players].find(
                      p => p.id === stat.playerId
                    );
                    return (
                      <tr key={idx} className="border-b">
                        <td className="py-2">{player?.name || 'Unknown Player'}</td>
                        <td className="py-2 capitalize">{stat.statType}</td>
                        <td className="py-2">{stat.period}</td>
                        <td className="py-2">{stat.value}</td>
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
