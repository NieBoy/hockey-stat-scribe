
import { useState, useEffect } from 'react';
import { Team, Lines } from '@/types';
import { getTeamLineup } from '@/services/teams/lineupManagement';
import { buildInitialLines } from '@/utils/lineupUtils';
import { toast } from 'sonner';

export function useLineupData(team: Team, refreshKey: number) {
  const [lines, setLines] = useState<Lines>(() => buildInitialLines(team));
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [error, setError] = useState<Error | null>(null);
  const [hasPositionData, setHasPositionData] = useState<boolean>(false);

  useEffect(() => {
    const fetchLineup = async () => {
      try {
        setLoadingState('loading');
        console.log("useLineupData - Fetching lineup for team:", team.id);
        
        const lineupData = await getTeamLineup(team.id);
        console.log("useLineupData - Retrieved lineup data:", lineupData);
        
        // Check if we have any position data at all
        const positionData = lineupData.filter(player => player.position !== null);
        setHasPositionData(positionData.length > 0);
        
        if (positionData.length === 0) {
          console.log("useLineupData - No position data found in lineup data");
          toast.info("No lineup data found. Please set up your lineup.", {
            id: 'no-lineup-data',
            duration: 3000,
          });
        }
        
        if (!lineupData || lineupData.length === 0) {
          console.log("useLineupData - No lineup data found, using initial lines");
          setLines(buildInitialLines(team));
          setLoadingState('success');
          setLastRefreshed(new Date());
          setError(null);
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
        console.log("useLineupData - Built lines structure:", refreshedLines);
        
        // Count players in positions to verify the structure was built correctly
        const forwardCount = refreshedLines.forwards.reduce((count, line) => {
          return count + 
            (line.leftWing ? 1 : 0) + 
            (line.center ? 1 : 0) + 
            (line.rightWing ? 1 : 0);
        }, 0);
        
        const defenseCount = refreshedLines.defense.reduce((count, pair) => {
          return count + 
            (pair.leftDefense ? 1 : 0) + 
            (pair.rightDefense ? 1 : 0);
        }, 0);
        
        console.log("useLineupData - Player counts in lines:", {
          forwards: forwardCount,
          defense: defenseCount,
          goalies: refreshedLines.goalies.length
        });
        
        setLines(refreshedLines);
        setLoadingState('success');
        setLastRefreshed(new Date());
        setError(null);
      } catch (error) {
        console.error("useLineupData - Error fetching lineup:", error);
        setLoadingState('error');
        setError(error instanceof Error ? error : new Error('Unknown error fetching lineup data'));
        toast.error("Failed to load lineup data", {
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };
    
    fetchLineup();
  }, [team, refreshKey]);

  return {
    lines,
    loadingState,
    lastRefreshed,
    error,
    setLines,
    hasPositionData
  };
}
