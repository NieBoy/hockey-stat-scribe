import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface StatsProcessingStatusProps {
  playerId?: string;
  gameId?: string;
  onRefresh?: () => void;
  className?: string;
}

export default function StatsProcessingStatus({ 
  playerId, 
  gameId,
  onRefresh,
  className
}: StatsProcessingStatusProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    eventCount: 0,
    gameStatsCount: 0,
    playerStatsCount: 0,
    lastChecked: new Date()
  });

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      
      // Count events
      const eventQuery = supabase
        .from('game_events')
        .select('id', { count: 'exact' });
      
      if (playerId) {
        // Cannot directly query JSONB contains with player ID in one query
        // We'll fetch and then filter on the client side
      } else if (gameId) {
        eventQuery.eq('game_id', gameId);
      }
      
      const { count: eventCount, error: eventError } = await eventQuery;
      
      if (eventError) {
        toast.error('Failed to fetch events status');
        console.error(eventError);
        return;
      }
      
      // Count game stats
      const gameStatsQuery = supabase
        .from('game_stats')
        .select('id', { count: 'exact' });
      
      if (playerId) {
        gameStatsQuery.eq('player_id', playerId);
      } else if (gameId) {
        gameStatsQuery.eq('game_id', gameId);
      }
      
      const { count: gameStatsCount, error: gameStatsError } = await gameStatsQuery;
      
      if (gameStatsError) {
        toast.error('Failed to fetch game stats status');
        console.error(gameStatsError);
        return;
      }
      
      // Count player stats
      const playerStatsQuery = supabase
        .from('player_stats')
        .select('id', { count: 'exact' });
      
      if (playerId) {
        playerStatsQuery.eq('player_id', playerId);
      }
      
      const { count: playerStatsCount, error: playerStatsError } = await playerStatsQuery;
      
      if (playerStatsError) {
        toast.error('Failed to fetch player stats status');
        console.error(playerStatsError);
        return;
      }
      
      setStats({
        eventCount: eventCount || 0,
        gameStatsCount: gameStatsCount || 0,
        playerStatsCount: playerStatsCount || 0,
        lastChecked: new Date()
      });
    } catch (error) {
      console.error('Error fetching stats status:', error);
      toast.error('An error occurred while checking stats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [playerId, gameId]);

  const handleRefresh = () => {
    fetchStatus();
    if (onRefresh) onRefresh();
  };

  const getConversionRate = () => {
    if (stats.eventCount === 0) return 0;
    return Math.round((stats.gameStatsCount / stats.eventCount) * 100);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          Stats Processing Status
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted p-3 rounded text-center">
            <p className="text-xs text-muted-foreground">Events</p>
            <p className="text-lg font-medium">{stats.eventCount}</p>
          </div>
          <div className="bg-muted p-3 rounded text-center">
            <p className="text-xs text-muted-foreground">Raw Stats</p>
            <p className="text-lg font-medium">{stats.gameStatsCount}</p>
          </div>
          <div className="bg-muted p-3 rounded text-center">
            <p className="text-xs text-muted-foreground">Player Stats</p>
            <p className="text-lg font-medium">{stats.playerStatsCount}</p>
          </div>
        </div>

        {stats.eventCount > 0 && stats.gameStatsCount === 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Processing Issue Detected</AlertTitle>
            <AlertDescription>
              You have {stats.eventCount} events but 0 game stats. This indicates events are not being processed correctly.
            </AlertDescription>
          </Alert>
        )}

        {stats.gameStatsCount > 0 && stats.playerStatsCount === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Aggregation Issue</AlertTitle>
            <AlertDescription>
              Raw stats are not being aggregated into player stats. Try refreshing the player stats.
            </AlertDescription>
          </Alert>
        )}

        {stats.eventCount > 0 && getConversionRate() < 50 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Low Conversion Rate</AlertTitle>
            <AlertDescription>
              Only {getConversionRate()}% of events have converted to stats. Some events might not be processed correctly.
            </AlertDescription>
          </Alert>
        )}

        <p className="text-xs text-muted-foreground text-right">
          Last checked: {stats.lastChecked.toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
