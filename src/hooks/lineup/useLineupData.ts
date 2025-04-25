
import { useState, useEffect, useRef, useCallback } from 'react';
import { Team, Lines } from '@/types';
import { getTeamLineup } from '@/services/teams/lineup';
import { buildInitialLines } from '@/utils/lineupUtils';
import { toast } from 'sonner';

export function useLineupData(team: Team, refreshKey: number = 0) {
  const [lines, setLines] = useState<Lines>(() => buildInitialLines(team));
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [error, setError] = useState<Error | null>(null);
  const [hasPositionData, setHasPositionData] = useState<boolean>(false);
  
  const lineupDataRef = useRef<any[]>([]);
  const previousTeamIdRef = useRef<string | null>(null);
  const hasInitializedRef = useRef<boolean>(false);

  const fetchLineup = useCallback(async (forceRefresh = false) => {
    try {
      setLoadingState('loading');
      console.log("useLineupData - Fetching lineup for team:", team.id);
      
      const lineupData = await getTeamLineup(team.id);
      console.log("useLineupData - Retrieved lineup data:", lineupData);
      
      lineupDataRef.current = lineupData;
      
      const positionData = lineupData.filter(player => player.position !== null);
      setHasPositionData(positionData.length > 0);
      
      if (positionData.length === 0) {
        console.log("useLineupData - No position data found in lineup data");
        if (!forceRefresh && !hasInitializedRef.current) {
          toast.info("Starting with an empty lineup. Add players to positions to create your lineup.", {
            id: 'no-lineup-data',
            duration: 5000,
          });
        }
      }
      
      // Create a player map using team_member.id as the key (not user_id)
      const playerPositionsMap = new Map();
      lineupData.forEach(member => {
        if (member.position) {
          playerPositionsMap.set(member.id, {
            position: member.position,
            lineNumber: member.line_number
          });
        }
      });
      
      console.log("useLineupData - Player positions map:", Object.fromEntries(playerPositionsMap));
      
      // Apply positions to players in team.players array
      const updatedTeam = {
        ...team,
        players: team.players.map(player => {
          // Check if this player has position data using player's id (which is team_member.id)
          const positionInfo = playerPositionsMap.get(player.id);
          if (positionInfo) {
            return {
              ...player,
              position: positionInfo.position,
              lineNumber: positionInfo.lineNumber
            };
          }
          return player;
        })
      };
      
      const refreshedLines = buildInitialLines(updatedTeam);
      console.log("useLineupData - Built lines structure:", refreshedLines);
      
      setLines(refreshedLines);
      setLoadingState('success');
      setLastRefreshed(new Date());
      setError(null);
      hasInitializedRef.current = true;
      
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
    refreshLineup: fetchLineup,
    lineupData: lineupDataRef.current
  };
}
