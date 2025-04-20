
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GameStat, StatType, User } from "@/types";

interface GameStatsFilterProps {
  stats: GameStat[];
  players: User[];
  games: { id: string; date: string }[];
  onFilter: (filtered: GameStat[]) => void;
  // Controlled props
  gameId?: string;
  onGameIdChange?: (gameId: string) => void;
  period?: string;
  onPeriodChange?: (period: string) => void;
  statType?: string;
  onStatTypeChange?: (statType: string) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  hidePlayerFilter?: boolean;
  playerId?: string;
  onPlayerIdChange?: (playerId: string) => void;
}

export default function GameStatsFilter({ 
  stats, 
  players, 
  games, 
  // Controlled props with default values
  gameId = "all", 
  onGameIdChange,
  period = "all", 
  onPeriodChange,
  statType = "all", 
  onStatTypeChange,
  search = "", 
  onSearchChange,
  hidePlayerFilter = false,
  playerId = "all",
  onPlayerIdChange
}: GameStatsFilterProps) {
  
  // Make sure we have unique stat types for the filter
  const statTypes = [...new Set(stats.map(stat => stat.statType))];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
      {!hidePlayerFilter && (
        <Input
          placeholder="Search player name"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full"
        />
      )}
      
      {!hidePlayerFilter && players.length > 1 && (
        <Select value={playerId} onValueChange={(value) => onPlayerIdChange?.(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by player" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Players</SelectItem>
            {players.map(player => (
              <SelectItem key={player.id} value={player.id}>{player.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      
      <Select value={gameId} onValueChange={(value) => onGameIdChange?.(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by game" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Games</SelectItem>
          {games.map(game => (
            <SelectItem key={game.id} value={game.id}>
              Game {game.id.slice(0, 8)} - {new Date(game.date).toLocaleDateString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={period} onValueChange={(value) => onPeriodChange?.(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Periods</SelectItem>
          {[1,2,3,4,5].map(num => (
            <SelectItem key={num} value={num.toString()}>Period {num}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={statType} onValueChange={(value) => onStatTypeChange?.(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by stat type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stat Types</SelectItem>
          <SelectItem value="goals">Goals</SelectItem>
          <SelectItem value="assists">Assists</SelectItem>
          <SelectItem value="plusMinus">Plus/Minus</SelectItem>
          {statTypes.filter(type => !['goals', 'assists', 'plusMinus'].includes(type)).map(type => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
