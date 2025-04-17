
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Game, StatType, GameStat } from "@/types";
import { Save } from "lucide-react";
import StatTypeSection from "./StatTypeSection";

interface StatTrackerProps {
  game: Game;
  statTypes: StatType[];
  onStatRecorded: (stat: Omit<GameStat, 'id' | 'timestamp'>) => void;
  existingStats?: GameStat[];
}

export default function StatTracker({ 
  game, 
  statTypes, 
  onStatRecorded, 
  existingStats = [] 
}: StatTrackerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [stats, setStats] = useState<GameStat[]>(existingStats);

  // Update stats when existing stats change
  useEffect(() => {
    setStats(existingStats);
  }, [existingStats]);

  // Combine players from both teams
  const allPlayers = [...game.homeTeam.players, ...game.awayTeam.players];

  const getTeamName = (playerId: string): string => {
    const homePlayer = game.homeTeam.players.find(p => p.id === playerId);
    if (homePlayer) return game.homeTeam.name;
    
    const awayPlayer = game.awayTeam.players.find(p => p.id === playerId);
    if (awayPlayer) return game.awayTeam.name;

    return "Unknown Team";
  };

  const recordStat = (playerId: string, statType: StatType, value: number = 1) => {
    const newStat: Omit<GameStat, 'id' | 'timestamp'> = {
      gameId: game.id,
      playerId,
      statType,
      period: selectedPeriod,
      value,
      details: ""
    };
    
    onStatRecorded(newStat);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Stat Tracker</CardTitle>
        <CardDescription>
          {game.homeTeam.name} vs. {game.awayTeam.name} | Period: {selectedPeriod}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex justify-center space-x-4 mb-4">
            {[1, 2, 3, 4].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                onClick={() => setSelectedPeriod(period)}
              >
                {period === 4 ? "Overtime" : `Period ${period}`}
              </Button>
            ))}
          </div>
          {statTypes.map((statType) => (
            <StatTypeSection
              key={statType}
              statType={statType}
              players={allPlayers}
              stats={stats.filter(s => s.statType === statType && s.period === selectedPeriod)}
              getTeamName={getTeamName}
              onStatRecorded={(playerId, value) => recordStat(playerId, statType, value)}
              showWonLost={statType === 'faceoffs'}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full text-center">
          <p className="text-muted-foreground text-sm mb-2">
            Select a period and record stats for each player
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}
