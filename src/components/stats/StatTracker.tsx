
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Game, StatType, GameStat, User } from "@/types";
import PeriodSelector from "./PeriodSelector";
import TeamStats from "./TeamStats";
import { convertPlayersToUsers } from "@/utils/typeConversions";

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

  // Convert all players to User type
  const homeTeamPlayers = convertPlayersToUsers(game.homeTeam.players);
  const awayTeamPlayers = convertPlayersToUsers(game.awayTeam.players);
  const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];

  const getTeamName = (playerId: string): string => {
    const homePlayer = game.homeTeam.players.find(p => p.id === playerId);
    if (homePlayer) return game.homeTeam.name;
    
    const awayPlayer = game.awayTeam.players.find(p => p.id === playerId);
    if (awayPlayer) return game.awayTeam.name;

    return "Unknown Team";
  };

  const handleStatRecorded = (playerId: string, statType: StatType, value: number = 1) => {
    const newStat: Omit<GameStat, 'id' | 'timestamp'> = {
      game_id: game.id,
      player_id: playerId,
      stat_type: statType,
      period: selectedPeriod,
      value
    };
    
    onStatRecorded(newStat);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Stat Tracker</CardTitle>
        <CardDescription>
          {game.homeTeam.name} vs {game.awayTeam.name} | Period: {selectedPeriod}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <PeriodSelector 
            selectedPeriod={selectedPeriod} 
            onPeriodChange={setSelectedPeriod} 
          />
          <TeamStats
            players={allPlayers}
            statTypes={statTypes}
            stats={existingStats}
            period={selectedPeriod}
            getTeamName={getTeamName}
            onStatRecorded={handleStatRecorded}
          />
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
