
import { Card } from "@/components/ui/card";
import { useGameScore } from "@/hooks/useGameScore";
import { Game } from "@/types";

interface GameScoreDisplayProps {
  gameId: string;
  game: Game;
}

export default function GameScoreDisplay({
  gameId,
  game
}: GameScoreDisplayProps) {
  const { homeScore, awayScore, loading } = useGameScore(gameId);
  
  const homeTeamName = game?.homeTeam?.name || 'Home';
  const awayTeamName = game?.awayTeam?.name || game?.opponent_name || 'Away';
  
  return (
    <Card className="p-4 flex items-center justify-center mb-4">
      <div className="flex items-center text-center">
        <div className="px-3">
          <p className="text-sm font-medium">{homeTeamName}</p>
          <p className="text-2xl font-bold">{loading ? '-' : homeScore}</p>
        </div>
        
        <div className="text-xl font-bold px-2">-</div>
        
        <div className="px-3">
          <p className="text-sm font-medium">{awayTeamName}</p>
          <p className="text-2xl font-bold">{loading ? '-' : awayScore}</p>
        </div>
      </div>
    </Card>
  );
}
