
import React, { useState } from "react";
import { GameStat } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GameStatsViewProps {
  gameStats: GameStat[];
  gameEvents: any[]; // Will type more specifically if/when needed
  games: any[]; // Will be typed more specifically when used
}

const GameStatsView: React.FC<GameStatsViewProps> = ({ gameStats, gameEvents, games }) => {
  const [selectedGame, setSelectedGame] = useState<string>("all");
  
  // Filter stats by selected game
  const filteredStats = selectedGame === "all" 
    ? gameStats 
    : gameStats.filter(stat => stat.gameId === selectedGame);

  // Group stats by game for display
  const statsByGame = filteredStats.reduce((acc, stat) => {
    if (!acc[stat.gameId]) {
      acc[stat.gameId] = [];
    }
    acc[stat.gameId].push(stat);
    return acc;
  }, {} as Record<string, GameStat[]>);

  // Find game by ID
  const getGameInfo = (gameId: string) => {
    return games?.find(g => g.id === gameId) || { 
      date: new Date(), 
      location: "Unknown" 
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Game-by-Game Statistics</h3>
        
        <div className="w-[200px]">
          <Select 
            value={selectedGame} 
            onValueChange={setSelectedGame}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by game" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Games</SelectItem>
              {games?.map(game => (
                <SelectItem key={game.id} value={game.id}>
                  {formatDate(new Date(game.date))}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {Object.keys(statsByGame).length > 0 ? (
        Object.keys(statsByGame).map(gameId => {
          const game = getGameInfo(gameId);
          const gameDate = game.date ? new Date(game.date) : new Date();
          
          return (
            <Card key={gameId} className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">
                  {formatDate(gameDate)} - {game.location}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Stat Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {statsByGame[gameId].map(stat => (
                      <TableRow key={stat.id}>
                        <TableCell className="capitalize">{formatStatType(stat.statType)}</TableCell>
                        <TableCell>{stat.period}</TableCell>
                        <TableCell className={`text-right ${stat.statType === 'plusMinus' ? 
                          (stat.details === 'plus' ? 'text-green-600' : 'text-red-600') : ''}`}>
                          {stat.statType === 'plusMinus' ? 
                            (stat.details === 'plus' ? `+${stat.value}` : `-${stat.value}`) : 
                            stat.value}
                        </TableCell>
                        <TableCell>{formatDetails(stat.statType, stat.details || '-')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              No game statistics available for this player.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper function to format stat types for display
const formatStatType = (type: string): string => {
  switch(type) {
    case 'goals': return 'Goal';
    case 'assists': return 'Assist';
    case 'shots': return 'Shot';
    case 'plusMinus': return 'Plus/Minus';
    case 'hits': return 'Hit';
    case 'blocks': return 'Block';
    case 'penalties': return 'Penalty';
    case 'faceoffs': return 'Faceoff';
    case 'faceoff_wins': return 'Faceoff Win';
    case 'faceoff_losses': return 'Faceoff Loss';
    default: return type;
  }
};

// Helper function to format details for display
const formatDetails = (statType: string, details: string): string => {
  if (statType === 'plusMinus') {
    return details === 'plus' ? 'On ice for team goal' : 'On ice for opponent goal';
  }
  return details === '-' ? '-' : details;
};

export default GameStatsView;
