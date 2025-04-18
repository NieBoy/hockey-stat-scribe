
import { useQuery } from "@tanstack/react-query";
import { fetchGameStats } from "@/services/stats/gameStatsService";
import { getGameById } from "@/services/games";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface GameStatsProps {
  gameId: string;
}

export default function GameStats({ gameId }: GameStatsProps) {
  const { data: game, isLoading: isGameLoading } = useQuery({
    queryKey: ['games', gameId],
    queryFn: () => getGameById(gameId)
  });

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['gameStats', gameId],
    queryFn: () => fetchGameStats(gameId)
  });

  if (isGameLoading || isStatsLoading) {
    return <LoadingSpinner />;
  }

  if (!game || !stats) {
    return <p>No stats available</p>;
  }

  // Combine all players from both teams
  const allPlayers = [...game.homeTeam.players, ...game.awayTeam.players];

  // Group stats by player
  const playerStats = allPlayers.map(player => {
    const playerGameStats = stats.filter(stat => stat.playerId === player.id);
    
    return {
      player,
      goals: playerGameStats.filter(s => s.statType === 'goals').reduce((sum, s) => sum + s.value, 0),
      assists: playerGameStats.filter(s => s.statType === 'assists').reduce((sum, s) => sum + s.value, 0),
      // Handle plus/minus separately since these aren't actual StatType values but custom tracking
      plusMinus: playerGameStats.filter(s => s.statType === 'plusMinus' || s.details === 'plus' || s.details === 'minus')
        .reduce((sum, s) => {
          if (s.details === 'plus' || s.statType === 'plusMinus' && s.value > 0) {
            return sum + s.value;
          } else if (s.details === 'minus' || s.statType === 'plusMinus' && s.value < 0) {
            return sum + s.value; // value is already negative
          }
          return sum;
        }, 0)
    };
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">Goals</TableHead>
          <TableHead className="text-right">Assists</TableHead>
          <TableHead className="text-right">+/-</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {playerStats.map(({ player, goals, assists, plusMinus }) => (
          <TableRow key={player.id}>
            <TableCell>{player.name}</TableCell>
            <TableCell>
              {game.homeTeam.players.some(p => p.id === player.id) 
                ? game.homeTeam.name 
                : game.awayTeam.name}
            </TableCell>
            <TableCell className="text-right">{goals}</TableCell>
            <TableCell className="text-right">{assists}</TableCell>
            <TableCell className="text-right">{plusMinus}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
