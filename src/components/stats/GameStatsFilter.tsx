
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GameStat, StatType, User } from "@/types";

interface GameStatsFilterProps {
  stats: GameStat[];
  players: User[];
  games: { id: string; date: string }[];
  onFilter: (filtered: GameStat[]) => void;
  // Add controlled props
  playerId?: string;
  onPlayerIdChange?: (playerId: string) => void;
  gameId?: string;
  onGameIdChange?: (gameId: string) => void;
  period?: string;
  onPeriodChange?: (period: string) => void;
  statType?: string;
  onStatTypeChange?: (statType: string) => void;
  search?: string;
  onSearchChange?: (search: string) => void;
  hidePlayerFilter?: boolean;
}

export default function GameStatsFilter({ 
  stats, 
  players, 
  games, 
  onFilter,
  // Controlled props with default values
  playerId = "all", 
  onPlayerIdChange,
  gameId = "all", 
  onGameIdChange,
  period = "all", 
  onPeriodChange,
  statType = "all", 
  onStatTypeChange,
  search = "", 
  onSearchChange,
  hidePlayerFilter = false
}: GameStatsFilterProps) {
  // Use local state only if controlled props aren't provided
  const handlePlayerChange = (value: string) => {
    if (onPlayerIdChange) {
      onPlayerIdChange(value);
    }
  };
  
  const handleGameChange = (value: string) => {
    if (onGameIdChange) {
      onGameIdChange(value);
    }
  };
  
  const handlePeriodChange = (value: string) => {
    if (onPeriodChange) {
      onPeriodChange(value);
    }
  };
  
  const handleStatTypeChange = (value: string) => {
    if (onStatTypeChange) {
      onStatTypeChange(value);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
      {!hidePlayerFilter && (
        <Input
          placeholder="Search player name"
          value={search}
          onChange={handleSearchChange}
          className="w-full"
        />
      )}
      
      {!hidePlayerFilter && players.length > 1 && (
        <Select value={playerId} onValueChange={handlePlayerChange}>
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
      
      <Select value={gameId} onValueChange={handleGameChange}>
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
      
      <Select value={period} onValueChange={handlePeriodChange}>
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
      
      <Select value={statType} onValueChange={handleStatTypeChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by stat type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Stat Types</SelectItem>
          <SelectItem value="goals">Goals</SelectItem>
          <SelectItem value="assists">Assists</SelectItem>
          <SelectItem value="plusMinus">Plus/Minus</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
