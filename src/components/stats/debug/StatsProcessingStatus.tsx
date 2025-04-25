
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface StatsProcessingStatusProps {
  playerId?: string;
  onRefresh?: () => void;
  className?: string;
}

const StatsProcessingStatus = ({ playerId, onRefresh, className = "" }: StatsProcessingStatusProps) => {
  const { data: rawStats, isLoading: rawStatsLoading } = useQuery({
    queryKey: ['rawStatsCount', playerId],
    queryFn: async () => {
      if (!playerId) return { count: 0 };
      
      // Get count of raw game stats
      const { count, error } = await supabase
        .from('game_stats')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', playerId);
        
      if (error) throw error;
      
      return { count: count || 0 };
    },
    enabled: !!playerId
  });

  const { data: playerStats, isLoading: playerStatsLoading } = useQuery({
    queryKey: ['playerStatsCount', playerId],
    queryFn: async () => {
      if (!playerId) return { count: 0 };
      
      // Get count of processed player stats
      const { count, error } = await supabase
        .from('player_stats')
        .select('*', { count: 'exact', head: true })
        .eq('player_id', playerId);
        
      if (error) throw error;
      
      return { count: count || 0 };
    },
    enabled: !!playerId
  });

  const isLoading = rawStatsLoading || playerStatsLoading;
  const rawCount = rawStats?.count || 0;
  const statsCount = playerStats?.count || 0;

  // Determine status message and style
  let statusMessage = "No stats yet";
  let statusClass = "text-muted-foreground";

  if (rawCount > 0 && statsCount === 0) {
    statusMessage = "Raw stats found, but no processed stats";
    statusClass = "text-amber-500";
  } else if (rawCount > 0 && statsCount > 0) {
    statusMessage = "Stats processing complete";
    statusClass = "text-green-600";
  }

  return (
    <Card className={className}>
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          Stats Processing Status
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh stats</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-md p-2 text-center">
            <div className="text-xs text-muted-foreground">Raw Game Stats</div>
            <div className="font-semibold">{isLoading ? '...' : rawCount}</div>
          </div>
          <div className="bg-muted rounded-md p-2 text-center">
            <div className="text-xs text-muted-foreground">Processed Stats</div>
            <div className="font-semibold">{isLoading ? '...' : statsCount}</div>
          </div>
        </div>
        
        <div className="mt-2 text-center">
          <p className={`text-sm ${statusClass}`}>{statusMessage}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsProcessingStatus;
