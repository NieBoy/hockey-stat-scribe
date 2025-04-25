
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsOverview from "@/components/stats/StatsOverview";
import StatsDetailView from "@/components/stats/StatsDetailView";
import { PlayerStat } from "@/types";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface StatsContentProps {
  stats: PlayerStat[];
  rawGameStats: any[];
  playerGameEvents: any[];
  teamGames: any[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export default function StatsContent({
  stats,
  rawGameStats,
  playerGameEvents,
  teamGames,
  activeTab,
  onTabChange
}: StatsContentProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh stats only on initial mount, not when raw stats change
  // This prevents refresh loops and SQL errors
  useEffect(() => {
    const initialRefresh = async () => {
      if (rawGameStats && rawGameStats.length > 0) {
        const playerId = rawGameStats[0].player_id;
        console.log(`Initial stats refresh for player ${playerId}`);
        await refreshPlayerStats(playerId);
      }
    };

    initialRefresh();
  }, []); // Only run once on mount

  // Function to manually refresh stats
  const refreshPlayerStats = async (playerId: string) => {
    if (!playerId || isRefreshing) return;
    
    setIsRefreshing(true);
    console.log(`Refreshing stats for player ${playerId}`);
    
    try {
      const { error } = await supabase.rpc('refresh_player_stats', {
        player_id: playerId
      });
      
      if (error) {
        console.error('Error refreshing stats:', error);
        toast.error('Failed to refresh stats');
        return false;
      } else {
        console.log('Stats refreshed successfully');
        toast.success('Stats refreshed successfully');
        return true;
      }
    } catch (err) {
      console.error('Error calling refresh_player_stats:', err);
      toast.error('Error refreshing stats');
      return false;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Manual refresh button handler
  const handleManualRefresh = async () => {
    if (rawGameStats && rawGameStats.length > 0) {
      const playerId = rawGameStats[0].player_id;
      await refreshPlayerStats(playerId);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={handleManualRefresh} 
          disabled={isRefreshing} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Stats"}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="mt-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">Game History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <StatsOverview stats={stats || []} />
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <StatsDetailView stats={stats || []} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <p className="text-muted-foreground">
            Game history coming soon...
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
