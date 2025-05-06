
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
  const formatStatValue = (statType: string, value: number, details?: string): string => {
    if (statType === 'plusMinus') {
      // For plusMinus, format based on the details (plus or minus event)
      if (details === 'plus') {
        return `+${value}`;
      } else if (details === 'minus') {
        return `-${value}`;
      }
      return value.toString();
    }
    return value.toString();
  };

  // Get the CSS class for the value display
  const getValueClass = (statType: string, details?: string): string => {
    if (statType === 'plusMinus') {
      return details === 'plus' ? 'text-green-600' : details === 'minus' ? 'text-red-600' : '';
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
                <th className="text-left pb-2">Details</th>
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
                    <td className={`py-2 ${getValueClass(stat.statType, stat.details)}`}>
                      {formatStatValue(stat.statType, stat.value, stat.details)}
                    </td>
                    <td className="py-2">{stat.details || '-'}</td>
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
