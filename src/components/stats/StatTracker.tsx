
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Game, StatType, User, GameStat } from "@/types";
import { PlusCircle, MinusCircle, Save } from "lucide-react";
import { mockUsers } from "@/lib/mock-data";

interface StatTrackerProps {
  game: Game;
  statTypes: StatType[];
  user: User;
  onStatRecorded: (stat: GameStat) => void;
}

export default function StatTracker({ game, statTypes, user, onStatRecorded }: StatTrackerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [stats, setStats] = useState<GameStat[]>([]);

  // Filter only the players from both teams
  const allPlayers = [
    ...game.homeTeam.players,
    ...game.awayTeam.players
  ];

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

  const getPlayerName = (playerId: string): string => {
    const player = allPlayers.find(p => p.id === playerId);
    return player ? player.name : "Unknown Player";
  };

  const getTeamName = (playerId: string): string => {
    const homePlayer = game.homeTeam.players.find(p => p.id === playerId);
    if (homePlayer) return game.homeTeam.name;
    
    const awayPlayer = game.awayTeam.players.find(p => p.id === playerId);
    if (awayPlayer) return game.awayTeam.name;

    return "Unknown Team";
  };

  const StatTypeTracker = ({ statType }: { statType: StatType }) => {
    if (statType === 'goals' || statType === 'assists') {
      return (
        <div className="space-y-4">
          <h3 className="font-semibold capitalize">{statType}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allPlayers.map(player => (
              <Card key={`${statType}-${player.id}`} className="border-2 hover:border-primary/50">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm">{player.name}</CardTitle>
                  <CardDescription className="text-xs">{getTeamName(player.id)}</CardDescription>
                </CardHeader>
                <CardFooter className="p-3 pt-0 flex justify-between">
                  <span className="text-lg font-bold">
                    {stats.filter(s => s.playerId === player.id && s.statType === statType).reduce((acc, stat) => acc + stat.value, 0)}
                  </span>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => recordStat(player.id, statType)}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Record
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (statType === 'faceoffs') {
      return (
        <div className="space-y-4">
          <h3 className="font-semibold capitalize">Faceoffs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allPlayers.map(player => (
              <Card key={`faceoffs-${player.id}`} className="border-2 hover:border-primary/50">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm">{player.name}</CardTitle>
                  <CardDescription className="text-xs">{getTeamName(player.id)}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-2">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Won</div>
                      <div className="text-lg font-bold">
                        {stats.filter(s => s.playerId === player.id && s.statType === 'faceoffs' && s.value > 0).reduce((acc, stat) => acc + stat.value, 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Lost</div>
                      <div className="text-lg font-bold">
                        {stats.filter(s => s.playerId === player.id && s.statType === 'faceoffs' && s.value < 0).reduce((acc, stat) => acc + Math.abs(stat.value), 0)}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-3 pt-0 flex justify-between">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1"
                    onClick={() => recordStat(player.id, 'faceoffs', 1)}
                  >
                    <PlusCircle className="h-3 w-3" /> Won
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1"
                    onClick={() => recordStat(player.id, 'faceoffs', -1)}
                  >
                    <MinusCircle className="h-3 w-3" /> Lost
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    if (statType === 'hits') {
      return (
        <div className="space-y-4">
          <h3 className="font-semibold capitalize">Hits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allPlayers.map(player => (
              <Card key={`hits-${player.id}`} className="border-2 hover:border-primary/50">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm">{player.name}</CardTitle>
                  <CardDescription className="text-xs">{getTeamName(player.id)}</CardDescription>
                </CardHeader>
                <CardFooter className="p-3 pt-0 flex justify-between">
                  <span className="text-lg font-bold">
                    {stats.filter(s => s.playerId === player.id && s.statType === 'hits').reduce((acc, stat) => acc + stat.value, 0)}
                  </span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1"
                    onClick={() => recordStat(player.id, 'hits')}
                  >
                    <PlusCircle className="h-4 w-4" /> Record Hit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Stat Tracker</CardTitle>
        <CardDescription>
          {game.homeTeam.name} vs. {game.awayTeam.name} | Period:
          <div className="mt-2">
            <TabsList>
              {Array.from({ length: game.periods }, (_, i) => (
                <TabsTrigger 
                  key={i + 1} 
                  value={(i + 1).toString()} 
                  onClick={() => setSelectedPeriod(i + 1)}
                  className={selectedPeriod === i + 1 ? "bg-primary text-primary-foreground" : ""}
                >
                  {i + 1}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {statTypes.map((statType) => (
            <StatTypeTracker key={statType} statType={statType} />
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
