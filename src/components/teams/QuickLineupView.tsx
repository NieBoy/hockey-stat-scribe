
import { useState, useEffect } from 'react';
import { Team, Lines } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { getTeamLineup } from '@/services/teams/lineupManagement';
import { buildInitialLines } from '@/utils/lineupUtils';
import { NonDraggableLineupView } from './lineup/NonDraggableLineupView';
import { Button } from '@/components/ui/button';

interface QuickLineupViewProps {
  team: Team;
}

export function QuickLineupView({ team }: QuickLineupViewProps) {
  const [lines, setLines] = useState<Lines>(() => buildInitialLines(team));
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');
  
  // Force refresh key to trigger a re-fetch when needed
  const [refreshKey, setRefreshKey] = useState(0);

  // Add timestamp to track when data was last refreshed
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  // Use a ref to prevent running the effect during the initial render
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    const fetchLineup = async () => {
      try {
        setLoadingState('loading');
        console.log("QuickLineupView - Fetching lineup for team:", team.id);
        
        const lineupData = await getTeamLineup(team.id);
        console.log("QuickLineupView - Retrieved lineup data:", lineupData);
        
        if (!lineupData || lineupData.length === 0) {
          console.log("QuickLineupView - No lineup data found, using initial lines");
          setLines(buildInitialLines(team));
          setLoadingState('success');
          setLastRefreshed(new Date());
          return;
        }
        
        // Apply positions from database to the team players
        const updatedTeam = {
          ...team,
          players: team.players.map(player => {
            const lineupPlayer = lineupData.find(lp => lp.user_id === player.id);
            if (lineupPlayer && lineupPlayer.position) {
              return {
                ...player,
                position: lineupPlayer.position,
                lineNumber: lineupPlayer.line_number
              };
            }
            return player;
          })
        };
        
        const refreshedLines = buildInitialLines(updatedTeam);
        console.log("QuickLineupView - Built lines structure:", refreshedLines);
        setLines(refreshedLines);
        setLoadingState('success');
        setLastRefreshed(new Date());
      } catch (error) {
        console.error("QuickLineupView - Error fetching lineup:", error);
        setLoadingState('error');
      }
    };
    
    fetchLineup();
    
    // Set up auto-refresh every 15 seconds
    const intervalId = setInterval(() => {
      console.log("QuickLineupView - Auto-refreshing lineup data");
      setRefreshKey(prevKey => prevKey + 1);
    }, 15000);
    
    return () => clearInterval(intervalId);
  }, [team, refreshKey]); 

  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1); // Increment key to force re-fetch
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Current Lineup</CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={loadingState === 'loading'}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            
            {loadingState === 'loading' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Loading...
              </Badge>
            )}
            {loadingState === 'error' && (
              <Badge variant="destructive">
                Error Loading Lineup
              </Badge>
            )}
            {loadingState === 'success' && lastRefreshed && (
              <Badge variant="outline" className="text-xs">
                Updated {lastRefreshed.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <NonDraggableLineupView lines={lines} />
      </CardContent>
    </Card>
  );
}
