
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameStat } from "@/types";
import { Game } from "@/types";

interface GameStatsListProps {
  gameStats: GameStat[];
  game: Game;
  onDelete: (statId: string) => void;
}

export default function GameStatsList({ gameStats, game, onDelete }: GameStatsListProps) {
  if (gameStats.length === 0) return null;

  // Format the display of stat values
  const formatStatValue = (statType: string, value: number): string => {
    if (statType === 'plusMinus') {
      // For plusMinus, format based on the actual value
      return value > 0 ? `+${value}` : `${value}`;
    }
    return value.toString();
  };

  // Get the CSS class for the value display
  const getValueClass = (statType: string, value: number): string => {
    if (statType === 'plusMinus') {
      return value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : '';
    }
    return '';
  };

  return (
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
                  p => p.id === stat.playerId || p.id === stat.player_id
                );
                const statType = stat.statType || stat.stat_type;
                const value = stat.value;
                return (
                  <tr key={stat.id} className="border-b">
                    <td className="py-2">{player?.name || 'Unknown Player'}</td>
                    <td className="py-2 capitalize">{statType}</td>
                    <td className="py-2">{stat.period}</td>
                    <td className={`py-2 ${getValueClass(statType, value)}`}>
                      {formatStatValue(statType, value)}
                    </td>
                    <td className="py-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDelete(stat.id)}
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
  );
}
