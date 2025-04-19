
import { Button } from "@/components/ui/button";

interface EmptyStatsStateProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function EmptyStatsState({ onRefresh, isRefreshing }: EmptyStatsStateProps) {
  return (
    <div className="text-center p-8 border rounded-lg bg-muted/10">
      <h2 className="text-xl font-semibold mb-2">No Stats Available</h2>
      <p className="mb-6">No player statistics were found. This could be because:</p>
      <ul className="list-disc list-inside mb-6 text-left max-w-md mx-auto">
        <li>No games have been played yet</li>
        <li>No stats have been recorded during games</li>
        <li>Stats need to be recalculated from game data</li>
      </ul>
      <Button onClick={onRefresh} disabled={isRefreshing}>
        Calculate Stats from Game Data
      </Button>
    </div>
  );
}
