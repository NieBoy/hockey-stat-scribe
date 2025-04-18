
import { useState, useEffect, useRef, useCallback } from 'react';
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
  
  // Cache the latest lineup data
  const lineupDataRef = useRef<any[]>([]);
  
  // Add a ref to track previous team ID to detect team changes
  const previousTeamIdRef = useRef<string | null>(null);

  // Create a memoized fetchLineup function that we can call both in the effect and externally
  const fetchLineup = useCallback(async (forceRefresh = false) => {
    try {
      setLoadingState('loading');
      console.log("useLineupData - Fetching lineup for team:", team.id);
      
      const lineupData = await getTeamLineup(team.id);
      console.log("useLineupData - Retrieved lineup data:", lineupData);
      
      // Store the lineup data in the ref for future use
      lineupDataRef.current = lineupData;
      
      // Check if we have any position data at all
      const positionData = lineupData.filter(player => player.position !== null);
      setHasPositionData(positionData.length > 0);
      
      if (positionData.length === 0) {
        console.log("useLineupData - No position data found in lineup data");
        if (!forceRefresh) {  // Only show toast on regular loads, not forced refreshes
          toast.info("No lineup data found. Please set up your lineup.", {
            id: 'no-lineup-data',
            duration: 3000,
          });
        }
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
      
      // Add the line information directly to the team object for better accessibility
      team.lines = refreshedLines;
      
      return refreshedLines;
    } catch (error) {
      console.error("useLineupData - Error fetching lineup:", error);
      setLoadingState('error');
      setError(error instanceof Error ? error : new Error('Unknown error fetching lineup data'));
      toast.error("Failed to load lineup data", {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }, [team]);

  useEffect(() => {
    // Determine if we should force a refresh based on team change
    const shouldForceRefresh = previousTeamIdRef.current !== team.id;
    if (shouldForceRefresh) {
      console.log(`useLineupData - Team changed from ${previousTeamIdRef.current} to ${team.id}, forcing refresh`);
    }
    previousTeamIdRef.current = team.id;
    
    fetchLineup(shouldForceRefresh);
  }, [team, refreshKey, fetchLineup]);

  return {
    lines,
    loadingState,
    lastRefreshed,
    error,
    setLines,
    hasPositionData,
    refreshLineup: fetchLineup,  // Export the function to allow manual refreshes
    lineupData: lineupDataRef.current  // Export the raw lineup data
  };
}
