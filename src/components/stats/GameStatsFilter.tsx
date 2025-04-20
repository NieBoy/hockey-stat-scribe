
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GameStat, StatType, User } from "@/types";

interface GameStatsFilterProps {
  stats: GameStat[];
  players: User[];
  games: { id: string; date: string }[];
  onFilter: (filtered: GameStat[]) => void;
}

export default function GameStatsFilter({ stats, players, games, onFilter }: GameStatsFilterProps) {
  const [playerId, setPlayerId] = useState<string>("all");
  const [gameId, setGameId] = useState<string>("all");
  const [period, setPeriod] = useState<string>("all");
  const [statType, setStatType] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Add filtering logic
  const filteredStats = useMemo(() => {
    return stats.filter(stat => {
      const matchesPlayer = playerId === "all" || stat.playerId === playerId;
      const matchesGame = gameId === "all" || stat.gameId === gameId;
      const matchesPeriod = period === "all" || stat.period?.toString() === period;
      const matchesStatType = statType === "all" || stat.statType === statType;
      // Filter by player name as well:
      const playerName = players.find(p => p.id === stat.playerId)?.name?.toLowerCase() ?? "";
      const matchesSearch = playerName.includes(search.toLowerCase());

      return matchesPlayer && matchesGame && matchesPeriod && matchesStatType && matchesSearch;
    });
  }, [stats, playerId, gameId, period, statType, search, players]);

  // On changes, notify parent
  useMemo(() => {
    onFilter(filteredStats);
    // eslint-disable-next-line
  }, [filteredStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-4">
      <Input
        placeholder="Search player name"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full"
      />
      <Select value={playerId} onValueChange={setPlayerId}>
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
      <Select value={gameId} onValueChange={setGameId}>
        <SelectTrigger>
          <SelectValue placeholder="Filter by game" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Games</SelectItem>
          {games.map(game => (
            <SelectItem key={game.id} value={game.id}>Game {game.id.slice(0, 8)} - {new Date(game.date).toLocaleDateString()}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={setPeriod}>
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
      <Select value={statType} onValueChange={setStatType}>
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
