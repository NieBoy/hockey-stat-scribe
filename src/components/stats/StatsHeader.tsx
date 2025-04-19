
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface StatsHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function StatsHeader({ onRefresh, isRefreshing }: StatsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Player Statistics</h1>
        <p className="text-muted-foreground">View and analyze player performance</p>
      </div>
      <Button 
        onClick={onRefresh} 
        disabled={isRefreshing}
        className="gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh All Stats
      </Button>
    </div>
  );
}
