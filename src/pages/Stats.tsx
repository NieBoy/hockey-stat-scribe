
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { getAllPlayerStats, refreshAllPlayerStats } from "@/services/stats";
import StatsHeader from "@/components/stats/StatsHeader";
import StatsContent from "@/components/stats/StatsContent";
import EmptyStatsState from "@/components/stats/EmptyStatsState";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerStat } from "@/types";

export default function Stats() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugData, setDebugData] = useState<{
    rawGameStats: any[];
    playerStats: any[];
    gameCount: number;
    playerCount: number;
  }>({
    rawGameStats: [],
    playerStats: [],
    gameCount: 0,
    playerCount: 0
  });
  
  const { data: stats, isLoading, error, refetch } = useQuery<PlayerStat[]>({
    queryKey: ['playerStats'],
    queryFn: getAllPlayerStats,
  });
  
  // Additional debug queries
  useQuery({
    queryKey: ['debugGameStats'],
    queryFn: async () => {
      try {
        // Check game_stats table
        const { data, error } = await supabase
          .from('game_stats')
          .select('*');
          
        if (error) throw error;
        
        setDebugData(prev => ({ ...prev, rawGameStats: data || [] }));
        return data;
      } catch (error) {
        console.error("Error fetching debug game stats:", error);
        return [];
      }
    }
  });
  
  useQuery({
    queryKey: ['debugPlayerStats'],
    queryFn: async () => {
      try {
        // Check player_stats table
        const { data, error } = await supabase
          .from('player_stats')
          .select('*');
          
        if (error) throw error;
        
        setDebugData(prev => ({ ...prev, playerStats: data || [] }));
        return data;
      } catch (error) {
        console.error("Error fetching debug player stats:", error);
        return [];
      }
    }
  });
  
  useQuery({
    queryKey: ['debugGameCount'],
    queryFn: async () => {
      try {
        // Count total games
        const { data, error, count } = await supabase
          .from('games')
          .select('*', { count: 'exact', head: true });
          
        if (error) throw error;
        
        setDebugData(prev => ({ ...prev, gameCount: count || 0 }));
        return count;
      } catch (error) {
        console.error("Error counting games:", error);
        return 0;
      }
    }
  });
  
  useQuery({
    queryKey: ['debugPlayerCount'],
    queryFn: async () => {
      try {
        // Count total players
        const { data, error, count } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'player');
          
        if (error) throw error;
        
        setDebugData(prev => ({ ...prev, playerCount: count || 0 }));
        return count;
      } catch (error) {
        console.error("Error counting players:", error);
        return 0;
      }
    }
  });
  
  useEffect(() => {
    console.log("Stats page - All player stats:", stats);
    console.log("Debug data:", debugData);
  }, [stats, debugData]);
  
  const handleRefreshAllStats = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllPlayerStats();
      toast.success("All player statistics have been recalculated.");
      await refetch();
    } catch (error) {
      toast.error("Failed to refresh statistics.");
      console.error("Error refreshing stats:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center text-red-500">
          Error loading stats: {(error as Error).message}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <StatsHeader 
            onRefresh={handleRefreshAllStats}
            isRefreshing={isRefreshing}
          />
          <Button
            variant="outline"
            onClick={toggleDebugInfo}
            className="gap-2"
          >
            <Bug className="h-4 w-4" />
            {showDebugInfo ? "Hide Debug" : "Show Debug"}
          </Button>
        </div>

        {stats && stats.length > 0 ? (
          <StatsContent stats={stats} />
        ) : (
          <EmptyStatsState 
            onRefresh={handleRefreshAllStats}
            isRefreshing={isRefreshing}
          />
        )}
        
        {showDebugInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-100 p-4 rounded">
                  <h3 className="font-medium mb-2">Summary</h3>
                  <ul className="list-disc list-inside">
                    <li>Total Games: {debugData.gameCount}</li>
                    <li>Total Players: {debugData.playerCount}</li>
                    <li>Raw Game Stats: {debugData.rawGameStats.length}</li>
                    <li>Player Stats: {debugData.playerStats.length}</li>
                  </ul>
                </div>
                <div className="bg-slate-100 p-4 rounded">
                  <h3 className="font-medium mb-2">Processed Stats</h3>
                  <p>{stats?.length || 0} total processed stats found</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Raw Game Stats</h3>
                <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(debugData.rawGameStats.slice(0, 10), null, 2)}
                  {debugData.rawGameStats.length > 10 && 
                    `\n... and ${debugData.rawGameStats.length - 10} more items`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Player Stats Table</h3>
                <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(debugData.playerStats.slice(0, 10), null, 2)}
                  {debugData.playerStats.length > 10 && 
                    `\n... and ${debugData.playerStats.length - 10} more items`}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
