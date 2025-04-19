import MainLayout from "@/components/layout/MainLayout";
import { DataTable } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ColumnDef } from "@tanstack/react-table";
import { PlayerStat } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

// Helper function to make stat types more readable
const formatStatType = (statType: string): string => {
  switch(statType) {
    case 'goals': return 'Goals';
    case 'assists': return 'Assists';
    case 'faceoffs': return 'Faceoffs';
    case 'hits': return 'Hits';
    case 'penalties': return 'Penalties';
    case 'saves': return 'Saves';
    case 'plusMinus': return 'Plus/Minus';
    default: return statType;
  }
};

// Helper to get stat color based on the statType
const getStatTypeColor = (statType: string): string => {
  switch(statType) {
    case 'goals': return 'bg-red-100 text-red-800';
    case 'assists': return 'bg-blue-100 text-blue-800';
    case 'faceoffs': return 'bg-amber-100 text-amber-800';
    case 'hits': return 'bg-purple-100 text-purple-800';
    case 'penalties': return 'bg-orange-100 text-orange-800';
    case 'saves': return 'bg-green-100 text-green-800';
    case 'plusMinus': return 'bg-sky-100 text-sky-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Direct function to get player stats from the database
const getPlayerStats = async (): Promise<PlayerStat[]> => {
  console.log("Fetching player stats from database");
  
  const { data, error } = await supabase
    .from('player_stats')
    .select('id, player_id, stat_type, value, games_played, users(name)')
    .order('value', { ascending: false });
    
  if (error) {
    console.error("Error fetching player stats:", error);
    throw error;
  }
  
  console.log("Received player stats data:", data);
  
  // Transform the data to match our PlayerStat type
  return (data || []).map(stat => ({
    playerId: stat.player_id,
    statType: stat.stat_type,
    value: stat.value,
    gamesPlayed: stat.games_played,
    playerName: stat.users ? (stat.users as any).name : 'Unknown Player'
  }));
};

// Function to recalculate all player stats
const refreshAllPlayerStats = async (): Promise<void> => {
  console.log("Refreshing all player stats");
  
  // Get all players with game stats
  const { data: players, error: playersError } = await supabase
    .from('game_stats')
    .select('player_id')
    .eq('player_id', 'player_id') // Add a dummy condition to avoid distinct()
    .then(result => {
      // Process the result to get unique player IDs
      if (result.data) {
        const uniquePlayerIds = [...new Set(result.data.map(row => row.player_id))];
        return {
          ...result,
          data: uniquePlayerIds.map(id => ({ player_id: id }))
        };
      }
      return result;
    });
    
  if (playersError) {
    console.error("Error getting players with stats:", playersError);
    throw playersError;
  }
  
  console.log(`Found ${players?.length || 0} players with game stats`);
  
  // For each player, calculate their stats
  if (players && players.length > 0) {
    for (const player of players) {
      await refreshPlayerStats(player.player_id);
    }
  }
};

// Function to calculate stats for a single player
const refreshPlayerStats = async (playerId: string): Promise<void> => {
  try {
    console.log(`Refreshing stats for player ${playerId}`);
    
    // Get all game stats for this player
    const { data: gameStats, error: gameStatsError } = await supabase
      .from('game_stats')
      .select('stat_type, value, game_id')
      .eq('player_id', playerId);
      
    if (gameStatsError) {
      console.error(`Error fetching game stats for player ${playerId}:`, gameStatsError);
      return;
    }
    
    if (!gameStats || gameStats.length === 0) {
      console.log(`No game stats found for player ${playerId}`);
      return;
    }
    
    // Calculate stats summary by type
    const statsSummary = new Map<string, { value: number, games: Set<string> }>();
    
    gameStats.forEach(stat => {
      const statType = stat.stat_type;
      const currentStat = statsSummary.get(statType) || { value: 0, games: new Set() };
      
      currentStat.value += stat.value;
      currentStat.games.add(stat.game_id);
      
      statsSummary.set(statType, currentStat);
    });
    
    // Update each stat type for this player
    for (const [statType, data] of statsSummary.entries()) {
      // Check if this stat already exists
      const { data: existingStat, error: checkError } = await supabase
        .from('player_stats')
        .select('id')
        .eq('player_id', playerId)
        .eq('stat_type', statType)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected
        console.error(`Error checking for existing stat for player ${playerId}:`, checkError);
        continue;
      }
      
      if (existingStat) {
        // Update existing stat
        console.log(`Updating existing ${statType} stat for player ${playerId}`);
        const { error: updateError } = await supabase
          .from('player_stats')
          .update({
            value: data.value,
            games_played: data.games.size
          })
          .eq('id', existingStat.id);
          
        if (updateError) {
          console.error(`Error updating ${statType} stat for player ${playerId}:`, updateError);
        }
      } else {
        // Insert new stat
        console.log(`Creating new ${statType} stat for player ${playerId}`);
        const { error: insertError } = await supabase
          .from('player_stats')
          .insert({
            player_id: playerId,
            stat_type: statType,
            value: data.value,
            games_played: data.games.size
          });
          
        if (insertError) {
          console.error(`Error inserting ${statType} stat for player ${playerId}:`, insertError);
        }
      }
    }
    
    console.log(`Successfully refreshed stats for player ${playerId}`);
  } catch (error) {
    console.error(`Error in refreshPlayerStats for ${playerId}:`, error);
  }
};

export default function Stats() {
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['playerStats'],
    queryFn: getPlayerStats,
  });
  
  const handleRefreshAllStats = async () => {
    setIsRefreshing(true);
    try {
      await refreshAllPlayerStats();
      toast({
        title: "Stats Refreshed",
        description: "All player statistics have been recalculated."
      });
      // Refetch the stats after recalculation
      await refetch();
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh statistics."
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const columns: ColumnDef<PlayerStat>[] = [
    {
      accessorKey: "playerId",
      header: "Player",
      cell: ({ row }) => row.original.playerName || row.original.playerId,
    },
    {
      accessorKey: "statType",
      header: "Stat Type",
      cell: ({ row }) => (
        <Badge className={getStatTypeColor(row.original.statType)}>
          {formatStatType(row.original.statType)}
        </Badge>
      ),
    },
    {
      accessorKey: "value",
      header: "Total",
    },
    {
      accessorKey: "gamesPlayed",
      header: "Games",
    },
    {
      accessorKey: "average",
      header: "Average",
      cell: ({ row }) => {
        const average = row.original.gamesPlayed > 0 
          ? (row.original.value / row.original.gamesPlayed).toFixed(2) 
          : "0.00";
        return average;
      },
    },
  ];

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
          <div className="mt-4">
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Player Statistics</h1>
            <p className="text-muted-foreground">View and analyze player performance</p>
          </div>
          <Button 
            onClick={handleRefreshAllStats} 
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All Stats
          </Button>
        </div>

        {stats && stats.length > 0 ? (
          <Card>
            <DataTable
              columns={columns}
              data={stats}
              searchKey="playerId"
            />
          </Card>
        ) : (
          <div className="text-center p-8 border rounded-lg bg-muted/10">
            <h2 className="text-xl font-semibold mb-2">No Stats Available</h2>
            <p className="mb-6">No player statistics were found. This could be because:</p>
            <ul className="list-disc list-inside mb-6 text-left max-w-md mx-auto">
              <li>No games have been played yet</li>
              <li>No stats have been recorded during games</li>
              <li>Stats need to be recalculated from game data</li>
            </ul>
            <Button onClick={handleRefreshAllStats} disabled={isRefreshing}>
              Calculate Stats from Game Data
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
