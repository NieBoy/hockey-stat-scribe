
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

interface StatTrackerHeaderProps {
  gameId: string;
  homeTeamName?: string;
  awayTeamName?: string;
}

export const StatTrackerHeader = ({ gameId, homeTeamName, awayTeamName }: StatTrackerHeaderProps) => {
  return (
    <div className="space-y-6">
      <Button variant="ghost" className="mb-6" asChild>
        <Link to={`/games/${gameId}`} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" /> Back to Game
        </Link>
      </Button>

      <h1 className="text-2xl font-bold">
        {`Assign Stat Trackers for ${homeTeamName || 'Home Team'} vs ${awayTeamName || 'Away Team'}`}
      </h1>
    </div>
  );
};
