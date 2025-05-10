
import { Card } from "@/components/ui/card";

interface GameScoreDisplayProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
}

export default function GameScoreDisplay({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore
}: GameScoreDisplayProps) {
  return (
    <Card className="p-4 flex items-center justify-center">
      <div className="flex items-center text-center">
        <div className="px-3">
          <p className="text-sm font-medium">{homeTeam}</p>
          <p className="text-2xl font-bold">{homeScore}</p>
        </div>
        
        <div className="text-xl font-bold px-2">-</div>
        
        <div className="px-3">
          <p className="text-sm font-medium">{awayTeam}</p>
          <p className="text-2xl font-bold">{awayScore}</p>
        </div>
      </div>
    </Card>
  );
}
