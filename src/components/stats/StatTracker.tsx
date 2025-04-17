
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Game, StatType, GameStat } from "@/types";
import { Save } from "lucide-react";
import StatTypeSection from "./StatTypeSection";

interface StatTrackerProps {
  game: Game;
  statTypes: StatType[];
  onStatRecorded: (stat: GameStat) => void;
}

export default function StatTracker({ game, statTypes, onStatRecorded }: StatTrackerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [stats, setStats] = useState<GameStat[]>([]);

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
    const newStat: GameStat = {
      id: `temp-${Date.now()}`,
      gameId: game.id,
      playerId,
      statType,
      period: selectedPeriod,
      timestamp: new Date(),
      value,
      details: ""
    };
    
    setStats([...stats, newStat]);
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
          {statTypes.map((statType) => (
            <StatTypeSection
              key={statType}
              statType={statType}
              players={allPlayers}
              stats={stats.filter(s => s.statType === statType)}
              getTeamName={getTeamName}
              onStatRecorded={(playerId, value) => recordStat(playerId, statType, value)}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full gap-2">
          <Save className="h-4 w-4" /> Save All Stats
        </Button>
      </CardFooter>
    </Card>
  );
}
