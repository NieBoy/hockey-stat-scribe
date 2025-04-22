
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PlayerStatsEmptyProps {
  gameStatsDebug?: any[];
  playerGameEvents?: any[];
  onRefresh: () => void;
  playerId: string;
  hasRawGameStats?: boolean;
  hasGameEvents?: boolean;
}

const PlayerStatsEmpty = ({ 
  onRefresh,
  hasGameEvents = false
}: PlayerStatsEmptyProps) => {
  return (
    <Card>
      <CardContent className="py-6">
        <div className="text-center p-8 space-y-4">
          <h2 className="text-xl font-semibold mb-2">No Stats Available</h2>
          <p className="mb-6">No player statistics were found. This could be because:</p>
          <ul className="list-disc list-inside mb-6 text-left max-w-md mx-auto">
            <li>No games have been played yet</li>
            <li>No stats have been recorded during games</li>
            <li>Stats need to be recalculated from game data</li>
          </ul>

          {hasGameEvents && (
            <Button 
              onClick={onRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Calculate Stats from Game Events
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsEmpty;
